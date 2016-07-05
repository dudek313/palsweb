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
    return getIdsFromObjects(workspaces);
}


getRecordsFromIds = function(idArray, collection) {
    return collection.find({_id:{$in:idArray}}, {sort:{name:1}});
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
            var rootWorkspace = Workspaces.findOne({"name":"public"});
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
