var queue = 'pals.input';
SimpleSchema.debug = true;

var redis = require("redis");
var REDIS_HOST = process.env.REDIS_HOST;
if( !REDIS_HOST ) REDIS_HOST = '127.0.0.1';
var REDIS_PORT = process.env.REDIS_PORT;
if( !REDIS_PORT ) REDIS_PORT = 6379;
var client = redis.createClient(REDIS_PORT,REDIS_HOST);

var fileBucket = FILE_BUCKET;
var fs = Npm.require('fs');

Meteor.methods({
  'insertModelOutput': function(modelOutputDoc) {
      var userId = this.userId;
      if( !userId ) {
          throw new Meteor.Error('not-authorized');
      }
      else {
        var moId = ModelOutputs.insert(modelOutputDoc);
        var group = 'modelOutput: ' + moId;
        Roles.addUsersToRoles(userId, 'edit', group);
        return moId;
      }
  },
  'updateModelOutput': function(currentDoc, updateDoc) {
      var userId = this.userId;
      var group = 'modelOutput: ' + currentDoc._id;
      if( Roles.userIsInRole(userId, 'edit', group) ) {
          mo = ModelOutputs.update(currentDoc, updateDoc);
          return mo;
      }
      else {
          throw new Meteor.Error('not-authorized');
      }
  },

  'removeModelOutput': function(moId) {
      var userId = this.userId;
      var group = 'modelOutput: ' + moId;
      if( Roles.userIsInRole(userId, 'edit', group) ) {
        mo = ModelOutputs.remove({_id: moId});
        return mo;
      }
      else {
          throw new Meteor.Error('not-authorized');
      }
  },

  'updateDataSet': function(currentDoc, dataSetDoc) {
        var userId = this.userId;
        if( !Roles.userIsInRole(userId, 'edit', 'datasets') ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
            return DataSets.update(currentDoc, dataSetDoc);
        }

    },
    'insertDataSet': function(dataSetDoc) {
        var userId = this.userId;
        if( !Roles.userIsInRole(userId, 'edit', 'datasets') ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
          var dsId = DataSets.insert(dataSetDoc);
          var group = 'dataSet ' + dsId;
          Roles.addUsersToRoles(userId, 'edit', group);
          return dsId;
        }
    },
    'removeDataSet': function(dataSetDoc) {
        var userId = this.userId;
        if( !Roles.userIsInRole(userId, 'edit', 'datasets') ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
          return DataSets.remove(dataSetDoc);
        }
    },
    'updateExperiment': function(currentDoc, updateDoc) {
        var userId = this.userId;
        if( !Roles.userIsInRole(userId, 'edit', 'experiment ' + currentDoc._id) ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
              var exp = Experiments.update(currentDoc, updateDoc);
              return exp;
        }

    },
    'insertExperiment': function(expDoc) {
        var userId = this.userId;
        var docId;
        if (userId && expDoc.recordType == 'instance') {
            docId = Experiments.insert(expDoc);
            var group = 'experiment ' + docId;
            Roles.addUsersToRoles(expDoc.owner, 'edit', group);
            return docId;
        }
        else if( expDoc.recordType == 'template' && Roles.userIsInRole(userId, 'edit', 'experiments')) {
            var expId = Experiments.insert(expDoc);
            var group = 'experiment ' + expId;
            Roles.addUsersToRoles(userId, 'edit', group);
            return expId;
        }
        else {
            throw new Meteor.Error('not-authorized')
        }
    },
    'deleteExperiment': function(dataSetDoc) {
        var userId = this.userId;
        var group = 'experiment ' + dataSetDoc._id;
        if( !Roles.userIsInRole(userId, 'edit', group) ) {
            throw new Meteor.Error('not-authorized')
        }
        else {
          return Experiments.remove(dataSetDoc);
        }
    },
    'updateModel': function(currentDoc, modelDoc) {
        var userId = this.userId;
        var group = 'model ' + currentDoc._id;
        if( !Roles.userIsInRole(userId, 'edit', group)) {
            throw new Meteor.Error('not-authorized')
        }
        else {
            return Models.update(currentDoc, modelDoc);
        }

    },
    'insertModel': function(modelDoc) {
        user = Meteor.user();
        if( !user ) {
          throw new Meteor.Error('not-authorized')
        }
        else if(Models.findOne({name:modelDoc.name, owner: user._id })) {
          throw new Meteor.Error('You already have a model with called ' + modelDoc.name);
        }
        else {
          var docId = Models.insert(modelDoc);
          var group = 'model ' + docId;
          Roles.addUsersToRoles(modelDoc.owner, 'edit', group);

          return docId;
        }
    },

    'removeModel': function(moId) {
        var userId = this.userId;
        var group = 'model ' + moId;
        if( Roles.userIsInRole(userId, 'edit', group) ) {
          mo = Models.remove({_id: moId});
          return mo;
        }
        else {
            throw new Meteor.Error('not-authorized');
        }
    },

    'insertWorkspace': function(name) {
        user = Meteor.user();
        if( !user ) {
          throw new Meteor.Error('not-authorized')
        }
        else if(Workspaces.findOne({name: name})) {
          throw new Meteor.Error('There is already a workspace with name ' + name);
        }
        else {
          var docId =  Workspaces.insert({owner: user._id, name: name});
          Roles.addUsersToRoles(user._id, 'edit', 'workspace ' + docId);

          return docId;
        }
    },

    'updateWorkspace': function(currentDoc, updateDoc) {
        var userId = this.userId;
        var group = 'workspace ' + currentDoc._id;
        if( !Roles.userIsInRole(userId, 'edit', group)) {
            throw new Meteor.Error('not-authorized')
        }
        else {
            return Workspaces.update(currentDoc, updateDoc);
        }

    },

    'changeWorkspace': function(workspaceId) {
      var userId = this.userId;
      var workspace = Workspaces.findOne({_id: workspaceId});
      if( userId && workspace ) {
        return Meteor.users.update({_id: userId}, {$set: {'profile.currentWorkspace': workspaceId}});
      }
    },

    'removeWorkspace': function(workspaceId) {
      var userId = this.userId;
      var workspace = Workspaces.findOne({_id: workspaceId});
      if( userId && workspace && workspace.owner && workspace.owner == userId) {
        return Workspaces.remove({_id: workspaceId});
      }

    },

    deleteAnalysis: function(id) {
        console.log('deleting analysis ' + id);
        var analysis = Analyses.findOne({_id:id});
        if( analysis ) {
             if( analysis.results && analysis.results.length > 0 ) {
                analysis.results.forEach(function(result) {
                    if (result && result.path) {
                        console.log('Deleting file ' + result.path)
                        deleteFile(result.path);
                    }
                });
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
    },

    startAnalysis: function (modelOutputId) {

        console.log('starting analysis for model output ' + modelOutputId);

        var user = Meteor.user();
        var currentModelOutput = ModelOutputs.findOne({'_id':modelOutputId});
        console.log('Benchmarks: '); console.log(currentModelOutput.benchmarks);
        if( !currentModelOutput )
            throw new Meteor.Error(500,'Error: Unable to load model output.');

        if( !currentModelOutput.experiments || currentModelOutput.experiments.length == 0 ) {
            throw new Meteor.Error(500,'Error: No experiment associated with model output');
        }

        var experiment = Experiments.findOne({_id:currentModelOutput.experiments[0]});
        if (!experiment)
            throw new Meteor.Error(500,'Error: Unable to load experiment.');

/*        if( currentModelOutput.versions ) {
            var currentVersion = undefined;
            currentModelOutput.versions.forEach(function(version) {
                if( version.key == key ) {
                    currentVersion = version;
                }
            });
        }
        if( currentVersion ) {*/
        else {
            var files = new Array();
            var moFile = currentModelOutput.file;
            moFile.type = 'ModelOutput';
            moFile.name = currentModelOutput.name;
            moFile.number = "1";
            files.push(moFile);

            addDataSets(files, experiment.dataSets,'DataSet');

            addBenchmarks(files, currentModelOutput.benchmarks);

            if( !experiment.scripts || experiment.scripts.length <=0 ) {
                throw new Meteor.Error(500,'The chosen experiment does not have a script');
            }
            else {
                // using [0] just to test it out
                var script = experiment.scripts[0];
                script.type = 'Script';
                files.push(script);
            }

            experimentModelOutputs = loadAllModelOutputsForExperimentExceptOne(experiment._id,currentModelOutput._id);

            var analysis = {
               'owner' : user._id,
               'created' : new Date(),
               'workspace' : user.profile.currentWorkspace,
               'modelOutput' : currentModelOutput._id,
               'modelOutputVersion' : '',
//               'modelOutputVersion' : currentVersion,
               'experiment' : experiment._id,
               'status' : 'started',
               'files' : files//,
               //'experimentModelOutputs' : experimentModelOutputs
           };

           console.log('Input to analysis script: '); console.log(analysis);

           saveAnalysis(analysis,analysisComplete);
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
                throw new Meteor.Error('Benchmark details invalid');
            }

        }
    }
    else console.log('No benchmarks');

}

addDataSets = function(files,dataSets,type) {

    if( !dataSets || dataSets.length <= 0 ) {
        throw new Meteor.Error(500, 'The chosen experiment does not have any data sets of type: '+type);
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
                throw new Meteor.Error('Data set details invalid');
            }

        }
        else
            throw new Meteor.Error('Data set details invalid');
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
