var executions = '/pals/executions';
var localDatabase = '/pals/data';

var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var async = require('async');
var uuid = require('node-uuid');
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
            callback(err, message);
            process.chdir(originalDir);
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

exports.copyFileToDataDir = function(file, callback) {
    if (file.error) {
        callback(null, file);
        return;
    }
    var read = fs.createReadStream(file.filename);
    read.on('error', function(err) {
        callback(err, file);
    });
    file.key = uuid.v4();
    file.path = localDatabase + '/' + file.key;
    var write = fs.createWriteStream(file.path);
    write.on('error', function(err) {
        callback(err, file);
    });
    write.on('close', function(ex) {
        callback(null, file);
    })
    read.pipe(write);
};

exports.copyFilesToDataDir = function(output, callback) {

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
        exports.copyFileToDataDir(output.files[i],function(err,file){
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
        console.log('processing message: ' + message._id);
        result = exports.createDir(message);
        console.log('Created working directory');
        exports.writeInput(result, function(inputWritten) {
            console.log('Wrote input file');
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
                            exports.copyFilesToDataDir(output, function(err, copiedToDataDir) {
                                console.log('Moved files to data dir');
                                exports.removeDirectory(copiedToDataDir);
                                sendMessage(copiedToDataDir);
                            });
                        });
                    }
                });
            });
        });
    });
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
