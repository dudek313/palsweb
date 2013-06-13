Template.modelOutputs.modelOutputs = function() {
    var user = Meteor.user();
    var modelOutputs = ModelOutputs.find({'workspaces':user.profile.currentWorkspace._id}).fetch();
    if( modelOutputs )
    {
        modelOutputs.forEach(function(modelOutput){
            if( modelOutput.owner ) modelOutput.owner = Meteor.users.findOne({'_id':modelOutput.owner},{'_id':1,'name':1});
            if( modelOutput.experiment ) modelOutput.experiment = Experiments.findOne({'_id':modelOutput.experiment},{'_id':1,'name':1});
        });
    }
    return modelOutputs;
}