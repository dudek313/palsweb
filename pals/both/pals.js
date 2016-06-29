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
       path: '/workspace/:id',
       template: 'workspace',
       onBeforeAction: [
          function() {
              Session.set('currentWorkspace',this.params.id);
              this.next();
           }
       ]
    });
    this.route('datasets',{
        path: '/datasets/:source/:resolution',
        template: 'datasets'
/*        onBeforeAction: [
            function() {
                if (this.params.resolution == 'All')
                    Session.set('currentSpatialLevel', null)
                else {
                    Session.set('currentSpatialLevel',this.params.resolution);
                }
                if (this.params.source == 'anywhere') {
                    Session.set('source',null)
                    this.next();
                }
                else {
                    var user = Meteor.user();
                    if (user) {
                        Session.set('source',this.params.source);
                        this.next();
                    }
                }

            }
        ]*/
    });
    this.route('dataset',{
        path: '/dataset/:screenMode/:id',
        template: 'dataset',
        data: function() { return DataSets.findOne({_id:this.params.id}); }
/*        onBeforeAction: [
            function() {
                Session.set('currentDataSet',this.params.id);
                Session.set('screenMode', 'display');
                this.next();
            }
        ]*/
    });
    this.route('createDataset',{
        path: '/dataset/:screenMode',
        template: 'dataset',
        onBeforeAction: [
            function() {
//                Session.set('screenMode', 'create');
                createDummyDataSet();
  	            this.next();
            }
        ]
    });
    this.route('createExperiment',{
        path: '/experiment/:screenMode',
        template: 'experiment',
        onBeforeAction: [
            function() {
//                Session.set('screenMode', 'create');
                Session.set('tempScripts', []);
                Session.set('tempDataSets', []);
                Session.set('tempModelOutputs', []);
                this.next();
            }
        ]
    });
    this.route('experiments',{
        path: '/experiments/:source/:resolution',
        template: 'experiments'
/*        onBeforeAction: [
            function() {
                if (this.params.resolution == 'All')
                    Session.set('currentSpatialLevel', null)
                else {
                    Session.set('currentSpatialLevel',this.params.resolution);
                }

                if ((this.params.source == 'workspace') && (Meteor.user())
                    || (this.params.source == 'Templates')
                    || (this.params.source == 'anywhere')) {
                        Session.set('source', this.params.source);
                        this.next();
                    }

            }
        ]*/
    });
    this.route('displayOrUpdateExperiment',{
        path: '/experiment/:screenMode/:id',
        template: 'experiment',
        data: function() { return Experiments.findOne({_id:this.params.id}) }
/*        onBeforeAction: [
            function() {
                Session.set('currentExperiment',this.params.id);
                Session.set('screenMode','display');
                this.next();
            }
        ]*/
    });
    this.route('uploadModelOutput',{
        path: '/uploadModelOutput',
        template: 'modelOutput',
        data: function() { return null }
/*
        onBeforeAction: [
            function() {
                Session.set('currentModelOutput',undefined);
                this.next();
            }
        ]
*/
    });
//    this.route('myModelOutputs');
    this.route('modelOutputs',{
        path: '/modelOutputs/:source',
        template: 'modelOutputs'
/*        data: function() {
            return this.params.source;

      },
        onBeforeAction: [
            function() {
                Session.set('source', this.params.source);
                this.next();
            }
        ]
*/
    });
    this.route('displayOrUpdateModelOutput',{
        path: '/modelOutput/:screenMode/:id',
        template: 'modelOutput',
        data: function() { return ModelOutputs.findOne({_id : this.params.id}) }
/*        onBeforeAction: [
            function() {
                Session.set('currentModelOutput',this.params.id);
		            this.next();
            }
        ]*/
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
    this.route('models', {
        path: '/models/:selector',
        template: 'models',
        onBeforeAction: [
            function() {
                Session.set('selector', this.params.selector);
                this.next();
            }
        ]
    });
    this.route('createModel',{
        path: '/model/create',
        template: 'model',
        onBeforeAction: [
            function() {
                Session.set('currentModel',undefined);
                Session.set('screenMode', 'create');
                this.next();
            }
        ]
    });
    this.route('modelById',{
        path: '/model/display/:id',
        template: 'model',
        onBeforeAction: [
            function() {
                Session.set('currentModel',this.params.id);
                Session.set('screenMode', 'display');
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

function createDummyDataSet() {
    var dummyDataSet = {
        name: new Meteor.Collection.ObjectID()._str,
        type: 'flux tower',
        spatialLevel: 'SingleSite'
    };
    Meteor.call('createDraftDataSet', dummyDataSet, function(error, docId){
        if(error) {
            $('.error').html('There was a server error. Are you logged in?');
            $('.error').show();
            console.log(error.reason);
        }
        else {
            console.log('Draft data set created: ' + docId);
            Session.set('currentDataSet', docId);
        }
    });
}

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
