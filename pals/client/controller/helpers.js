Handlebars.registerHelper('breaklines',
    function(text) {
        if(text) {
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        }
        return text;
    }
);

Handlebars.registerHelper("reference", function() {
    var reference = Reference.findOne();
    return reference;
});

Handlebars.registerHelper('encode',
    function(str) {
        return encodeURIComponent(str);
    }
);

Template.registerHelper("loggedIn", function() {
      if( Meteor.user() ) return true;
      else return false;
});

Template.registerHelper("disabledInBrowseMode", function( ) {
      if (Meteor.user()) {
          var currentWorkspace = getCurrentWorkspace();
          if (currentWorkspace) {
              if  (currentWorkspace.name == 'public') {
                  return "disabled";
              }
              else return "";
          }
      }
      else return "disabled";
});

Template.registerHelper("greyIfLoggedOut", function() {
    if (Meteor.user()) return ""
    else {
      return "color:lightgray";
    }
});

Template.registerHelper("areEqual", function(firstString,secondString) {
    if( firstString === secondString ) {
        return true;
    }
});

Template.registerHelper("screenMode", function() {
    return getScreenMode();
});

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

/*
// tried to write this with Meteor methods, but apparently it's too slow
//  to retrieve the data for page rendering

getCurrentWorkspace = function() {
    var workspaceId = getCurrentWorkspaceId();
    if (workspaceId) {
          Meteor.call('findWorkspace', {_id: workspaceId}, function(error, workspace) {
              if (error) {
                  $('.error').html('Server error');
                  $('.error').show();
                  return null;
              }
              else {
                  return workspace;
              }
          });
    }
    else return null;
}
*/
