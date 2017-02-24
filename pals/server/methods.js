var queue = 'pals.input';
SimpleSchema.debug = true;

var redis = require("redis");
var REDIS_HOST = process.env.REDIS_HOST;
if( !REDIS_HOST ) REDIS_HOST = '127.0.0.1';
var REDIS_PORT = process.env.REDIS_PORT;
if( !REDIS_PORT ) REDIS_PORT = 6379;
var client = redis.createClient(REDIS_PORT,REDIS_HOST);

FILE_BUCKET = '/pals/data/';
var fileBucket = FILE_BUCKET;
var fs = Npm.require('fs');

/*
// Initialize Logger:
this.serverLog = new Logger();

// Initialize LoggerFile and enable with default settings:
var serverLogFile = new LoggerFile(serverLog, {
  fileNameFormat: function() {return 'server.log'},
  path: '/pals/logs/'
}).enable({
  enable: true,
  client: false,
  server: true
});
*/

var pkgcloud = require('pkgcloud')

var swiftClient = pkgcloud.storage.createClient({
  provider: 'openstack',
  username: process.env.OS_USERNAME,
  password: process.env.OS_PASSWORD,
  tenantId: "2bcd99d3e00d418fb799bfabf82572de",
  region: 'Melbourne',
  authUrl: process.env.OS_AUTH_URL,
  version: process.env.version
});
/*
var options = {
  container: 'public-store',
  remote: 'testpath'
};

var writeStream = swiftClient.upload(options);
writeStream.on('error', function(err) {
  console.log(err);
});

writeStream.on('success', function(file) {
  console.log('Success: file: ' + file);
});
 
console.log('writeStream: ', writeStream);
*/
function generateError(errMsg, data, userId) {
    console.log('Error: ', errMsg, "UserId: ", userId);
    serverLog.error(errMsg, data, userId);
    throw new Meteor.Error(errMsg);
}

function generateMessage(msg, data, userId) {
  var dataContent = data ? data : "";
  console.log(msg, dataContent, "UserId: ", userId);
  serverLog.info(msg, data, userId);
}

