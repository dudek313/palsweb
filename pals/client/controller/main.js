UI._allowJavascriptUrls();

Template.main.helpers({
  currentWorkspace: function() {
      return getCurrentWorkspace();
/*    var user = Meteor.user();
    if( user ) {
        if( !user.profile ) {
            user.profile = {};
        }
        if( !user.profile.currentWorkspace ) {
            console.log('here')
            var rootWorkspace = Workspaces.findOne({"name":"public"});
            user.profile.currentWorkspace = rootWorkspace._id;
            Meteor.users.update({'_id':user._id},
                {'$set' : {'profile.currentWorkspace':user.profile.currentWorkspace}});
        }
        workspaceId = user.profile.currentWorkspace;
        var ws = Workspaces.findOne({_id: workspaceId});
        return ws

    }

    else return null;
*/
  },
  isPublicWorkspace: function() {
      var currentWorkspace = getCurrentWorkspace();
      if( currentWorkspace && (currentWorkspace.name == 'public')) {
          return true;
      }
      else {
          return false;
      }
  }

})
