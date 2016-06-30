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
          if  (currentWorkspace.name == 'public') {
              return "disabled";
          }
          else return "";
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

getCurrentWorkspaceId = function() {
    var user = Meteor.user();
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
        return user.profile.currentWorkspace;
    }
}

getCurrentWorkspace = function() {
        var workspaceId = getCurrentWorkspaceId();
        if (workspaceId) {
              var workspace = Meteor.call('findWorkspace', {_id: workspaceId}, function(error, doc) {
                  if (error) {
                      $('.error').html('Server error');
                      $('.error').show();
                  }
                  else return workspace;
              });
        }
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
