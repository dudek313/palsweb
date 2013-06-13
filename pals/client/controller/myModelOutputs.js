Template.myModelOutputs.modelOutputs = function() {
    var user = Meteor.user();
    var modelOutputs = ModelOutputs.find({'owner':user._id,'workspaces':user.profile.currentWorkspace._id}).fetch();
    if( modelOutputs )
    {
        modelOutputs.forEach(function(modelOutput){
            if( modelOutput.experiment ) modelOutput.experiment = Experiments.findOne({'_id':modelOutput.experiment},{'_id':1,'name':1});
        });
    }
    return modelOutputs;
}

Template.myModelOutputs.events({
    'click .delete' : function(event) {
        var id = $(event.target).attr('id');
        if( id ) {
            ModelOutputs.remove({'_id':id},function(error){
                if(error) {
                    $('.error').html('Failed to delete the model output, please try again');
                    $('.error').show();
                }
            });
        }
    }
});