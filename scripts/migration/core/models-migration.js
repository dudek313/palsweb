
var Fiber  = require('fibers')
var Future = require('fibers/future');


exports.migrateModels = function(pgInstance,mongoInstance,users,publicWorkspace,callback) {
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
                    workspaces : [publicWorkspace._id]
                }
                mongoModels.push(mongoModel);
            }
        }
        processMongoModels(mongoInstance,mongoModels,callback)
    });
}


function loadModels(pgInstance,callback) {
    var loadModelsQuery = "SELECT * FROM model";

    pgInstance.sql(loadModelsQuery,function(result,client){
        var models = [];
        result.rows.forEach(function(row){
            models.push(row);
        });
        callback(false, models);
    });

}



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
    mongoInstance.findOne('models',{name:model.name},function(err,doc2){
        if( err ) console.log(err);
        if( doc2 ) {
            console.log('Already have model with name ' + model.name + ' trying new name');
            model.name = model.name + '.1';
            callback(model);
        }
        else {
            console.log('Model name: ' + model.name);
            mongoInstance.insert('models',model,function(err){
                if( err ) console.log(err);
                callback();
            });
        }
    });
}



