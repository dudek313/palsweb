// GLOBALS

FILE_BUCKET = '/pals/data';

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
       onBeforeAction: [
           function() {
               Session.set('currentWorkspace',this.params.id);
	       this.next();
           }
       ]
    });
    this.route('datasets/Anywhere',{
        path: '/datasets/Anywhere',
        template: 'datasets',
        onBeforeAction: [
            function() {
              Session.set('source',null);
              Session.set('currentSpatialResolution',null);
		          this.next();
            }
        ]
    });
    this.route('datasets/Workspace',{
        path: '/datasets/Workspace',
        template: 'datasets',
        onBeforeAction: [
            function() {
              Session.set('source','workspace');
              Session.set('currentSpatialResolution',null);
              this.next();
            }
        ]
    });
    this.route('dataset',{
        path: '/datasets/:id',
        template: 'dataset',
        onBeforeAction: [
            function() {
                Session.set('currentDataSet',this.params.id);
                Session.set('screenMode', 'display');
                Session.set('inEditMode', false);
                this.next();
            }
        ]
    });
    this.route('dataSetsBySpatialResolution',{
        path: '/dataSetsBySpatialResolution/:resolution',
        template: 'datasets',
        onBeforeAction: [
            function() {
                Session.set('currentSpatialResolution',this.params.resolution);
                this.next();
            }
        ]
    });
    this.route('dataSets/Anywhere/BySpatialResolution',{
        path: '/dataSets/Anywhere/BySpatialResolution/:resolution',
        template: 'datasets',
        onBeforeAction: [
            function() {
                Session.set('source',null);
                Session.set('currentSpatialResolution',this.params.resolution);
                this.next();
            }
        ]
    });
    this.route('dataSets/Workspace/BySpatialResolution',{
        path: '/dataSets/Workspace/BySpatialResolution/:resolution',
        template: 'datasets',
        onBeforeAction: [
            function() {
                Session.set('source','workspace');
                Session.set('currentSpatialResolution',this.params.resolution);
                this.next();
            }
        ]
    });
    this.route('createDataset',{
        path: '/dataset',
        template: 'dataset',
        onBeforeAction: [
            function() {
                Session.set('screenMode', 'create');
                Session.set('inEditMode', true);
                Session.set('currentDataSet',undefined);
		            this.next();
            }
        ]
    });
    this.route('experiment',{
        path: '/experiment',
        template: 'experiment',
        onBeforeAction: [
            function() {
                Session.set('currentExperiment',undefined);
                this.next();
            }
        ]
    });
    this.route('experiments',{
        path: '/experiments',
        template: 'experiments',
        onBeforeAction: [
            function() {
                Session.set('currentSpatialResolution',null);
                this.next();
            }
        ]
    });
    this.route('experiments/Anywhere',{
        path: '/experiments/Anywhere',
        template: 'experiments',
        onBeforeAction: [
            function() {
                Session.set('source',null);
                Session.set('currentSpatialResolution',null);
                this.next();
            }
        ]
    });
    this.route('experiments/Workspace',{
        path: '/experiments/Workspace',
        template: 'experiments',
        onBeforeAction: [
            function() {
                Session.set('source','workspace');
                Session.set('currentSpatialResolution',null);
                this.next();
            }
        ]
    });
    this.route('experimentsById',{
        path: '/experiments/:id',
        template: 'experiment',
        onBeforeAction: [
            function() {
                Session.set('currentExperiment',this.params.id);
                this.next();
            }
        ]
    });
    this.route('experimentsBySpatialResolution',{
        path: '/experimentsBySpatialResolution/:resolution',
        template: 'experiments',
        onBeforeAction: [
            function() {
                Session.set('currentSpatialResolution',this.params.resolution);
                this.next();
            }
        ]
    });
    this.route('experiments/Anywhere/BySpatialResolution',{
        path: '/experiments/Anywhere/BySpatialResolution/:resolution',
        template: 'experiments',
        onBeforeAction: [
            function() {
                Session.set('source',null);
                Session.set('currentSpatialResolution',this.params.resolution);
                this.next();
            }
        ]
    });
    this.route('experiments/Workspace/BySpatialResolution',{
        path: '/experiments/Workspace/BySpatialResolution/:resolution',
        template: 'experiments',
        onBeforeAction: [
            function() {
                Session.set('source','workspace');
                Session.set('currentSpatialResolution',this.params.resolution);
                this.next();
            }
        ]
    });
    this.route('modelOutput',{
        path: '/modelOutput',
        template: 'modelOutput',
        onBeforeAction: [
            function() {
                Session.set('currentModelOutput',undefined);
                this.next();
            }
        ]
    });
    this.route('myModelOutputs');
    this.route('modelOutputs');
    this.route('modelOutputsById',{
        path: '/modelOutputs/:id',
        template: 'modelOutput',
        onBeforeAction: [
            function() {
                Session.set('currentModelOutput',this.params.id);
		this.next();
            }
        ]
    });
    this.route('analysis',{
        path: '/analysis/:id',
        template: 'analysis',
        onBeforeAction: [
            function() {
                Session.set('currentAnalysisId',this.params.id);
                this.next();
            }
        ]
    });
    this.route('models');
    this.route('model',{
        path: '/model',
        template: 'model',
        onBeforeAction: [
            function() {
                Session.set('currentModel',undefined);
                this.next();
            }
        ]
    });
    this.route('modelsById',{
        path: '/models/:id',
        template: 'model',
        onBeforeAction: [
            function() {
                Session.set('currentModel',this.params.id);
                this.next();
            }
        ]
    });
    this.route('analyses');
    this.route('file',{
        where: 'server',
        path: '/file/:id/:type',
        action: function() {
            var id = this.params.id;
            var filename = '/pals/data/'+id;
            var fs = Npm.require('fs');
            var file = fs.readFileSync(filename);
            var headers = {'Content-type': this.params.type};
            this.response.writeHead(200, headers);
            return this.response.end(file);
        }
    });
});

// Router.onBeforeAction(function(){
//     if (!Meteor.user()) {
//         this.render('login');
//         this.stop();
//     }
// }, {except: ['home','root','file']});
//
// if( Meteor.isClient ) {
//     Router.configure({
//       autoRender: false
//     });
// }
