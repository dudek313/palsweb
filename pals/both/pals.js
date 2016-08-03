// GLOBALS

FILE_BUCKET = '/pals/data';

Router.configure({
    layoutTemplate: 'main',
    notFoundTemplate: 'notFound'
});

//Router.plugin('dataNotFound', {notFoundTemplate: 'notFound'})

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
    });
    this.route('displayOrUpdateDataset',{
        path: '/dataset/:screenMode/:id',
        template: 'dataset',
        data: function() { return DataSets.findOne({_id:this.params.id}); },
        onBeforeAction: [
            function() {
                $('.error').hide();
                if (this.params.screenMode == 'update') {
                    ds = DataSets.findOne({_id:this.params.id});
                    if (ds) {
                        Session.set('tempFiles', ds.files);
                    }
                    Session.set('uploadButtonClicked', false);
                }
                this.next();
            }
        ]
    });
    this.route('createDataset',{
        path: '/dataset/:screenMode',
        template: 'dataset',
        onBeforeAction: [
            function() {
                Session.set('tempFiles', []);
                Session.set('uploadButtonClicked', false);
                this.next();
            }
        ]
    });
    this.route('createExperiment',{
        path: '/experiment/:screenMode',
        template: 'experiment',
        data: function() { return null },
        onBeforeAction: [
            function() {
                Session.set('tempScripts', []);
                Session.set('tempDataSets', []);
                this.next();
            }
        ]
    });
    this.route('experiments',{
        path: '/experiments/:source/:resolution',
        template: 'experiments'
    });
    this.route('displayOrUpdateExperiment',{
        path: '/experiment/:screenMode/:id',
        template: 'experiment',
        data: function() { return Experiments.findOne({_id:this.params.id}) },
        onBeforeAction: [
            function() {
                $('.error').hide();
                if (this.params.screenMode == 'update') {
                    exp = Experiments.findOne({_id:this.params.id});
                    if (exp) {
                        Session.set('tempScripts', exp.scripts);
                        Session.set('tempDataSets', exp.dataSets);
                    }
                }
                this.next();
            }
        ]
    });
    this.route('createModelOutput',{
        path: '/modelOutput/:screenMode',
        template: 'modelOutput',
        data: function() { return null },
        onBeforeAction: [
            function() {
                Session.set('tempFile',undefined);
                Session.set('tempBenchmarks', []);
                Session.set('tempAnalyses', []);
                this.next();
            }
        ]
    });
    this.route('modelOutputs',{
        path: '/modelOutputs/:source',
        template: 'modelOutputs'
    });
    this.route('displayOrUpdateModelOutput',{
        path: '/modelOutput/:screenMode/:id',
        template: 'modelOutput',
        data: function() { return ModelOutputs.findOne({_id : this.params.id}); },
        onBeforeAction: [
            function() {
                $('.error').hide();
                if (this.params.screenMode == 'update') {
                    var mo = ModelOutputs.findOne({_id:this.params.id});
                    if (mo) {
                        Session.set('tempFile', mo.file);
                        Session.set('tempBenchmarks', mo.benchmarks);
                        var analyses = Analyses.find({modelOutput:mo._id}).fetch();
                        var analysisIds = getIdsFromObjects(analyses);
                        Session.set('tempAnalyses', analysisIds);
                        Session.set('analysesToDelete', []);
                    }
                }
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
    this.route('models', {
        path: '/models/:source',
        template: 'models'
    });
    this.route('createModel',{
        path: '/model/:screenMode',
        template: 'model'
    });
    this.route('displayOrUpdateModel',{
        path: '/model/:screenMode/:id',
        template: 'model',
        data: function() { return Models.findOne({_id : this.params.id}) },
        onBeforeAction: [
            function() {
                $('.error').hide();
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

/** Confirms before allowing a user to navigate away from a page before saving edits.
/* Doesn't work
Router.onBeforeAction(function(pause) {
    if(Session.get('dirty')) {
        if(confirm("Are you sure you want to navigate away?")) {
            Session.set('dirty', false);
            this.next();
        }
    }
    else {
        this.next();
    }
});
*/
