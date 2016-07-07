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
      return "logged-out";
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

Template.registerHelper('authorisedToEdit', function(objType, id) {
    var userId = Meteor.userId();
    var group = objType;
    if (id != 'all')
        var group = group + ": " + id;
    var authorised = Roles.userIsInRole(userId, 'edit', group);
    return authorised;
});

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
