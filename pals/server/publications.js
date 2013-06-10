Workspaces._ensureIndex('name', {unique: 1});
var rootWorkspace = Workspaces.findOne({"name":"root"});
if( !rootWorkspace ) Workspaces.insert({"name": "root"});
Accounts.onCreateUser(function(options, user) {
    Meteor.users.update(
        {'_id':user._id},
        {'$set': {'user.profile.currentWorkspace':rootWorkspace}}
    );
});