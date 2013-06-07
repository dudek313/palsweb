Meteor.Router.add({
  '/home': 'home',
  '/workspaces': 'workspaces',
  '*': 'home'
});

Meteor.startup(function(){
});