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
  greyIfLoggedOut: function() {
      if (Meteor.user()) return ""
      else {
        console.log("grey");
        return "color:gray";
      }
  },
  disabledInBrowseMode: function( ) {
      if (Meteor.user()) {
          var currentWorkspace = getCurrentWorkspace();
          if  (currentWorkspace.name == 'public') {
              return "disabled";
          }
          else return "";
      }
      else return "disabled";
  },
  currentWorkspace: function() {
      return getCurrentWorkspace();
  },
  /*
  loggedIn: function() {
      if( Meteor.user() ) return true;
      else return false;
  },*/
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

/*Template.main.currentWorkspace = function() {
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

Template.main.loggedIn = function() {
    if( Meteor.user() ) return true;
    else return false;
}

Template.main.isPublicWorkspace = function() {
    currentWorkspace = Template.main.currentWorkspace();
    if( currentWorkspace && (currentWorkspace.name == 'public')) {
        return true;
    }
    else {
        return false;
    }
}
*/
