var queue = 'pals.input';

var REDIS_HOST = process.env.REDIS_HOST;
if( !REDIS_HOST ) REDIS_HOST = '127.0.0.1';
var REDIS_PORT = process.env.REDIS_PORT;
if( !REDIS_PORT ) REDIS_PORT = 6379;
var client = redis.createClient(REDIS_PORT,REDIS_HOST);

var fileBucket = FILE_BUCKET;
var fs = Npm.require('fs');

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

addDataSets = function(files,dataSets,type) {

    if( !dataSets || dataSets.length <= 0 ) {
        throw new Meteor.Error(500, 'The chosen experiment does not have any data sets of type: '+type);
    }

	console.log('Number of data sets: ' + dataSets.length);

    for( var i=0; i < dataSets.length; ++i ) {
        var dataSetId = dataSets[i];
        var dataSet = DataSets.findOne({'_id':dataSetId});
        console.log('processing data set: ' + dataSetId);
        var version = getLatestVersion(dataSet);
        version.name = dataSet.name;
        if( version ) {
            files.push(version);
        }
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

analysisComplete = function(analysis) {
    console.log('Sending message to redis');
    client.rpush(queue,JSON.stringify(analysis));
}

deleteFile = function(file) {
    fs.unlink(file.filename,function(){})
}

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

/**
 * Loads all the current versions of the model outputs which are associated with the given experiment.
 * A list of model output file records are returned.
 **/
loadAllModelOutputsForExperimentExceptOne = function(experimentId,modelOutputId) {
    var modelOutputs = ModelOutputs.find({'experiment':experimentId},{sort:{created:-1}});
    var versions = [];
    modelOutputs.forEach(function(modelOutput){
        if(modelOutput._id != modelOutputId) {
            version = extractLatestVersion(modelOutput);
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

Meteor.methods({
  'findWorkspace': function(selector) {
      if ( !Meteor.user()) {
          throw new Meteor.Error('not-authorized')
      }
      else {
          return Workspaces.findOne(selector);
      }
  },
  'findOneModelOutput': function(selector) {
      if( !Meteor.user() ) {
          throw new Meteor.Error('not-authorized')
      }
      else {
        return ModelOutputs.findOne(selector);
      }
  },
  'insertModelOutput': function(modelOutputDoc) {
      if( !Meteor.user() ) {
          throw new Meteor.Error('not-authorized')
      }
      else {
        return ModelOutputs.insert(modelOutputDoc);
      }
  },
  'updateModelOutput': function(currentDoc, updateDoc) {
      userId = Meteor.userId();
      if( userId ) {
          mo = ModelOutputs.update(currentDoc, updateDoc);
          console.log(mo);
          return mo;
      }
      else {
          throw new Meteor.Error('not-authorized');
      }
  },
  'addTempFile': function(key) {
        if (!Meteor.user()) {
            throw new Meteor.Error('not-authorized')
        }
        else {
            return TempFiles.insert(key);
        }
    },
    'removeTempFile': function(key) {
        if (!Meteor.user()) {
            throw new Meteor.Error('not-authorized')
        }
        else {
            return TempFiles.remove(key);
        }
    },
    'createDraftDataSet': function(dataSetDoc) {
        if( !Meteor.user().admin ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
          return DraftDataSets.insert(dataSetDoc);
        }
    },
    'updateDraftDataSet': function(currentDoc, updateDoc) {
        if( !Meteor.user().admin ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
            return DraftDataSets.update(currentDoc, updateDoc);
        }

    },
    'updateDataSet': function(currentDoc, dataSetDoc) {
        if( !Meteor.user().admin ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
            return DataSets.update(currentDoc, dataSetDoc);
        }

    },
    'insertDataSet': function(dataSetDoc) {
        if( !Meteor.user().admin ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
          return DataSets.insert(dataSetDoc);
        }
    },
    'updateExperiment': function(currentDoc, updateDoc) {
        if( !Meteor.user().admin ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
            return Experiments.update(currentDoc, updateDoc);
        }

    },
    'insertExperiment': function(dataSetDoc) {
        if( !Meteor.user().admin ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
          return Experiments.insert(dataSetDoc);
        }
    },
    'deleteExperiment': function(dataSetDoc) {
        if( !Meteor.user().admin ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
          return Experiments.remove(dataSetDoc);
        }
    },
    'updateModel': function(currentDoc, modelDoc) {
        if( !Meteor.user().admin ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
            return Models.update(currentDoc, modelDoc);
        }

    },
    'insertModel': function(modelDoc) {
        if( !Meteor.user().admin ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
          return Models.insert(modelDoc);
        }
    },
    'dataSets.insert': function(dataset, callback) {
        DataSets.insert(dataset, function(error,doc) {
            if( error ) {
                console.log('Error saving the new dataSet');
            }
            else {
                console.log('Method.insert: ' + doc);
//                return doc;
                callback(false,doc);
            }
        });

    },
    'dataSets.update': function(selector, update) {
        DataSets.update(selector, update, function(error, doc) {
            if( error ) {
                console.log('Error updating dataSet record');
            }
            else {
                console.log('Update successful of ' + selector._id);
            }
        });
    },

    startAnalysis: function (key,modelOutputId) {

        console.log('starting analysis for model output: ' + modelOutputId);

        var user = Meteor.user();
        var currentModelOutput = ModelOutputs.findOne({'_id':modelOutputId});
        if( currentModelOutput && currentModelOutput.experiment ) {
            currentModelOutput.experiment = Experiments.findOne({_id:currentModelOutput.experiment});
        }
        if( currentModelOutput.versions ) {
            var currentVersion = undefined;
            currentModelOutput.versions.forEach(function(version) {
                if( version.key == key ) {
                    currentVersion = version;
                }
            });
        }
        if( currentVersion ) {

            var files = new Array();
            currentVersion.type = 'ModelOutput';
            currentVersion.name = currentModelOutput.name;
            files.push(currentVersion);

            if( !currentModelOutput.experiment ) throw new Meteor.Error(500, 'Please select an experiment first');

            addDataSets(files, currentModelOutput.experiment.dataSets,'DataSet');

            if( !currentModelOutput.experiment.scripts || currentModelOutput.experiment.scripts.length <=0 ) {
                throw new Meteor.Error(500,'The chosen experiment does not have a script');
            }
            else {
                var script = currentModelOutput.experiment.scripts[currentModelOutput.experiment.scripts.length-1];
                script.type = 'Script';
                files.push(script);
            }

            experimentModelOutputs = loadAllModelOutputsForExperimentExceptOne(currentModelOutput.experiment._id,currentModelOutput._id);

            var analysis = {
               'owner' : user._id,
               'created' : new Date(),
               'workspaces' : [user.profile.currentWorkspace._id],
               'modelOutput' : currentModelOutput._id,
               'modelOutputVersion' : currentVersion,
               'experiment' : currentModelOutput.experiment._id,
               'status' : 'started',
               'files' : files,
               'experimentModelOutputs' : experimentModelOutputs
           };

           saveAnalysis(analysis,analysisComplete);
           return analysis;
       }
       return null;
    },
    deleteAnalysis: function(id) {
        console.log('deleting analysis: ' + id);
        var analysis = Analyses.findOne({_id:id});
        if( analysis ) {
             if( analysis.results ) {
                 for( var i=0; i < analysis.results.length; ++i ) {
                     deleteFile(analysis.results[i]);
                 }
             }
             Analyses.remove({'_id':id},function(error){
                  if( error ) console.log(error);
             });
        }
        return null;
    },
    removeFileByUrl: function(url) {
        fs.unlink(url,function(){
            console.log('deleted file ' + url);
        })
    }
});
