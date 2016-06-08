UI._allowJavascriptUrls();

getCurrentWorkspace = function() {
    var user = Meteor.user();
    if( user ) {
        if( !user.profile ) {
            user.profile = {};
        }
        if( !user.profile.currentWorkspace ) {
            console.log('here')
            var rootWorkspace = Workspaces.findOne({"name":"public"});
            user.profile.currentWorkspace = rootWorkspace;
            Meteor.users.update({'_id':user._id},
                {'$set' : {'profile.currentWorkspace':user.profile.currentWorkspace}});
        }
        return user.profile.currentWorkspace;
    }
}

Template.main.helpers({
  currentWorkspace: function() {
      return getCurrentWorkspace();
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
