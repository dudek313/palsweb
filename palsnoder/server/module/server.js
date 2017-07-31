var executions = '/pals/executions';
var localDatabase = '/pals/data/plots';

var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var async = require('async');
var uuid = require('uuid');
var domain = require('domain');

exports.getLocalDatabase = function() {
    return localDatabase;
}

exports.createDir = function(message) {
    var dirName = executions + '/' + message._id;
    if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);
    message.dir = dirName;
    return message;
};

exports.prepareScript = function(message, callback) {
    var scriptFilename = message.dir + '/rRunner.r';
    var experimentScript = '';
    for (var i = 0; i < message.files.length; ++i) {
        var file = message.files[i];
        if (file.type == 'Script') {
            experimentScript = file.path;
        }
    }
    if (experimentScript.length <= 0) throw new Error('Please upload an experiment script to run');
    var inputString = '';
    inputString += 'library("RJSONIO")\n';
    inputString += 'inputFile <- "input.json"\n';
    inputString += 'input <- fromJSON(paste(readLines(inputFile), collapse=""))\n';
    inputString += 'source("' + experimentScript + '")\n';
    inputString += 'output <- toJSON(output)\n';
    inputString += 'fileConn<-file("' + message.dir + '/output.json")\n';
    inputString += 'writeLines(output, fileConn)\n';
    inputString += 'close(fileConn)\n';

    fs.writeFile(scriptFilename, inputString, function(err) {
        if (err) throw err
        message.scriptFilename = scriptFilename;
        callback(message);
    });
};

exports.writeInput = function(message, callback) {
    var inputFilename = message.dir + '/input.json';
    var stream = fs.createWriteStream(inputFilename);
    stream.once('open', function(fd) {
        stream.write(JSON.stringify(message) + '\n')
        stream.end();
        message.inputFilename = inputFilename;
        callback(message);
    });
}

exports.executeScript = function(message, callback) {
    console.log('about to execute script');
    var scriptFilename = message.scriptFilename;
    console.log('script filename: ' + scriptFilename);
    var exec = require('child_process').exec;
    console.log('about to get original dir');
    var originalDir = process.cwd();
    console.log('here')
    console.log('changing dir: ' + message.dir);
    process.chdir(message.dir);
    console.log('running script: ' + scriptFilename);
    exec('R --no-save < ' + scriptFilename, function(err, stdout, stderr) {
        console.log('exec finished');
        if (err) {
            process.chdir(originalDir);
            callback(err, message);
        } else {
            //console.log(stdout);
            message.outputFilename = message.dir + '/' + 'output.json';
            process.chdir(originalDir);
            callback(null, message);
        }
    });
}

exports.readOutput = function(message, callback) {
    console.log('Reading output file');
    console.log('Path: ' + message.outputFilename);
    fs.readFile(message.outputFilename, 'utf8', function(err, data) {
        if (err) callback(err);
        else {
            var output = JSON.parse(data);
            output._id = message._id;
            callback(null, message, output);
        }
    });
}

exports.copyFileToPublicStore = function(file, callback) {
    if (file.error) {
        callback(null, file);
        return;
    }

    var client = require('pkgcloud').storage.createClient({
        provider: 'openstack',
        username: process.env.OS_USERNAME,
        password: process.env.OS_PASSWORD,
        tenantId: "2bcd99d3e00d418fb799bfabf82572de",
        region: 'Melbourne',
        authUrl: process.env.OS_AUTH_URL,
        version: process.env.version
    });

    var options = {
      container: 'public-store',
      remote: file.filename
    };

  console.log('Uploading to public-store: ' + file.filename);

    var read = fs.createReadStream(file.filename);
    read.on('error', function(err) {
    console.log('Error reading file: ' + file.filename);
        callback(err, file);
    });

    var write = client.upload(options);
    write.on('error', function(err) {
    console.log('Error uploading to public-store: ' + file.filename);
        callback(err, file);
    });
    write.on('success', function(ex) {
    console.log('Uploaded ' + file.filename);
        callback(null, file);
    })
    read.pipe(write);
};

