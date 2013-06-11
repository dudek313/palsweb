Meteor.Router.add({
  '/home': 'home',
  '/workspaces': function() {
      var user = Meteor.user();
      if( user ) return 'workspaces';
      else return 'home';
  },
  '/workspaces/:id': function(id) {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentWorkspace',id);
          return 'workspace';
      }
      else return 'home' 
  },
  '/datasets': function() {
      var user = Meteor.user();
      if( user ) return 'datasets';
      else return 'home';
  },
  '/datasets/:id': function(id) {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentDataSet',id);
          return 'dataset';
      }
      else return 'home';
  },
  '/dataset': function() {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentDataSet',undefined);
          return 'dataset';
      }
      else return 'home';
  },
  '*': 'home'
});

Meteor.startup(function(){
});