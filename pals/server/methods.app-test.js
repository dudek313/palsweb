import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({

  'test.Models.findOne': function(modelId) {
    var model = Models.findOne({_id: modelId});
    return model;
  },

  'test.Experiments.findOne': function(expId) {
    return Experiments.findOne({_id: expId});
  },

  'test.ModelOutputs.findOne': function(moId) {
    return ModelOutputs.findOne({_id: moId});
  },

  'test.DataSets.findOne': function(dsId) {
    return DataSets.findOne({_id: dsId});
  },

  'test.Workspaces.findOne': function(wsId) {
    return Workspaces.findOne({_id: wsId});
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
