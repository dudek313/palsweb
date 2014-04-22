Template.modelOutputs.modelOutputs = function() {
    var user = Meteor.user();
    if( user ) {
        var modelOutputs;
        var modelOutputs = ModelOutputs.find({'workspaces':user.profile.currentWorkspace._id},
            {sort:{created:-1}}).fetch();
        if( modelOutputs )
        {
            modelOutputs.forEach(function(modelOutput){
                if( modelOutput.owner ) {
                    modelOutput.owner = 
                        Meteor.users.findOne({'_id':modelOutput.owner},{'_id':1,'name':1});
                    if( modelOutput.owner ) {
                        modelOutput.owner.email = modelOutput.owner.emails[0].address;        
                    }
                }
                if( modelOutput.experiment ) modelOutput.experiment = 
                    Experiments.findOne({'_id':modelOutput.experiment},{'_id':1,'name':1});
            });
        }
        return modelOutputs;
    }
}