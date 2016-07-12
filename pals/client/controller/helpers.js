Handlebars.registerHelper('breaklines',
    function(text) {
        if(text) {
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        }
        return text;
    }
);

Handlebars.registerHelper("inUpdateMode", function() {
      return (getScreenMode()=='update');
});

Handlebars.registerHelper("inDisplayMode", function() {
      return (getScreenMode()=='display');
});

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

Template.registerHelper("authorized", function(objType, id) {
    var userId = Meteor.userId();
    var screenMode = getScreenMode();
    var group = objType + ': ' + id;
    if (screenMode == 'display' || (screenMode == 'create' && userId) ||
        (screenMode == 'update' && Roles.userIsInRole(userId, 'edit', group)) ||
        (screenMode != 'display' && screenMode != 'update' && screenMode != 'create')) // needs to display 'Page not found'
        return true;
    else
        return false;
});

Template.registerHelper("inEditMode", function() {
      var screenMode = getScreenMode();
      return (screenMode =='update' || screenMode =='create');
});

Template.registerHelper("disabledIfNotLoggedIn", function( ) {
      return (!Meteor.user()) ? "disabled" : "";
});

Template.registerHelper("disabledIfNotInWorkspace", function( ) {
      var currentWorkspace = getCurrentWorkspace();
      if (currentWorkspace)
          return (currentWorkspace.name == 'public') ? "disabled" : ""
      else
          return "disabled";
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
    var group = objType + "s";
    var groupWithId = group + ": " + id;
    var authorised = Roles.userIsInRole(userId, 'edit', group) || Roles.userIsInRole(userId, 'edit', groupWithId);
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
