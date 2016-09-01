import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  'test.resetDatabase': function(callback) {
    resetDatabase({excludedCollections: ['users']}, callback)
  },

  'test.createUser': function(emailPassword, callback) {
    Accounts.createUser(emailPassword, callback)
  },

  'test.removeUser': function(selector, callback) {
    var user = Meteor.users.findOne(selector);
    if (user)
      Meteor.users.remove(selector, callback);
  },

  'test.updateUser': function(selector, modifier, callback) {
    var user = Meteor.users.findOne(selector);
    if (user)
      Meteor.users.update(selector, modifier, callback);
  }

});
