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
    var workspaceIds = [];
    workspaces.forEach(function(workspace){
        workspaceIds.push(workspace._id);
    });
    return workspaceIds;
}
