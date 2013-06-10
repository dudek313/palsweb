Template.main.currentWorkspace = function() {
    var user = Meteor.user();
    if( user ) {
        if( !user.profile ) {
            user.profile = {};
        }
        if( !user.profile.currentWorkspace ) {
            console.log('no current workspace');
            var rootWorkspace = Workspaces.findOne({"name":"root"});
            user.profile.currentWorkspace = rootWorkspace;
            Meteor.users.update({'_id':user._id}, 
                {'$set' : {'profile.currentWorkspace':user.profile.currentWorkspace}});
        }
        return user.profile.currentWorkspace;
    }
}