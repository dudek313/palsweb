import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  'test.resetDatabase': function(callback) {
    resetDatabase({excludedCollections: ['users']}, callback)
  },

  'test.createUser': function(emailPassword, callback) {
    Accounts.createUser(emailPassword, callback)
  },

  'test.removeUser': function(email, callback) {
    var user = Meteor.users.findOne({'emails.address': email});
    if (user && user._id)
    Meteor.users.remove({_id: user._id}, callback);
  }
});
