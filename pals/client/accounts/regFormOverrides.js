Template['override-atForm'].replaces('atForm');
Template['override-atPwdForm'].replaces('atPwdForm');
Template['override-atInput'].replaces('atInput');
Template['override-atTextInput'].replaces('atTextInput');
Template['override-atPwdFormBtn'].replaces('atPwdFormBtn');
Template['override-atSelectInput'].replaces('atSelectInput');

Template.atPwdForm.helpers({
  isRegistrationForm: function() {
    return (AccountsTemplates.getState() == 'signUp');
  }
})

Template.atForm.helpers({
  atDisabled: function() {
    return AccountsTemplates.disabled();
  }
});
