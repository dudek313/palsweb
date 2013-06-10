Workspaces._ensureIndex('name', {unique: 1});
var rootWorkspace = Workspaces.findOne({"name":"root"});
if( !rootWorkspace ) Workspaces.insert({"name": "root"});

Meteor.users.allow({
    update: function (userId, doc, fields, modifier) {
        return (userId && doc._id === userId);
    }
});