var oldDataDir = '/mnt/sharing/pals-nci/webappdata'
var newDataDir = '/pals/data'
//DF: var baseDir = '/vagrant/data/pals/webappdata'
//DF: var palsDataDir = '/pals/data-new'

var Fiber  = require('fibers')
var Future = require('fibers/future');
//var fs = Future.wrap(require('fs'));
var fs = Future.wrap(require('fs-extra'));
var uuid = require('node-uuid')



var helpers = require('./core/helpers.js');
var wsHelpers = require('./core/workspaces-migration.js')
var moHelpers = require('./core/models-migration.js')
var mooHelpers = require('./core/modelOutputs-migration.js')
var dsHelpers = require('./core/dataSets-migration.js')




function process() {

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

        wsHelpers.migrateWorkspaces(mongoInstance, pgInstance, users, pgWorkspaces);
        console.log('workspaces migrated...')

/*	Intending to get rid of public workspace
        var future = new Future;
        helpers.loadPublicWorkspace(mongoInstance, future.resolver());
        var publicWorkspace = future.wait();
        console.log('public workspace loaded...' + publicWorkspace)


        /*******************************************************
        *
        * Migrate models
        *
        *******************************************************/

        var future = new Future;
/*        moHelpers.migrateModels(pgInstance, mongoInstance, users, publicWorkspace, future.resolver()) */
        moHelpers.migrateModels(pgInstance, mongoInstance, users, null, future.resolver())
	      future.wait()
        console.log('models migrated...')


        /*******************************************************
        *
        * Migrate model datasets
        *
        *******************************************************/

// (old)       dsHelpers.migrateDataSets(oldDataDir, newDataDir, users,mongoInstance,pgWorkspaces,pgInstance,publicWorkspace)

        dsHelpers.migrateDataSets(oldDataDir, newDataDir, users,mongoInstance,pgWorkspaces,pgInstance)
        console.log('data sets migrated...')


        /*******************************************************
        *
        * Migrate model outputs
        *
        *******************************************************/

 //       mooHelpers.migrateModelOutputs(oldDataDir, newDataDir, users, mongoInstance, pgWorkspaces, pgInstance, publicWorkspace)
        mooHelpers.migrateModelOutputs(oldDataDir, newDataDir, users, mongoInstance, pgWorkspaces, pgInstance);
        console.log('model outputs migrated...')


      }).run();
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


process();
