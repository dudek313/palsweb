import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({

  'test.Models.findOne': function(modelDoc) {
    var model = Models.findOne(modelDoc);
    return model;
  },

  'test.Models.insert': function(modelDoc) {
    return Models.insert(modelDoc);
  },

  'test.Experiments.findOne': function(expDoc) {
    return Experiments.findOne(expDoc);
  },

  'test.Experiments.insert': function(expDoc) {
    return Experiments.insert(expDoc);
  },

  'test.ModelOutputs.findOne': function(moDoc) {
    return ModelOutputs.findOne(moDoc);
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

  'test.updateUser': function(selector, modifier, callback) {
    var user = Meteor.users.findOne(selector);
    if (user)
      Meteor.users.update(selector, modifier, callback);
  }

});
