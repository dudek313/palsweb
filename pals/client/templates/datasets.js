Template.datasets.dataSets = function() {
    var user = Meteor.user();
    return DataSets.find({'workspaces':user.profile.currentWorkspace._id});
}