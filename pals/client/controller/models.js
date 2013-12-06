Template.models.models = function() {
    var user = Meteor.user();
    var models = Models.find({'workspaces':user.profile.currentWorkspace._id}).fetch();
    if( models )
    {
        models.forEach(function(model){
            if( model.owner ) model.owner = Meteor.users.findOne({'_id':model.owner},{'_id':1,'name':1});
        });
    }
    return models;
}

Template.models.events({
    'click .delete' : function(event) {
        var id = $(event.target).attr('id');
        if( id ) {
            console.log(id);
            Models.remove({'_id':id},function(error){
                if(error) {
                    $('.error').html('Failed to delete the model, please try again');
                    $('.error').show();
                }
            });
        }
    }
});