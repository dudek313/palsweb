var Fiber  = require('fibers')
var Future = require('fibers/future');


exports.migrateModels = function(pgInstance,mongoInstance,users,publicWorkspace,callback) {
//    mongoInstance.dropIndexes('models', callback); /* stops it using model.name as a unique identifier */
    console.log('Loading and copying models');
    loadModels(pgInstance,function(err, models){
        var mongoModels = [];
        for( var i=0; i < models.length; ++i ) {
            model = models[i];
            var user = users[model.ownerusername];
            if( !user ) {
                console.log('Could not find user: ' + model.owner_username);
            }
            else {
                var mongoModel = {
                    _id : model.id.toString(),
                    name : model.modelname,
                    owner : user._id,
//	I am adding the following. Not sure why they weren't included.
		                version: model.version,
                    created: model.createddate,
		                comments: model.commentsm,
		                references: model.referencesm,
		                url: model.urlm
//                    workspaces : [model.experiment_id.toString()]
                }
                mongoModels.push(mongoModel);
            }
        }
        processMongoModels(mongoInstance,mongoModels,callback)
    });
}


function loadModels(pgInstance,callback) {
/*    var loadModelsQuery = "SELECT * FROM model"; */
    var loadModelsQuery = "SELECT createddate, modelname, ownerusername, version, model.id, commentsm, referencesm, urlm, experimentable.experiment_id FROM model, experimentable WHERE model.id=experimentable.id AND experimentable.experiment_id IS NOT NULL AND modelname != ''";

    pgInstance.sql(loadModelsQuery,function(result,client){
        var models = [];
        result.rows.forEach(function(row){
            models.push(row);
//	    console.log(row);
        });
        callback(false, models);
    });

}

/*function loadModels(pgInstance,callback) {
    var loadModelsQuery = "SELECT * FROM model";
    pgInstance.sql(loadModelsQuery,function(result,client){
        var models = [];
        result.rows.forEach(function(row){
            models.push(row);
        });
        callback(false, models);
    });
}
*/

function processMongoModels(mongoInstance,mongoModels,callback) {
    remaining = [];
    waiting = mongoModels.length;
    for( var i=0; i < mongoModels.length; ++i ) {
        saveModel(mongoInstance,mongoModels[i],function(model){
            if(model) {
                remaining.push(model);
            }
            --waiting;
            if( waiting <=0 ) {
                if(remaining.len > 0 ) {
                    processMongoModels(mongoInstance,remaining,callback);
                }
                else {
                    callback(false, mongoModels);
                }
            }
        });
    }
}

function saveModel(mongoInstance,model,callback) {
    mongoInstance.findOne('models',{_id:model._id},function(err,doc){
        if( err ) console.log(err);
        if( doc ) {
            console.log('Already have model with id ' + model._id);
            callback();
        }
        else {
            findAndSaveModelUniqueName(mongoInstance,model,callback)
        }
    });
}


function findAndSaveModelUniqueName(mongoInstance,model,callback) {
//    mongoInstance.findOne('models',{name:model.name},function(err,doc2){
    mongoInstance.findOne('models',{name:model.name, version:model.version, owner:model.owner},function(err,doc2){
        if( err ) console.log(err);
        if( doc2 ) {
            console.log('Already have model with name ' + model.name + ' version ' + model.version + ' with owner user id ' + model.owner);
            model.name = model.name + '.1';
            callback(model);
        }
        else {
//            console.log('Model name: ' + model.name);
            console.log('Model name: ' + model.name + ' Version: ' + model.version + '  Owner user id: ' + model.owner);
            mongoInstance.insert('models',model,function(err){
                if( err ) console.log(err);
                callback();
            });
        }
    });
}
