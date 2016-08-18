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

  it('should allow registered user to login @watch', function() {
    browser.url('http://localhost:3000');
    browser.pause(1000);
    browser.click(".login-btn");
    browser.pause(500);
//    browser.setValue('#at-field-username_and_email', 'gabsun@gmail.com');
//    browser.setValue('#at-field-password', 'password');
//    browser.click(".at-btn");
//    browser.pause(300);
//    var text = browser.getText("login-name-link");

//    expect(text).to.equal("gab");
  });
});

describe('Logout', function() {

  it('should allow registered user to logout @watch', function() {
    browser.url('http://localhost:3000');
    browser.pause(2000);
    browser.click("login-name-link");
    browser.click("login-buttons-logout");
    var text = browser.getText(".login-btn");

    expect(text).to.equal("PALS");

  });
});
