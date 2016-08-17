// The publications limit user access to records based on the workspaces they have access to.
// These publications are not necessarily refreshed when users create new documents (e.g. model outputs),
// and therefore they might not have be given access to them.
// To deal with this, we call subscribe() after new documents have been created to refresh the publication.

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
        selector = {$or: [selector, {'owner':userId}, {'guests':userId}, {name:"browsing"}]};
    }
    return Workspaces.find(selector);
});

Workspaces._ensureIndex('name', {unique: 1});

/*Meteor.users.update({'emails.address':'eduthie@gmail.com'},{'$set':
    {'admin':true}});

Meteor.users.update({'emails.address':'gabsun@gmail.com'},{'$set':
    {'admin':true}});
*/
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
   return Meteor.users.find({}, {fields: {emails: 1}});
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
  var userId = this.userId;
  return getAvailableModelOutputs(userId);
});

function getAvailableModelOutputs(userId) {
    var wsSelector = {};
    var modelOutputs = null;

    if (userId) {
      var workspaceIds = getAvailableWorkspaceIds(userId);

      var expSelector = {workspace: {$in:workspaceIds}, recordType: 'instance'};
      var experiments = Experiments.find(expSelector).fetch();

      experimentIds = getIdsFromObjects(experiments);

      var moSelector = {experiments: {$in: experimentIds}};
      var modelOutputs = ModelOutputs.find(moSelector);
    }
    return modelOutputs;
}
//ModelOutputs._ensureIndex('name', {unique: 1});

Meteor.publish('analyses',function(){
  var userId = this.userId;
  var workspaceIds = getAvailableWorkspaceIds(userId);
  selector = {workspace: {$in: workspaceIds}};

  return Analyses.find(selector);
});

Meteor.publish('models',function(){
    return Models.find();
});

// Old code assumed unique model name. Only needs to be unique for user.
//Models._ensureIndex('name', {unique: 1});
//Models._ensureIndex('_id', {unique: 1});


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
      if (fileObj.type == 'dataSet')
        return Roles.userIsInRole(userId, 'edit', 'dataSet: ' + doc.dataSetId);
      else if (fileObj.type == 'modelOutput')
        return Roles.userIsInRole(userId, 'edit', 'modelOutput: ' + doc.modelOutputId);
      else if (fileObj.type == 'analysisScript')
        return Roles.userIsInRole(userId, 'edit', 'experiment: ' + doc.experimentId);
      else {
        console.log('File is not one of the valid types');
        return false;
      }
    },
    download: function(userId, fileObj) {
      if (fileObj.type == 'dataSet') return userId;
      else if (fileObj.type == 'modelOutput') {
        availableModelOutputsIds = getIdsFromObjects(getAvailableModelOutputs(userId).fetch());
        return (availableModelOutputsIds.indexOf(fileObj.modelOutputId) != -1); // this model output file is in the list which this user may access
      }
      else if (fileObj.type == 'analysisScript') return true;
      else {
        console.log('File is not one of the valid types');
        return false;
     }
    },
    fetch: null
});
