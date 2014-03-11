var redis = Npm.require("redis");
var queue = 'pals.input';
var client = redis.createClient();

var bucket = 'pals-test';
var s3Url = 'https://s3-ap-southeast-2.amazonaws.com/'+bucket;
var AWS = Meteor.require('aws-sdk');
var configPath = process.cwd() + '/config.json';
configPath = '/vagrant/palsweb/pals/config.json';
AWS.config.loadFromPath(configPath);

var fileBucket = '/pals/data';
var uuid = Npm.require('node-uuid');
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
    var s3 = new AWS.S3();
    s3.deleteObject({
        Bucket : bucket,
        Key : file.key,
    },function(err,data){
        if( err ) console.log("Failed to delete the file: " + file.key);
    });
}

createFileRecord = function(fileName,fileSize,fileData) {
    var fileToken = uuid.v4();
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

Meteor.methods({
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
        
            var analysis = {
               'owner' : user._id,
               'created' : new Date(),
               'workspaces' : [user.profile.currentWorkspace._id],
               'modelOutput' : currentModelOutput._id,
               'modelOutputVersion' : currentVersion,
               'experiment' : currentModelOutput.experiment._id,
               'status' : 'started',
               'files' : files
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
    uploadDataSet: function(dataSetId, fileName, fileSize, fileData) {
        var fileRecord = createFileRecord(fileName,fileSize,fileData);
        DataSets.update({'_id':dataSetId},
            {'$push':{'versions':fileRecord}},function(error){
                if( error ) {
                    console.log(error);
                    console.log('Failed to add uploaded version to the data set');
                }
        });
    },
    uploadScript: function(experimentId, fileName, fileSize, fileData) {
        var fileRecord = createFileRecord(fileName,fileSize,fileData);
        Experiments.update({'_id':experimentId},
            {'$push':{'scripts':fileRecord}},function(error){
                if( error ) {
                    console.log(error);
                    console.log('Failed to add uploaded script to the experiment');
                }
        });
    },
    uploadModelOutput: function(modelOutputId, fileName, fileSize, fileData) {
        var fileRecord = createFileRecord(fileName,fileSize,fileData);
        ModelOutputs.update({'_id':modelOutputId},
            {'$push':{'versions':fileRecord}},function(error){
                if( error ) {
                    console.log(error);
                    console.log('Failed to add uploaded model output version');
                }
        });
    },
    removeFileByUrl: function(url) {
        fs.unlink(url,function(){
            console.log('deleted file ' + url);
        })
    }
});
