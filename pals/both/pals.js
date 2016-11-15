// GLOBALS

FILE_BUCKET = '/pals/data'; // From the old file upload package
FILE_DIR = '/pals/data';

// Initialize Logger:
this.serverLog = new Logger();

// Initialize LoggerFile and enable with default settings:
var serverLogFile = new LoggerFile(serverLog, {
  fileNameFormat: function() {return 'server.log'},
  path: '/pals/logs/'
}).enable({
  enable: true,
  client: false,
  server: true
});

Router.configure({
    layoutTemplate: 'main',
    notFoundTemplate: 'notFound',
    waitOn: function() {
      return [
        Meteor.subscribe('workspaces')
      ]
    }
});

Router.plugin('dataNotFound', {notFoundTemplate: 'notFound'})

Router.map(function () {
    this.route('root',{
        path: '/',
        template: 'home'
    });
    this.route('workspaces');
    this.route('workspace',{
       path: '/workspace/:id',
       template: 'workspace',
       data: function() { return Workspaces.findOne({_id:this.params.id}); } /*,
       onBeforeAction: [
          function() {
              Session.set('currentWorkspace',this.params.id);
              this.next();
           }
       ]*/
    });
    this.route('term-of-use');
    this.route('privacy');
    this.route('dataSets',{
        path: '/dataSets/:source/:resolution',
        template: 'dataSets'
    });
    this.route('displayOrUpdateDataset',{
        path: '/dataSet/:screenMode/:id',
        template: 'dataSet',
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
        path: '/dataSet/:screenMode',
        template: 'dataSet',
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
                this.next()
            }
        ]
    });
    this.route('analyses');
    this.route('file',{
        where: 'server',
        path: '/file/:id/:type/:saveAs/:userId',
        action: function() {
            var userId = this.params.userId;
            var id = this.params.id;
            var filename = '/pals/data/'+id;
            serverLog.info("Downloading file", {_id: id}, userId);
            var fs = Npm.require('fs');
            var file = fs.readFileSync(filename);
            var headers = {
              'Content-type': this.params.type,
              'Content-Disposition': "attachment; filename=" + this.params.saveAs};
            this.response.writeHead(200, headers);
            serverLog.info("File downloaded", this.params.saveAs, userId);
            return this.response.end(file);
        }
    });
    this.route('logo', {
        where: 'server',
        path: '/logo/:name/:type',
        action: function() {
            var name = this.params.name;
            var filename = '/mnt/sharing/'+name;
            var fs = Npm.require('fs');
            var file = fs.readFileSync(filename);
            var headers = {'Content-type': this.params.type};
            this.response.writeHead(200, headers);
            return this.response.end(file);
        }
    });
});
