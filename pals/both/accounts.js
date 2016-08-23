import './collections.js';

AccountsTemplates.configure({
  defaultLayout: 'main',
  sendVerificationEmail: true,
  enforceEmailVerification: true,
  termsUrl: 'term-of-use',
  showForgotPasswordLink: true,
  texts: {
    title: {
      signIn: "Log In"
    },
    button: {
      signIn: "Log In"
    }
  }
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

AccountsTemplates.removeField('email');
AccountsTemplates.removeField('password');

//var countryNames = CountryNames.slice();
var countryTuples = [];
CountryNames.forEach(function(countryName) {
  var tuple = {text: countryName, value: countryName};
  countryTuples.push(tuple);
})

AccountsTemplates.addFields([
  {
    _id: 'firstName',
    type: 'text',
    displayName: 'First name*',
    placeholder: 'First name',
    required: true,
    options: {
      public: true
    }
  }, {
    _id: 'surname',
    type: 'text',
    displayName: 'Last name*',
    placeholder: 'Last name',
    required: true,
    options: {
      public: true
    }
  }, {
    _id: 'organisation',
    type: 'text',
    displayName: 'Organisation*',
    placeholder: 'Organisation',
    required: true,
    options: {
      public: true
    }
  }, {
    _id: 'country',
    type: 'select',
    displayName: 'Country*',
    required: true,
    select: countryTuples,
    options: {
      public: true
    }
  }, {
    _id: 'currentWork',
    type: 'text',
    displayName: 'Brief description of current work*',
    placeholder: 'Tell us a little about your current work that might be relevant to PALS',
    required: true,
    options: {
      public: true,
      textArea: true,
    }
  }, {
    _id: 'webPage',
    type: 'text',
    displayName: 'Web page URL',
    placeholder: 'Web page URL',
    options: {
      public: true
    }
  }, {
    _id: 'email',
    type: 'email',
    displayName: 'Email*',
    required: true
  }, {
    _id: 'password',
    type: 'password',
    displayName: 'Password*',
    required: true
  }, {
    _id: 'requestsDataRecovery',
    type: 'checkbox',
    displayName: 'Recover my data from the previous PALS system',
    options: {
      putLast: true,
      introductoryMessage: 'If you used the previous PALS system and want to access your previous ' +
      'data on the current system, please check the box below and we will endeavour ' +
      'to recover and import it for you. Please allow two weeks for the recovery process to take place.'
    }
  }
]);
