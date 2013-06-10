Template.workspace.created = function() {
    var user = Meteor.user();
    if( user ) {
        this.name = Session.get('currentWorkspaceName');
        var query = {'name':name,'owner':user._id};
        this.workspace = Template.workspace.workspace();
        Meteor.users.update({'_id':user._id}, 
            {'$set' : {'profile.currentWorkspace':this.workspace}});
    }
};

Template.workspace.workspace = function() {
    var user = Meteor.user();
    if( user ) {
        var name = Session.get('currentWorkspaceName');
        if( name == 'root' ) return Workspaces.findOne({'name':name})
        else return Workspaces.findOne({'name':name,'owner':user._id});
    }
};

Template.workspace.users = function() {
    var users = Meteor.users.find();
    users.forEach(function(user){
        console.log(user._id);
    });
};