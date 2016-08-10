Houston.add_collection(Meteor.users);
Houston.add_collection(Houston._admins);
Houston.hide_collection(Reference);

Meteor.publish('workspaces', function(){
    var selector = {'public':true};
    var userId = this.userId;
    if( userId ) {
      if( Roles.userIsInRole(userId, 'workspaceAccess', Roles.GLOBAL_GROUP))
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
    Roles.addUsersToRoles(gabId, 'workspaceAccess', Roles.GLOBAL_GROUP);
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
  var workspaceIds = getAvailableWorkspaceIds(userId);

  wsSelector.workspace = {$in:workspaceIds};
  wsSelector.recordType = 'instance';
  selector = {$or: [wsSelector, {recordType: 'template'}]};

  return Experiments.find(selector);
});

//Experiments._ensureIndex('_id', {unique: 1});

Meteor.publish('modelOutputs',function() {
  var wsSelector = {};
  var modelOutputs = null;

  var userId = this.userId;
  if (userId) {
    var workspaceIds = getAvailableWorkspaceIds(userId);

    var expSelector = {workspace: {$in:workspaceIds}, recordType: 'instance'};
    var experiments = Experiments.find(expSelector).fetch();

    experimentIds = getIdsFromObjects(experiments);

    var moSelector = {experiments: {$in: experimentIds}};
    var modelOutputs = ModelOutputs.find(moSelector);
  }

  return modelOutputs;
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
