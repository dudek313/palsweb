/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

// These are Chimp globals
/* globals browser assert server */


describe('Start Pals', function() {
  it('should open the PALS home page @watch', function() {
    browser.url('http://localhost:3000');
    browser.waitForExist("h1");
    var text = browser.getText("h1");
    expect(text).to.equal("PALS");
  });
});


describe('Login', function() {
  before
  it('should allow registered user to login @watch', function() {
    browser.waitForExist(".login-link-text");
    browser.click(".login-link-text");
    browser.pause(1000);
//    browser.waitForVisible("login-email");
    browser.elementIdValue("login-email", 'gabsun@gmail.com');
//    browser.elementIdValue("login-password", 'password');

  });
});
