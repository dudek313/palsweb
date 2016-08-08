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

/** Used by templates to check if user is authorized to use a page associated with a particular object, eg data set, model, etc.
/* If in display mode, will always return true. If in create mode, user must be registered and logged in.
/* If in update mode, user must have an edit role for the particular object.
/* If not in any mode (ie invalid url used), will return true to allow page to redirect to 'page not found' template
*/
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

Template.registerHelper("toolTipIfNotLoggedIn", function( ) {
      return (!Meteor.user()) ? "You must register or log in to use this feature" : "";
});

Template.registerHelper("disabledIfNotInWorkspace", function( ) {
      var currentWorkspace = getCurrentWorkspace();
      if (currentWorkspace)
          return (currentWorkspace.name == 'browsing') ? "disabled" : ""
      else
          return "disabled";
});

Template.registerHelper("toolTipIfNotInWorkspace", function( ) {
      var currentWorkspace = getCurrentWorkspace();
      if (currentWorkspace)
          return (currentWorkspace.name == 'browsing') ? "You must be in a workspace to use this feature" : ""
      else
          return "You must be in a workspace to use this feature";
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

Template.registerHelper('authorised', function(action, objType, id) {
    var userId = Meteor.userId();
    var group = objType + "s";
    var groupWithId = objType + ": " + id;
    var authorised = Roles.userIsInRole(userId, action, group) || Roles.userIsInRole(userId, action, groupWithId);
    return authorised;
});

Template.registerHelper('authorisedToEdit', function(objType, id) {
    var userId = Meteor.userId();
    var group = objType + "s";
    var groupWithId = objType + ": " + id;
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
