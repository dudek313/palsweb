
AccountsTemplates.configure({
  defaultLayout: 'main',
  sendVerificationEmail: true,
  enforceEmailVerification: true,
  termsUrl: 'term-of-use',
  privacyUrl: 'privacy',
  showForgotPasswordLink: true,
});

AccountsTemplates.configureRoute('signIn', {
    name: 'sign-in',
    path: '/login',
    template: 'sign-in',
    layoutTemplate: 'main',
    redirect: '/',
});
AccountsTemplates.configureRoute('signUp', {
    name: 'sign-up',
    path: '/registration',
    template: 'registration',
    layoutTemplate: 'main',
    redirect: '/',
});
AccountsTemplates.configureRoute('verifyEmail');

AccountsTemplates.addFields([
  {
    _id: 'name',
    type: 'text',
    displayName: 'Name',
    required: true
  }, {
    _id: 'username',
    type: 'text',
    displayName: 'Username',
    required: true
  }, {
    _id: 'organization',
    type: 'text',
    dispayName: 'Organization',
    required: true
  }, {
    _id: 'city',
    type: 'text',
    dispayName: 'City',
    required: true
  }, {
    _id: 'country',
    type: 'text',
    dispayName: 'Country',
    required: true
  }, {
    _id: 'requestsDataRecovery',
    type: 'checkbox',
    displayName: 'Recover my data from the previous PALS system'
  }
])
