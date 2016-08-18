Template.registration.events({
  'click .submit': function(event) {
    window.scrollTo(0,0);
  }
});

Template.registration.helpers({
  atDisabled: function() {
    return AccountsTemplates.disabled();
  },

  enabledStatus: function() {
    return AccountsTemplates.disabled() ? 'disabled' : 'active';
  }
});
