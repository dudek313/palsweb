var oldDataDir = '/mnt/legacy_data'
var newDataDir = ''
//DF: var baseDir = '/vagrant/data/pals/webappdata'
//DF: var palsDataDir = '/pals/data-new'

var Fiber  = require('fibers')
var Future = require('fibers/future');
//var fs = Future.wrap(require('fs'));
var fs = Future.wrap(require('fs-extra'));
var uuid = require('node-uuid');
var prompt = require('prompt');


var helpers = require('./core/helpers.js');
var wsHelpers = require('./core/workspaces-migration.js')
var moHelpers = require('./core/models-migration.js')
var mooHelpers = require('./core/modelOutputs-migration.js')
var dsHelpers = require('./core/dataSets-migration.js')

var swiftClient = require('pkgcloud').storage.createClient({
    provider: 'openstack',
    username: process.env.OS_USERNAME,
    password: process.env.OS_PASSWORD,
    tenantId: process.env.OS_TENANT_ID,
    region: process.env.OS_REGION_NAME,
    authUrl: process.env.OS_AUTH_URL,
    version: process.env.version
});



function migrationProcess() {

  prompt.start();
  var promptSchema = {
    properties: {
      username: {
        description: 'Please enter username of the user requiring data migration',
        required: true
      }
    }
  }
  prompt.get(promptSchema, function(err, result) {
    if(err) { return onErr(err); }
    var username = result.username;

    Fiber(function(){
        var mongoInstance = helpers.mongo();
        var pgInstance    = helpers.postgres();

        //mimic sync connect/wait to mongo
        var future = new Future;
        mongoInstance.connect(future.resolver());
        future.wait();

        //mimic sync connect/wait to pg
        var future = new Future;
        pgInstance.connect(future.resolver());
        future.wait();

        console.log('connections ready...')


        /*******************************************************
        *
        * Load users from mongo and old experiments (pg workspaces)
        * from postgres.
        * Assume users and public workspace exist in mongo
        *
        *******************************************************/

        var future = new Future;
        helpers.loadUsers(mongoInstance, future.resolver());
        var users = future.wait();
        console.log('users loaded...' + Object.keys(users).length)


        var future = new Future;
        helpers.loadPgWorkspaces(pgInstance, future.resolver());
        var pgWorkspaces = future.wait();
        console.log('pg workspaces loaded...' + Object.keys(pgWorkspaces).length)


        /*******************************************************
        *
        * Migrate workspaces
        *
        *******************************************************/

//        wsHelpers.migrateWorkspaces(mongoInstance, pgInstance, users, pgWorkspaces);
  //      console.log('workspaces migrated...')

/*	Intending to get rid of public workspace
        var future = new Future;
        helpers.loadPublicWorkspace(mongoInstance, future.resolver());
        var publicWorkspace = future.wait();
        console.log('public workspace loaded...' + publicWorkspace)




        /*******************************************************
        *
        * Migrate model datasets
        *
        *******************************************************/


//        dsHelpers.migrateDataSets(oldDataDir, newDataDir, users,mongoInstance,pgWorkspaces,pgInstance);
  //      console.log('data sets migrated...')


        /*******************************************************
        *
        * Migrate model outputs
        *
        *******************************************************/

        mooHelpers.migrateModelOutputs(oldDataDir, newDataDir, swiftClient, username, users, mongoInstance, pgWorkspaces, pgInstance);
        console.log('model outputs migrated...')


      }).run();
    });
};


/*
    mongoInstance.connect(function(err){
        if( !err ) {
            loadUsers(mongoInstance,function(users) {
                pgInstance.connect(function(err){
                    if( !err ) {
                        loadAndCopyWorkspaces(pgInstance,mongoInstance,users,function(workspaces){
                            console.log('loading public workspace');
                            loadPublicWorkspace(mongoInstance,function(err,result){
                                if( err ) console.log(err);
                                else {
                                    processDataSets(users,mongoInstance,workspaces,pgInstance,result);
                                    loadAndCopyModels(pgInstance,mongoInstance,users,result,function(models){
                                        console.log('Models copied')
                                        processModelOutputs(users,mongoInstance,workspaces,pgInstance,result);
                                    });
                                }
                            });
                        });
                    }
                });
            });
        }
    });
*/

  
migrationProcess();