exports.copyFilesToPublicStore = function(output, callback) {

    if (output.error) {
        callback(output.error);
        return;
    }

    var i = 0;

    var processFile = function() {
        if( i >= output.files.length ) {
            callback(null,output);
            return;
        }

        // if error is 'ok' we remove it
        if( output.files[i].error && output.files[i].error == "ok" ) delete output.files[i].error;

        output.files[i].dir = output.dir;
        exports.copyFileToPublicStore(output.files[i],function(err,file){
            if( err ) {
                console.log(err);
            }
            processFile(++i);
        })
    };

    processFile();
};

exports.deleteFile = function(file, callback) {
    fs.unlink(file.path, function() {
        callback();
    });
}

exports.handleMessage = function(message, sendMessage) {

    var d = domain.create();
    d.on('error', function(err) {
        console.log(err.message);
        exports.removeDirectory(message);
        message.error = err.message;
        sendMessage(message);
    });

    d.run(function() {
        if (!fs.existsSync(localDatabase)) fs.mkdirSync(localDatabase);
        console.log('processing message: ' + message._id);
        result = exports.createDir(message);
        console.log('Created working directory');
        exports.writeInput(result, function(inputWritten) {
            console.log('Wrote input file');
      exports.downloadFiles(message, function(err) {
        if (err) {
          throw new Error(err); 
        } else {
          console.log('Preparing script');
          exports.prepareScript(inputWritten, function(preparedScript) {
            console.log('Prepared script');
            exports.executeScript(preparedScript, function(err, executedScript) {
              console.log('Executed script');
              fs.unlinkSync(executedScript.scriptFilename);
              fs.unlinkSync(executedScript.inputFilename);
              console.log('Deleted script and input file');
              if (err) {
                throw new Error(err);
              } else {
                exports.readOutput(executedScript, function(err, outputRead, output) {
                  console.log('Read output file');
                  fs.unlinkSync(outputRead.outputFilename);
                  console.log('Deleted output file');
                  console.log('Uploading plot files to public store');
                  exports.copyFilesToPublicStore(output, function(err, copiedToPublicStore) {
                    console.log('Plot file upload completed');
                    exports.removeDirectory(copiedToPublicStore);
                    sendMessage(copiedToPublicStore);
                  });
                });
              }
            });
          });
        }
      });
        });
    });
}

exports.downloadFiles = function(message, callback) {

    if (message.error) {
        callback(message.error);
        return;
    }

    var i = 0;

    var processFile = function() {
        if( i >= message.files.length ) {
      console.log('Finished downloading from object storage');
            callback(null);
            return;
        }

    file = message.files[i];

        // if error is 'ok' we remove it
        if( file.error && file.error == "ok" ) delete file.error;

        if (file.type == 'DataSet' || file.type == 'ModelOutput' || file.type == 'Benchmark' || file.type == 'Script') {
          console.log('Downloading from object storage: ' + file.path); 
          exports.downloadObject(file, function(err,fileResult){
              if( err ) {
                  throw new Error(err);
              }
              processFile(++i);
          });
        } else {
          processFile(++i);
        }
    };

    processFile();
};

exports.downloadObject = function(file, callback) {
    if (!fs.existsSync('/dataSets')) fs.mkdirSync('/dataSets');
    if (!fs.existsSync('/modelOutputs')) fs.mkdirSync('/modelOutputs');
  

  var client = require('pkgcloud').storage.createClient({
    provider: 'openstack',
    username: process.env.OS_USERNAME,
    password: process.env.OS_PASSWORD,
    tenantId: "2bcd99d3e00d418fb799bfabf82572de",
    region: 'Melbourne',
    authUrl: process.env.OS_AUTH_URL,
    version: process.env.version
  });

  var options = {
    container: 'data-store',
    remote: file.path
  };

  var read = client.download(options);
    read.on('error', function(err) {
        callback(err);
    });


    var write = fs.createWriteStream(file.path);

    write.on('error', function(err) {
        callback(err);
    });

    write.on('close', function(ex) {
        callback(null);
    })
    read.pipe(write);
}
 
exports.removeDirectory = function(message) {
    if (message.dir && fs.existsSync(message.dir)) {
        var contents = fs.readdirSync(message.dir);
        if (contents && contents.length > 0) {
            for (var i = 0; i < contents.length; ++i) {
                var file = contents[i];
                if (fs.existsSync) fs.unlinkSync(message.dir + '/' + file);
            }
        }
        fs.rmdirSync(message.dir);
    }
}
