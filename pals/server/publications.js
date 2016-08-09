Houston.add_collection(Meteor.users);
Houston.add_collection(Houston._admins);
Houston.hide_collection(Reference);

Meteor.publish('workspaces', function(){
    var selector = {'public':true};
    var userId = this.userId;
    if( userId ) {
      if( Roles.userIsInRole(userId, 'access', 'all workspaces'))
        selector = {};
      else
        selector = {$or: [selector, {'owner':userId}, {'guests':userId}]};
    }
    return Workspaces.find(selector);
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

Meteor.publish('directory',function(){
   return Meteor.users.find();
});

Meteor.publish('dataSets',function(){
    var userId = this.userId;
    if( userId )
      return DataSets.find();
});

Meteor.publish('reference',function(){
    return Reference.find();
});

Meteor.publish('experiments',function(){
  var wsSelector = {};

  var userId = this.userId;
  var selector = {'public':true};

  // find all workspaces to which the user has access
  if( userId ) {
    if( Roles.userIsInRole(userId, 'access', 'all workspaces' )) {
      selector = {}
    }
    else
      selector = {$or: [selector, {'owner':userId}, {'guests':userId}]};
  }
  workspaces = Workspaces.find(selector).fetch();

  // compile an array of workspace ids
  var workspaceIds = [];
  if (workspaces && workspaces.length > 0) {
    workspaces.forEach(function(ws) {
      if (ws._id)
        workspaceIds.push(ws._id);
      else
        console.log('Object has no _id value');
    });
  }

  wsSelector.workspace = {$in:workspaceIds};
  wsSelector.recordType = 'instance';
  selector = {$or: [wsSelector, {recordType: 'template'}]};

  return Experiments.find(selector);
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

// Old code assumed unique model name. Only needs to be unique for user.
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