Meteor.methods({
  'uploadFile': function(filePath, options) {

// need to add validation

    var readStream = fs.createReadStream(filePath);
    var writeStream = swiftClient.upload(options);
    var userId = this.userId;
    console.log('writeStream: ', writeStream);
    console.log('writeStreamFn: ', writeStream.on);

    writeStream.on('error', function(err) {
      generateError('Error uploading file', null, userId);
    });

    writeStream.on('success', function(file) {
      generateMessage("File upload successful", file, userId);
    });

    readStream.pipe(writeStream);
/*      bound(function() {
        var upd = {
          $set: {}
        };
        upd['$set']["versions." + version + ".meta.pipeFrom"] = endPoint + '/' + filePath;
        upd['$set']["versions." + version + ".meta.pipePath"] = filePath;
        self.collection.update({
          _id: fileRef._id
        }, upd, function(error) {
          if (error) {
            console.error(error);
          } else {
              // Unlink original files from FS
              // after successful upload to AWS:S3
            self.unlink(self.collection.findOne(fileRef._id), version);
          }
        });
      });
    });*/

    
  },

  'insertModelOutput': function(modelOutputDoc) {
    var userId = this.userId;
    generateMessage("Inserting model output", getDetails(modelOutputDoc), userId);
    if (modelOutputDoc) {
      if( !userId ) {
        generateError("not-authorized", null, userId);
      }
      else {
        var moId = ModelOutputs.insert(modelOutputDoc);
        var group = 'modelOutput ' + moId;
        if (!Roles.userIsInRole(userId, 'edit', group))
          Roles.addUsersToRoles(userId, 'edit', group);
        if (moId) generateMessage('Model output inserted', {_id: moId}, userId);
        return moId;
      }
    } else {
      generateError('No model output document provided to insert', null, userId);
    }
  },

  'updateModelOutput': function(currentDoc, updateDoc) {
      var userId = this.userId;
      generateMessage("Updating model output", getDetails(currentDoc), userId);
      var group = 'modelOutput ' + currentDoc._id;
      if (currentDoc && currentDoc._id) {
        var modelOutput = ModelOutputs.findOne(currentDoc);
        if( Roles.userIsInRole(userId, 'edit', group) ) {
            moResult = ModelOutputs.update(currentDoc, updateDoc);
            if (moResult == 1) {
              generateMessage("Model output updated", getDetails(currentDoc), userId);
            }
            return moResult;
        }
        else {
          generateError("not-authorized", null, userId);
        }
      } else {
        generateError("no model output document specified to update", getDetails(currentDoc), userId);
      }
  },

  'removeModelOutput': function(modelOutputDoc) {
      var userId = this.userId;
      generateMessage("Removing model output", getDetails(modelOutputDoc), userId);
      var group = 'modelOutput ' + modelOutputDoc._id;
      if (modelOutputDoc) {
        var modelOutput = ModelOutputs.findOne(modelOutputDoc);
        if( Roles.userIsInRole(userId, 'edit', group) ) {
          mo = ModelOutputs.remove(modelOutputDoc);
          if (mo == 1)
            generateMessage("Model output removed", modelOutputDoc._id, userId)
          return mo;
        }
        else {
          generateError("not-authorized", null, userId);
        }
      } else {
          generateError("no model output document specified to remove", null, userId);
      }
  },

  'insertDataSet': function(dataSetDoc) {
    var userId = this.userId;
    generateMessage("Inserting data set", getDetails(dataSetDoc), userId);
    if (dataSetDoc) {
      if( !Roles.userIsInRole(userId, 'edit', 'dataSets') ) {
        generateError("not-authorized", null, userId);
      }
      else {
        var dsId = DataSets.insert(dataSetDoc);
        if (dsId) generateMessage('Data set inserted', {_id:dsId}, userId);
        return dsId;
      }
    } else {
      generateError('No data set document provided to insert', null, userId);
    }
  },

  'updateDataSet': function(currentDoc, dataSetDoc) {
        var userId = this.userId;
        generateMessage("Updating data set", getDetails(currentDoc), userId);
        if (currentDoc && currentDoc._id) {
          var ds = DataSets.findOne(currentDoc);
          if( !Roles.userIsInRole(userId, 'edit', 'dataSets') ) {
            generateError('not-authorized', null, userId);
          }
          else {
            var result = DataSets.update(currentDoc, dataSetDoc);
            if (result == 1) generateMessage('Data set updated', getDetails(currentDoc), userId);
            return result;
          }
        } else {
          generateError('No data set document selected to update', null, userId);
        }

    },

    'removeDataSet': function(dataSetDoc) {
        var userId = this.userId;
        generateMessage("Removing data set", getDetails(dataSetDoc), userId);
        if (dataSetDoc && dataSetDoc._id) {
          var ds = DataSets.findOne(dataSetDoc);
          if( !Roles.userIsInRole(userId, 'edit', 'dataSets') ) {
            generateError('not-authorized', null, userId);
          } else {
            result = DataSets.remove(dataSetDoc);
            if (result == 1)
              generateMessage('Data set removed', dataSetDoc._id, userId);
            return result;
          }
        } else generateError('No data set selected', null, userId);
    },

    'updateExperiment': function(currentDoc, updateDoc) {
        var userId = this.userId;
        if (currentDoc.recordType)
          generateMessage("Updating experiment " + currentDoc.recordType, getDetails(currentDoc), userId);
        if (currentDoc && currentDoc._id) {
          var exp = Experiments.findOne(currentDoc);
          if( !Roles.userIsInRole(userId, 'edit', 'experiment ' + currentDoc._id) ) {
              generateError('not-authorized', null, userId);
          } else {
            var exp = Experiments.update(currentDoc, updateDoc);
            if (exp == 1) generateMessage('Experiment updated', getDetails(currentDoc), userId);
            return exp;
          }
        } else {
          generateError('No experiment document selected to update', null, userId);
        }
    },

    'insertExperiment': function(expDoc) {
        var userId = this.userId;
        var docId;
        if (expDoc) {
          if ((userId && expDoc.recordType == 'instance') ||
              (expDoc.recordType == 'template' && Roles.userIsInRole(userId, 'edit', 'experiments'))) {
            generateMessage("Inserting experiment " + expDoc.recordType, getDetails(expDoc), userId);
            docId = Experiments.insert(expDoc);
            var group = 'experiment ' + docId;
            if (!Roles.userIsInRole(userId, 'edit', group))
              Roles.addUsersToRoles(userId, 'edit', group);
            if (docId) generateMessage('Experiment ' + expDoc.recordType + " inserted", {_id: docId}, userId);
            return docId;
          }
          else {
            generateError('not-authorized', null, userId);
          }
        } else {
          generateError('No experiment document provided to insert', null, userId);
        }
    },

    'removeExperiment': function(expDoc) {
        var userId = this.userId;
        generateMessage("Removing experiment", getDetails(expDoc), userId);
        var group = 'experiment ' + expDoc._id;
        if (expDoc && expDoc._id) {
          var exp = Experiments.findOne(expDoc);
          if( !Roles.userIsInRole(userId, 'edit', group) ) {
            generateError('not-authorized', null, userId);
          }
          else {
            result = Experiments.remove(expDoc);
            if (result == 1) generateMessage('Experiment removed', null, userId);
            return result;
          }
        } else generateError('No experiment document specified to remove', null, userId);
    },

    'updateModel': function(currentDoc, modelDoc) {
        var userId = this.userId;
        generateMessage("Updating model", getDetails(currentDoc), userId);
        var group = 'model ' + currentDoc._id;
        if (currentDoc && currentDoc._id) {
//          var model = Models.findOne(currentDoc);
          var model = Models.findOne({_id: currentDoc._id});
          if( !Roles.userIsInRole(userId, 'edit', group)) {
              generateError('not-authorized', null, userId);
          }
          else {
              result = Models.update(currentDoc, modelDoc);
              if (result == 1)
                generateMessage('Model updated', getDetails(currentDoc), userId);
              return result;
          }
        } else {
          generateError('no model document specified to update', null, userId);
        }
    },

    'insertModel': function(modelDoc) {
      var userId = this.userId;
      generateMessage("Inserting model", getDetails(modelDoc), userId);
      if(modelDoc) {
        if( !userId ) {
          generateError('not-authorized', null, userId);
        }
        else if(Models.findOne({name:modelDoc.name, owner: userId })) {
          generateError('Model already exists with name: ' + modelDoc.name);
        }
        else {
          var docId = Models.insert(modelDoc);
          if (docId) generateMessage('Model inserted', {_id: docId}, userId);
          var group = 'model ' + docId;
          if (!Roles.userIsInRole(userId, 'edit', group))
            Roles.addUsersToRoles(userId, 'edit', group);
          return docId;
        }
      } else generateError('No model document provided to insert', null, userId);
    },

    'removeModel': function(modelDoc) {
        var userId = this.userId;
        generateMessage("Removing model", getDetails(modelDoc), userId);
        var group = 'model ' + modelDoc._id;
        if (modelDoc && modelDoc._id) {
          var model = Models.findOne(modelDoc);
          if( Roles.userIsInRole(userId, 'edit', group) ) {
            result = Models.remove(modelDoc);
            if (result == 1) generateMessage('Model removed', null, userId);
            return result;
          }
          else {
            generateError('not-authorized', null, userId);
          }
        } else generateError('no model document specified for removal', null, userId)
    },

    'insertWorkspace': function(name) {
        var userId = this.userId;
        generateMessage("Inserting workspace", name, userId);
        if (!name)
          generateError('Workspace was not given a name. Insert failed.');
        if( !userId ) {
          generateError('not-authorized', null, userId);
        }
        else if(Workspaces.findOne({name: name})) {
          generateError('There is already a workspace with name ' + name + ". Insert failed.");
        }
        else {
          var docId =  Workspaces.insert({owner: userId, name: name});
          var group = 'workspace ' + docId;
          if (Roles.userIsInRole(userId, 'edit', group))
            Roles.addUsersToRoles(userId, 'edit', group);
          if (docId) generateMessage('Workspace inserted', {_id: docId}, userId)
          return docId;
        }
    },

    'updateWorkspace': function(currentDoc, updateDoc) {
        var userId = this.userId;
        generateMessage("Updating workspace", currentDoc, userId);
        var group = 'workspace ' + currentDoc._id;
        if( !Roles.userIsInRole(userId, 'edit', group)) {
            generateError('not-authorized', null, userId);
        }
        else {
            var result = Workspaces.update(currentDoc, updateDoc);
            if (result == 1) generateMessage('Workspace updated', updateDoc, userId);
            return result;
        }

    },

    'changeWorkspace': function(workspaceId) {
      var userId = this.userId;
      var workspace = Workspaces.findOne({_id: workspaceId});
      if( userId && workspace ) {
        result = Meteor.users.update({_id: userId}, {$set: {'profile.currentWorkspace': workspaceId}});
        return result;
      } else {
        if (!userId) generateError('User not logged in', "Method: changeWorkspace", userId);
        else generateError('Workspace not found', workspaceId, userId);
      }
    },

    'removeWorkspace': function(workspaceDoc) {
      var userId = this.userId;
      generateMessage("Removing workspace", workspaceDoc, userId);
      var group = 'workspace ' + workspaceDoc._id;
      if ( !Roles.userIsInRole(userId, 'edit', group)) {
        generateError('not-authorized', null, userId)
      }
      else {
        var result = Workspaces.remove(workspaceDoc);
        if (result == 1)
          generateMessage('Workspace removed', null, userId)
        return result;
      }
/*      var workspace = Workspaces.findOne({_id: workspaceId});
      if( userId && workspace && workspace.owner && workspace.owner == userId) {
        return Workspaces.remove({_id: workspaceId});
      }
*/
    },

    // used to update 'dirty' status for NetCDF Files
    updateStoredFiles: function(_id, set) {
      check(_id, String);
      check(set, Object);
      check(set.meta, Object);
      check(set.meta.dirty, Boolean);
      var userId = this.userId;
      var file = StoredFiles.findOne({_id: _id});
      if (userId && file && file.userId == userId) {
        this.unblock();
        StoredFiles.update({_id: _id}, {$set: set});
        generateMessage('Setting file dirty status to ' + set.meta.dirty, {'_id': _id}, userId);
        return true;
      }
      else {
        return null;
      }
    },

    deleteAnalysis: function(id) {
        generateMessage('deleting analysis ' + id);
        var analysis = Analyses.findOne({_id:id});
        if( analysis ) {
             if( analysis.results && analysis.results.length > 0 ) {
                analysis.results.forEach(function(result) {
                    if (result && result.path) {
                        generateMessage('Deleting file ' + result.path)
                        deleteFile(result.path);
                    }
                });
             }
             Analyses.remove({'_id':id},function(error){
                  if( error ) generateMessage(error);
             });
        }
        return null;
    },

    removeFileByUrl: function(url) {
        fs.unlink(url,function(){
            generateMessage('deleted file ' + url);
        })
    },

    startAnalysis: function (modelOutputId) {

        console.log('starting analysis for model output ' + modelOutputId);

        // Confirm the existence of the model output in the mongodb
        var user = Meteor.user();
        var currentModelOutput = ModelOutputs.findOne({'_id':modelOutputId});
        console.log('Benchmarks: '); console.log(currentModelOutput.benchmarks);
        if( !currentModelOutput )
            generateError('Error: Unable to load model output.', "Model output Id: "+modelOutputId, userId);

        // Confirm there are experiments associated with the model output
        if( !currentModelOutput.experiments || currentModelOutput.experiments.length == 0 ) {
            generateError('Error: No experiment associated with model output', "Model output Id: "+modelOutputId, userId);
        }
        var experiment = Experiments.findOne({_id:currentModelOutput.experiments[0]});
        if (!experiment)
            generateError('Error: Unable to load experiment.', "Model output Id: "+modelOutputId, userId);

/*        if( currentModelOutput.versions ) {
            var currentVersion = undefined;
            currentModelOutput.versions.forEach(function(version) {
                if( version.key == key ) {
                    currentVersion = version;
                }
            });
        }
        if( currentVersion ) {*/

        // construct the input file for the analysis script
        else {
            // first include the model output details
            var files = new Array();
            var moFile = currentModelOutput.file;
            moFile.type = 'ModelOutput';
            moFile.name = currentModelOutput.name;
            moFile.number = "1";
            files.push(moFile);

            addDataSets(files, experiment.dataSets,'DataSet');

            addBenchmarks(files, currentModelOutput.benchmarks);

            // add the analysis script details
            if( !experiment.scripts || experiment.scripts.length <=0 ) {
                generateError('The chosen experiment does not have a script', "Model Output Id: " + modelOutputId, userId);
            }
            else {
                // using [0] just to test it out
                var script = experiment.scripts[0];
                script.type = 'Script';
                files.push(script);
            }

//            experimentModelOutputs = loadAllModelOutputsForExperimentExceptOne(experiment._id,currentModelOutput._id);

            var analysis = {
               'owner' : user._id,
               'created' : new Date(),
               'workspace' : user.profile.currentWorkspace,
               'modelOutput' : currentModelOutput._id,
               'modelOutputVersion' : '',
//               'modelOutputVersion' : currentVersion,
               'experiment' : experiment._id,
//               'status' : 'started',
               'status' : 'queued',
               'files' : files//,
               //'experimentModelOutputs' : experimentModelOutputs
           };

//           console.log('Input to analysis script: '); console.log(analysis);

           saveAnalysis(analysis, completeAnalysis);
//           saveAnalysis(analysis, checkPalsNodeRWorking);
           return analysis;
       }
       return null;
    }

});

