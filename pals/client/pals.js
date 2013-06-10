Meteor.Router.add({
  '/home': 'home',
  '/workspaces': function() {
      var user = Meteor.user();
      if( user ) return 'workspaces';
      else return 'home';
  },
  '/workspaces/:name': function(name) {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentWorkspaceName',name);
          return 'workspace';
      }
      else return 'home' 
  },
  '*': 'home'
});

Meteor.startup(function(){
});