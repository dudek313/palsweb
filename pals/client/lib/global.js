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

/** returns the ids of workspaces available to the current user */
getAvailableWorkspaceIds = function() {
    var workspaces = getAvailableWorkspaces();
    return getIdsFromObjects(workspaces);
}

/** takes an array of ids of documents in a collection and returns an array of the documents themselves */
getDocsFromIds = function(idArray, collection) {
    if (idArray)
        return collection.find({_id:{$in:idArray}}, {sort:{name:1}}).fetch();
    else {
        return [];
    }
}

getIdsFromObjects = function(objArray) {
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

/** given an array of objects and the names of one of the attributes,
returns an array of that particular object */
getAttributeArrayFromObjects = function(objArray, attrName) {
    var idArray = [];
    if (objArray && objArray.length > 0) {
        objArray.forEach(function(obj) {
            if (obj)
                idArray.push(obj[attrName]);
            else
                console.log('Object has no attribute ' + attrName);
        });
    }
    return idArray;
}

getCurrentObjectId = function() {
    return Router.current().params.id;
}

getDataSetVersion = function(dataSetId) {
    if (dataSetId) {
        dataSet = DataSets.findOne({_id:dataSetId});
        if (dataSet) return dataSet._version;
        else return null;
    }
    else return null;
}

getScreenMode = function() {
    return Router.current().params.screenMode;
}

getCurrentSpatialLevel = function() {
    return Router.current().params.resolution;
}

getSource = function() {
    return Router.current().params.source;
}

getCurrentWorkspaceId = function() {
    var user = Meteor.user();
    if( user ) {
        if( !user.profile ) {
            user.profile = {};
        }
        if( !user.profile.currentWorkspace ) {
            var rootWorkspace = Workspaces.findOne({"name":"browsing"});
            user.profile.currentWorkspace = rootWorkspace._id;
            Meteor.users.update({'_id':user._id},
                {'$set' : {'profile.currentWorkspace':user.profile.currentWorkspace}});
        }
        return user.profile.currentWorkspace;
    }
}

getCurrentWorkspace = function() {
    var workspaceId = getCurrentWorkspaceId();
    if (workspaceId) {
      var ws = Workspaces.findOne({_id: workspaceId});
      return ws
    }
    else return null;
}
