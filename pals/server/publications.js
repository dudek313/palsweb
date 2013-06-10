Meteor.publish('workspaces',function(){
    return Workspaces.find();
});

Workspaces._ensureIndex('name', {unique: 1});
var rootWorkspace = Workspaces.findOne({"name":"root"});
if( !rootWorkspace ) Workspaces.insert({"name": "root"});

Meteor.users.allow({
    update: function (userId, doc, fields, modifier) {
        return (userId && doc._id === userId);
    }
});

Workspaces.allow({
    insert: function(userId, doc) {
        return ( userId && doc.owner === userId );
    },
    update: function(userId, doc, fieldNames, modifier) {
        return ( userId && doc.owner === userId );
    },
    remove: function(userId, doc) {
        return ( userId && doc.owner === userId );
    }
});