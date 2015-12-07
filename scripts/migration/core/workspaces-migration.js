
var Fiber  = require('fibers')
var Future = require('fibers/future');




exports.migrateWorkspaces = function(mongoInstance, pgInstance, users, workspaces) {

    console.log("Loading shared lists");
    for( var i=0; i < workspaces.length; ++i ) {
        var future = new Future;
        loadSharedList(pgInstance,workspaces[i],future.resolver());
        future.wait();
    }

    console.log("mapping workspaces");
    mongoWorkspaces = mapWorkspaces(pgInstance,workspaces,users);

    for( var i=0; i < mongoWorkspaces.length; ++i ) {
        var future = new Future;
        saveWorkspace(mongoInstance, mongoWorkspaces[i], future.resolver());
        future.wait();
    }

}


function loadWorkspaces(pgInstance,callback) {

    var loadWorkspacesQuery = "SELECT id, name, owner_username from experiment";

    pgInstance.sql(loadWorkspacesQuery,function(result,client){
        var workspaces = [];
        result.rows.forEach(function(row){
            workspaces.push(row);
        });
        callback(false, workspaces);
    });
}




function loadSharedList(pgInstance,workspace,callback) {
    var loadSharedListQuery = "SELECT sharedlist_username FROM experiment_palsuser WHERE experiments_id = " + workspace.id;
    
    pgInstance.sql(loadSharedListQuery,function(result,client){
        workspace.users = [];
        result.rows.forEach(function(row){
            workspace.users.push(row);
        });
    
        callback(false);
    });
}


function mapWorkspaces(pgInstance,workspaces,users) {
    var mongoWorkspaces = [];
    for( var i=0; i < workspaces.length; ++i ) {
        workspace = workspaces[i];
        var user = users[workspace.owner_username];
        if( !user ) {
            console.log('Could not find user: ' + workspace.owner_username);
        }
        else {
            var guests = [];
            for( var j=0; j < workspace.users.length; ++j ) {
                var guest = users[workspace.users[j].sharedlist_username];
                if( guest ) guests.push(guest._id);
            }
            
            var newWorkspace = {
                _id : workspace.id.toString(),
                name : workspace.name,
                owner : user._id,
                guests : guests
            }
            mongoWorkspaces.push(newWorkspace);
        }
    }
    return mongoWorkspaces;
}


function saveWorkspace(mongoInstance,mongoWorkspace,callback) {
    mongoInstance.findOne('workspaces',{_id:mongoWorkspace._id},function(err,doc){
        if( err ) console.log(err);
        if( doc ) {
            console.log('Already have workspace with id ' + mongoWorkspace._id);
            callback(false);
        }
        else {
            mongoInstance.findOne('workspaces',{name:mongoWorkspace.name},function(err,doc2){
                if( err ) console.log(err);
                if( doc2 ) {
                    console.log('Already have workspace with name ' + mongoWorkspace.name + ' trying new name');
                    mongoWorkspace.name = mongoWorkspace.name + '(new)';
                }
                mongoInstance.insert('workspaces',mongoWorkspace,function(err){
                    if( err ) console.log(err);
                    callback(false);
                });
            });
        }
    });

}

