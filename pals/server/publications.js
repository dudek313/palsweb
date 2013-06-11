Meteor.publish('workspaces',function(){
    return Workspaces.find();
});

Workspaces._ensureIndex('name', {unique: 1});
var rootWorkspace = Workspaces.findOne({"name":"root"});
if( !rootWorkspace ) Workspaces.insert({"name": "root"});

Meteor.users.update({'emails.address':'eduthie@gmail.com'},{'$set':
    {'admin':true}});

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

Meteor.publish('directory',function(){
   return Meteor.users.find();
});


DataSets._ensureIndex('name', {unique: 1});

Meteor.publish('dataSets',function(){
    return DataSets.find();
});

DataSets.allow({
    insert: function(userId, doc) {
        var user = Meteor.user();
        return ( userId && user.admin );
    },
    update: function(userId, doc, fieldNames, modifier) {
        var user = Meteor.user();
        return ( userId && user.admin && doc.owner === userId );
    },
    remove: function(userId, doc) {
        var user = Meteor.user();
        return ( userId && user.admin && doc.owner === userId );
    }
});

Meteor.publish('reference',function(){
    return Reference.find();
});

Reference.allow({
    insert: function(userId, doc) {
        return (userId);
    },
    update: function(userId, doc, fieldNames, modifier) {
        return (userId);
    },
    remove: function(userId, doc) {
        return (userId);
    }
});