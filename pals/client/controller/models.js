Template.models.models = function() {
    var user = Meteor.user();
    if( user ) {
	if (user.profile.currentWorkspace.name == 'public')
		var models = Models.find().fetch();
	else
	        var models = Models.find({'workspaces':user.profile.currentWorkspace._id}).fetch();
//        var models = Models.find({'workspaces':user.profile.currentWorkspace._id}).fetch();

        if( models )
        {
            models.forEach(function(model){
                if( model.owner ) {
                    model.owner = Meteor.users.findOne({'_id':model.owner},{'_id':1,'name':1});
                    if( model.owner && model.owner.emails && model.owner.emails.length > 0) {
                        model.owner.email = model.owner.emails[0].address;
                    }
                }
            });
        }    
        return models;
    }
}

Template.models.events({
    'click .delete' : function(event) {
        if( confirm("Are you sure?")) {
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
    }
});
