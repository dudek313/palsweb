getAvailableWorkspaces = function() {
/*    var workspaces = Workspaces.find({'public':true}).fetch();
    var user = Meteor.user();
    if( user ) {
        sharedWorkspaces =  Workspaces.find({'guests':user._id}).fetch();
        Array.prototype.push.apply(workspaces, sharedWorkspaces);
    } */
    var selector = {'public':true};
    var user = Meteor.user();
    if( user ) {
        selector = {$or: [selector, {'owner':user._id}, {'guests':user._id}]};
    }
    workspaces = Workspaces.find(selector).fetch();

    return workspaces;
}

getAvailableWorkspaceIds = function() {
    var workspaces = getAvailableWorkspaces();
    return convertObjectsToIdArray(workspaces);
/*    var workspaceIds = [];
    workspaces.forEach(function(workspace){
        workspaceIds.push(workspace._id);
    });
    return workspaceIds;*/
}


getRecordsFromIds = function(idArray, collection) {
    return collection.find({_id:{$in:idArray}}, {sort:{name:1}});
}
/*    var objArray = [];
    if (idArray && idArray.length > 0) {
        idArray.forEach(function(eachId) {
            record = collection.findOne({_id: eachId});
            if (record)
                objArray.push(record);
            else {
                console.log('Record not found: ' + eachId);
            }
        });
    }
    return objArray;
}*/

convertObjectsToIdArray = function(objArray) {
    var idArray = [];
    if (objArray && objArray.length > 0) {
        objArray.forEach(function(obj) {
            if (obj._id)
                idArray.push(obj._id);
            else
                console.log('Object has no _id value');
        });
    }
    return idArray;
}
