import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  'test.resetDatabase': function(callback) {
    resetDatabase({excludedCollections: ['users']}, callback)
  },

  'test.createUser': function(emailPassword, callback) {
    Accounts.createUser(emailPassword, callback)
  },

  'test.Experiments.findOne': function(expId, callback) {
    return Experiments.find({_id: expId});
  },

  'test.ModelOutputs.findOne': function(moId, callback) {
    return ModelOutputs.find({_id: moId});
  },

  'test.Models.findOne': function(modelId, callback) {
    return Models.find({_id: modelId});
  },

/*  'test.removeUser': function(selector) {
//    var user = Meteor.users.findOne(selector);
//    if (user)
    var result = Meteor.users.remove(selector);
    console.log(result);
    return result;
  },*/

  'test.removeUser': function(selector, callback) {
//    var user = Meteor.users.findOne(selector);
//    if (user)
    Meteor.users.remove(selector, callback);
  },

  'test.updateUser': function(selector, modifier, callback) {
    var user = Meteor.users.findOne(selector);
    if (user)
      Meteor.users.update(selector, modifier, function() {
        callback;
      });
  }

});
