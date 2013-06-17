getLatestVersion = function(dataSet) {
    if( dataSet.versions && dataSet.versions.length > 0 ) return dataSet.versions[dataSet.versions.length-1];
    else return null;
}

Meteor.methods({
    startAnalysis: function (key,modelOutputId) {
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
            
            if( currentModelOutput.experiment.drivingDataSets ) {
                for( var i=0; i < currentModelOutput.experiment.drivingDataSets.length; ++i ) {
                    var drivingDataSetId = currentModelOutput.experiment.drivingDataSets[i];
                    console.log(drivingDataSetId);
                    var drivingDataSet = DataSets.findOne({'_id':drivingDataSetId});
                    console.log(drivingDataSet);
                    var version = getLatestVersion(drivingDataSet);
                    if( version ) { 
                        version.type = 'DrivingDataSet';
                        files.push(version);
                    }
                }
            }
            
            return files.length;
        
            var analysis = {
               'owner' : user._id,
               'created' : new Date(),
               'workspaces' : [user.profile.currentWorkspace._id],
               'modelOutput' : currentModelOutput._id,
               'modelOutputVersion' : currentVersion,
               'experiment' : currentModelOutput.experiment._id,
               'status' : 'started'
           }
       }
       return 'yay'; 
    }
});
