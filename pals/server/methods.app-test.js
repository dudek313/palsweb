import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({

  'test.users.findOne': function(selector) {
    var user = Meteor.users.findOne(selector);
    return user;
  },

  'test.Models.findOne': function(modelDoc) {
    var model = Models.findOne(modelDoc);
    return model;
  },

  'test.Models.insert': function(modelDoc) {
    result = Models.insert(modelDoc);
    return result;
  },

  'test.Experiments.findOne': function(expDoc) {
    return Experiments.findOne(expDoc);
  },

  'test.Experiments.insert': function(expDoc) {
    return Experiments.insert(expDoc);
  },

  'test.ModelOutputs.findOne': function(moDoc) {
    var result = ModelOutputs.findOne(moDoc);
    return result;
  },

  'test.ModelOutputs.insert': function(modelDoc) {
    return ModelOutputs.insert(modelDoc);
  },

  'test.DataSets.findOne': function(dsDoc) {
    return DataSets.findOne(dsDoc);
  },

  'test.DataSets.insert': function(dsDoc) {
    return DataSets.insert(dsDoc);
  },

  'test.Workspaces.findOne': function(wsDoc) {
    return Workspaces.findOne(wsDoc);
  },

  'test.Workspaces.insert': function(wsName, ownerId) {
    var docId =  Workspaces.insert({owner: ownerId, name: wsName});
    return docId;
  },

  'test.resetDatabase': function(callback) {

    resetDatabase({excludedCollections: ['users']}, callback)
  },

  'test.createUser': function(emailPassword, callback) {
    Accounts.createUser(emailPassword, callback)
  },

/*  'test.removeUser': function(selector) {
//    var user = Meteor.users.findOne(selector);
//    if (user)
    var result = Meteor.users.remove(selector);
    console.log(result);
    return result;
  },*/

  'test.removeUser': function(selector, callback) {
    Meteor.users.remove(selector, callback);
  },

  'test.updateUser': function(selector, modifier) {
    var result = Meteor.users.update(selector, modifier);
    return result;
  }

});