getLatestVersion = function(dataSet,type) {
    if( dataSet.versions && dataSet.versions.length > 0 ) {
        for( var i = dataSet.versions.length-1; i >=0; --i ) {
             var version = dataSet.versions[i];
			 version.type = "DataSet";
             return version;
        }
    }
    return null;
}

addBenchmarks = function(files, benchmarkIds) {
    if (benchmarkIds && benchmarkIds.length > 0) {

        console.log('Number of benchmarks: ' + benchmarkIds.length);

        for (var i = 0; i < benchmarkIds.length; ++i ) {
            if(benchmarkIds[i]) {
                var benchmark = ModelOutputs.findOne({'_id':benchmarkIds[i]});
                console.log('processing benchmark: ' + benchmarkIds[i]);
    //        var version = getLatestVersion(dataSet);
    //        version.name = dataSet.name;
    //        if( version ) {
    //            files.push(version);
    //        }
                benchmark.file.type = 'Benchmark';
                benchmark.file.number = i + 1;
                files.push(benchmark.file);
                console.log('processing file: ' + benchmark.file.name);
            }
            else {
                generateError('Benchmark details invalid', benchmarkIds, userId);
            }

        }
    }
    else console.log('No benchmarks');

}

addDataSets = function(files,dataSets,type) {

    if( !dataSets || dataSets.length <= 0 ) {
        generateError('The chosen experiment does not have any data sets of type: '+type, null, userId);
    }

	console.log('Number of data sets: ' + dataSets.length);

    for( var i=0; i < dataSets.length; ++i ) {
        var dsDetails = dataSets[i];
        if(dsDetails && dsDetails._id) {
            var dataSet = DataSets.findOne({'_id':dsDetails._id});
            console.log('processing data set: ' + dsDetails._id);
    //        var version = getLatestVersion(dataSet);
    //        version.name = dataSet.name;
    //        if( version ) {
    //            files.push(version);
    //        }
            console.log('Files in data set: ' + dataSet.files.length);
            if (dataSet && dataSet.files && dataSet.files.length > 0)
                dataSet.files.forEach(function(file) {
                    file.type = 'DataSet';
                    file.number = "1";
                    files.push(file);
                    console.log('processing file: ' + file.name);
                });
            else {
                generateError('Data set details invalid', dataSet, userId);
            }

        }
        else
            generateError('Data set details invalid', dsDetails, userId);
    }
}

