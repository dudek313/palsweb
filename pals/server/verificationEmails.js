Accounts.urls.verifyEmail = function(token) {
  return Meteor.absoluteUrl('verify-email/' + token, {rootUrl: 'http://192.168.56.120:3000'});
};

Accounts.emailTemplates.siteName = "PALS";
Accounts.emailTemplates.from     = "PALS <admin@pals.org>";

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return "[PALS] Verify Your Email Address";
  },
  text( user, url ) {
    let emailAddress   = user.emails[0].address,
//        urlWithoutHash = url.replace( '#/', '' ),
        supportEmail   = "support@pals.org",
        emailBody      = `To verify your email address (${emailAddress}) visit the following link:\n\n${url}\n\n If you did not request this verification, please ignore this email. If you feel something is wrong, please contact our support team: ${supportEmail}.`;
    return emailBody;
  }
};
