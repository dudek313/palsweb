
AccountsTemplates.configure({
  defaultLayout: 'main',
  sendVerificationEmail: true,
  enforceEmailVerification: true,
  termsUrl: 'term-of-use',
  privacyUrl: 'privacy',
  showForgotPasswordLink: true,
});

AccountsTemplates.configureRoute('signIn', {
    name: 'signIn',
    path: '/login',
    template: 'signIn',
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
    displayName: 'Full name',
    required: true,
    options: {
      italicisedText: '(public)'
    }
  }, {
    _id: 'organisation',
    type: 'text',
    dispayName: 'Organisation',
    required: true,
    options: {
      italicisedText: '(public)'
    }
  }, {
    _id: 'country',
    type: 'text',
    dispayName: 'Country',
    options: {
      italicisedText: '(optional)'
    }
  }, {
    _id: 'currentWork',
    type: 'text',
    dispayName: 'Brief description of current work',
    required: true,
    options: {
      italicisedText: '(public)'
    }
  }, {
    _id: 'webPage',
    type: 'text',
    dispayName: 'Web page',
    options: {
      italicisedText: '(optional, public)'
    }
  }, {
    _id: 'requestsDataRecovery',
    type: 'checkbox',
    displayName: 'Recover my data from the previous PALS system'
  }
])
