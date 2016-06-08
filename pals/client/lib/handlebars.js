Handlebars.registerHelper('selected', function(foo, bar) {
    return foo == bar ? 'selected' : '';
});

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