saveAnalysis = function(analysis,callback) {
    Analyses.insert(analysis,function(error,id) {
        if( error ) {
            console.log('Error saving analysis for model output: '+analysis.modelOutput);
        }
        else {
            console.log('analysis saved');
            analysis._id = id;
            callback(analysis);
        }
    });
}

/*
checkPalsNodeRWorking = function(analysis, callback) {
  console.log('Sending ping to PalsNodeR');
  client.rpush(queue, "ping");
  callback(analysis);
}
*/

completeAnalysis = function(analysis) {
    console.log('Sending message to redis');
    console.log(); console.log(analysis);
    client.rpush(queue, JSON.stringify(analysis));
}

deleteFile = function(path) {
    fs.unlink(path,function(error, doc){
        if(error) {
            console.log('Unable to delete file: ' + path);
        }
        else {
            console.log('File deleted');
        }
    });
}

/*
createFileRecord = function(fileName,fileSize,fileData) {
    var fileToken = Meteor.uuid();
    fs.writeFile(fileBucket+'/'+fileToken, fileData, 'binary');
    var fileRecord = {
        path: fileBucket+'/'+fileToken,
        filename: fileName,
        size: fileSize,
        key: fileToken,
        created: new Date()
    };
    return fileRecord;
}
*/
/**
 * Loads all the current versions of the model outputs which are associated with the given experiment.
 * A list of model output file records are returned.
 **/
loadAllModelOutputsForExperimentExceptOne = function(experimentId,modelOutputId) {
    var modelOutputs = ModelOutputs.find({'experiments':experimentId},{sort:{created:-1}});
    var versions = [];
    modelOutputs.forEach(function(modelOutput){
        if(modelOutput._id != modelOutputId) {
//            version = extractLatestVersion(modelOutput);
            version = modelOutput.file;
            if( version ) versions.push(version);
        }
    });
    return versions;
}

/**
 * Returns the version of the given model output with the most recent created date.
 **/
extractLatestVersion = function(modelOutput) {
    mostRecentVersion = undefined;
    modelOutput.versions.forEach(function(version){
        if(mostRecentVersion) {
            if( version.created > mostRecentVersion.created ) {
                mostRecentVersion = version;
            }
        }
        else mostRecentVersion = version;
    });
    return mostRecentVersion;
}
