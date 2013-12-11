Template.experiments.experiments = function() {
    var user = Meteor.user();
    var selector = {'workspaces':user.profile.currentWorkspace._id};
    var resolution = Template.experiments.currentSpatialResolution();
    if( resolution ) {
        selector.spatialLevel = resolution;
    }
    return Experiments.find(selector);
}

Template.experiments.currentSpatialResolution = function() {
    return Session.get('currentSpatialResolution');
}

Template.experiments.events({
    'click .delete' : function(event) {
        var id = $(event.target).attr('id');
        if( id ) {
            console.log(id);
            Experiments.remove({'_id':id},function(error){
                if(error) {
                    $('.error').html('Failed to delete the experiment, please try again');
                    $('.error').show();
                }
            });
        }
    }
});