Router.configure({
    layoutTemplate: 'main'
});

Router.map(function () {
    this.route('root',{
        path: '/',
        template: 'home'
    });
    this.route('home',{
        path: '/home',
        template: 'home'
    });
    this.route('workspaces');
    this.route('workspace',{
       path: '/workspaces/:id',
       template: 'workspace',
       before: [
           function() {
               Session.set('currentWorkspace',this.params.id);
           }
       ] 
    });
    this.route('datasets');
    this.route('dataset',{
        path: '/datasets/:id',
        template: 'dataset',
        before: [
            function() {
                Session.set('currentDataSet',this.params.id);
            }
        ]
    });
    this.route('createDataset',{
        path: '/dataset',
        template: 'dataset',
        before: [
            function() {
                Session.set('currentDataSet',undefined);
            }
        ]
    });
    this.route('experiment',{
        path: '/experiment',
        template: 'experiment',
        before: [
            function() {
                Session.set('currentExperiment',undefined);
            }
        ]
    });
    this.route('experiments',{
        path: '/experiments',
        template: 'experiments',
        before: [
            function() {
                Session.set('currentSpatialResolution',null);
            }
        ]
    });
    this.route('experimentsById',{
        path: '/experiments/:id',
        template: 'experiment',
        before: [
            function() {
                Session.set('currentExperiment',this.params.id);
            }
        ]
    });
    this.route('experimentsBySpatialResolution',{
        path: '/experimentsBySpatialResolution/:resolution',
        template: 'experiments',
        before: [
            function() {
                Session.set('currentSpatialResolution',this.params.resolution);
            }
        ]
    });
    this.route('modelOutput',{
        path: '/modelOutput',
        template: 'modelOutput',
        before: [
            function() {
                Session.set('currentModelOutput',undefined);
            }
        ]
    });
    this.route('myModelOutputs');
    this.route('modelOutputs');
    this.route('modelOutputsById',{
        path: '/modelOutputs/:id',
        template: 'modelOutput',
        before: [
            function() {
                Session.set('currentModelOutput',this.params.id);
            }
        ]
    });
    this.route('analysis',{
        path: '/analysis/:id',
        template: 'analysis',
        before: [
            function() {
                Session.set('currentAnalysisId',this.params.id);
            }
        ]
    });
    this.route('models');
    this.route('model',{
        path: '/model',
        template: 'model',
        before: [
            function() {
                Session.set('currentModel',undefined);
            }
        ]
    });
    this.route('modelsById',{
        path: '/models/:id',
        template: 'model',
        before: [
            function() {
                Session.set('currentModel',this.params.id);
            }
        ]
    });
    this.route('analyses');
});

Router.before(function(){
    if (!Meteor.user()) {
        this.render('login');
        this.stop();
    }
}, {except: ['home','root']});

if( Meteor.isClient ) {
    Router.configure({
      autoRender: false
    });
}