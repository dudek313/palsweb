Handlebars.registerHelper('selected', function(foo, bar) {
    return foo == bar ? 'selected' : '';
});

Template.registerHelper("loggedIn", function() {
      if( Meteor.user() ) return true;
      else return false;
});
