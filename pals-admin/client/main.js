import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.main.onRendered(function() {
  Tracker.autorun(function() {
    var user = Meteor.user();
    if (user && user._id && Roles.userIsInRole(user._id, "admin", Roles.GLOBAL_GROUP))
      Router.go('/admin');
  });
});
