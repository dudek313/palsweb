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
  '/experiment': function() {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentExperiment',undefined);
          return 'experiment';
      }
      else return 'home';
  },
  '/experiments': function() {
      var user = Meteor.user();
      if( user ) return 'experiments';
      else return 'home';
  },
  '/experiments/:id': function(id) {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentExperiment',id);
          return 'experiment';
      }
      else return 'home';
  },
  '/modelOutput': function() {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentModelOutput',undefined);
          return 'modelOutput';
      }
      else return 'home';
  },
  '/myModelOutputs': function() {
      var user = Meteor.user();
      if( user ) return 'myModelOutputs'
      else return 'home';
  },
  '/modelOutputs': function() {
      var user = Meteor.user();
      if( user ) return 'modelOutputs'
      else return 'home';
  },
  '/modelOutputs/:id': function(id) {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentModelOutput',id);
          return 'modelOutput';
      }
      else return 'home';
  },  
  '/analysis/:id': function(id) {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentAnalysisId',id);
          return 'analysis';
      }
      else return 'home';
  },
  '/models': function() {
      var user = Meteor.user();
      if( user ) return 'models'
      else return 'home';
  },
  '/model': function() {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentModel',undefined);
          return 'model';
      }
      else return 'home';
  },
  '/models/:id': function(id) {
      var user = Meteor.user();
      if( user ) {
          Session.set('currentModel',id);
          return 'model';
      }
      else return 'home';
  },  
  '*': 'home'
});

Meteor.startup(function(){
});