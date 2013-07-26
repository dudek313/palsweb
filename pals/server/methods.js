var amqp = Meteor.require('amqp');

var exchangeName = 'pals';
var routingKey = 'pals.input';

getLatestVersion = function(dataSet) {
    if( dataSet.versions && dataSet.versions.length > 0 ) return dataSet.versions[dataSet.versions.length-1];
    else return null;
}

addDataSets = function(files,dataSets,type) {

    if( !dataSets || dataSets.length <= 0 ) {
        throw new Meteor.Error(500, 'The chosen experiment does not have any data sets of type: '+type);
    }

    for( var i=0; i < dataSets.length; ++i ) {
        var dataSetId = dataSets[i];
        var dataSet = DataSets.findOne({'_id':dataSetId});
        var version = getLatestVersion(dataSet);
        if( version ) { 
            version.type = type;
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
    console.log('Connecting to rabbitmq');
    var connection = amqp.createConnection({url: "amqp://guest:guest@localhost:5672"},{reconnect:false});
    connection.on('ready', function () {
        console.log('Connection ready, sending analysis to exchange');
        connection.exchange(exchangeName,{}, function (exchange) {
            exchange.publish(routingKey, analysis);
            console.log('analysis sent to exchange');
        });
    });
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
            
            addDataSets(files, currentModelOutput.experiment.drivingDataSets,'DrivingDataSet');
            addDataSets(files, currentModelOutput.experiment.inputDataSets,'InputDataSet');
            
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
    }
});
