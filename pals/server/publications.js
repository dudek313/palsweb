Houston.add_collection(Meteor.users);
Houston.add_collection(Houston._admins);
Houston.hide_collection(Reference);

Meteor.publish('workspaces',function(){
    return Workspaces.find();
});

Workspaces._ensureIndex('name', {unique: 1});

Meteor.users.update({'emails.address':'eduthie@gmail.com'},{'$set':
    {'admin':true}});

Meteor.users.update({'emails.address':'gabsun@gmail.com'},{'$set':
    {'admin':true}});

var gab = Meteor.users.findOne({'emails.address':'gabsun@gmail.com'})
if (gab) {
    var gabId = gab._id;
    Roles.addUsersToRoles(gabId, 'edit', Roles.GLOBAL_GROUP);
    Roles.addUsersToRoles(gabId, 'access', 'all workspaces');
}

var danny = Meteor.users.findOne({'emails.address':'ravdanny@gmail.com'});
if (danny) {
    var dannyId = danny._id;
    Roles.addUsersToRoles(dannyId, 'edit', 'datasets');
    Roles.addUsersToRoles(dannyId, 'edit', 'models');
    Roles.addUsersToRoles(dannyId, 'edit', 'experiments');
}

Meteor.users.allow({
    update: function (userId, doc, fields, modifier) {
        return (userId && doc._id === userId);
    }
});

Workspaces.allow({
    insert: function(userId, doc) {
        return ( userId && doc.owner == userId );
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


//DataSets._ensureIndex('_id', {unique: 1});


Meteor.publish('dataSets',function(){
    return DataSets.find();
});

Meteor.publish('draftDataSets',function(){
    return DraftDataSets.find();
});

/*DataSets.allow({
    insert: function(userId, doc) {
        var user = Meteor.user();
        return ( userId && user.admin );
    },
    update: function(userId, doc, fieldNames, modifier) {
        var user = Meteor.user();
        return ( userId && user.admin );
    },
    remove: function(userId, doc) {
        var user = Meteor.user();
        return ( userId && user.admin );
    }
});*/

DraftDataSets.allow({
    insert: function(userId, doc) {
        var user = Meteor.user();
        return ( userId && user.admin );
    },
    update: function(userId, doc, fieldNames, modifier) {
        var user = Meteor.user();
        return ( userId && user.admin );
    },
    remove: function(userId, doc) {
        var user = Meteor.user();
        return ( userId && user.admin );
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

Meteor.publish('experiments',function(){
    return Experiments.find();
});

Experiments.allow({
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

//Experiments._ensureIndex('_id', {unique: 1});

Meteor.publish('modelOutputs',function(){
    return ModelOutputs.find();
});

ModelOutputs.allow({
    insert: function(userId, doc) {
        return ( userId );
    },
    update: function(userId, doc, fieldNames, modifier) {
        var user = Meteor.user();
        return ( userId && doc.owner === userId );
    },
    remove: function(userId, doc) {
        return ( userId && doc.owner === userId );
    }
});

//ModelOutputs._ensureIndex('name', {unique: 1});

Meteor.publish('analyses',function(){
    return Analyses.find();
});

Meteor.publish('models',function(){
    return Models.find();
});

// Old code assumed unique model name. Only needs to be unique for workspace.
//Models._ensureIndex('name', {unique: 1});
//Models._ensureIndex('_id', {unique: 1});


Models.allow({
    insert: function(userId, doc) {
        return ( userId && doc.owner === userId );
    },
    update: function(userId, doc, fieldNames, modifier) {
        var group = "Model: " + doc._id;
        return Roles.userIsInRole(userId, 'edit', group);
    },
    remove: function(userId, doc) {
        return ( userId && doc.owner === userId );
    }
});

Meteor.publish('variables',function(){
    return Variables.find();
});

//Variables._ensureIndex('name', {unique: 1});

Files.allow({
    insert: function(userId, doc) {
        return (userId);
    },
    update: function(userId, doc, fieldNames, modifier) {
        return (userId);
    },
    remove: function(userId, doc) {
        return (userId);
    },
    download: function() {
        return true;
    },
    fetch: null
});
