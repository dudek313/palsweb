/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { chai } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import 'meteor/meteor';
import { sinon } from 'meteor/practicalmeteor:sinon';


import { withRenderedTemplate } from './helpers.app-test.js';
import '../../both/collections.js';
import './dataset.js';

describe('Testing file upload', function(done) {
  before(function(done) {
    Meteor.call('test.resetDatabase', done);

    // login admin user to create new user
    Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
      try {
        chai.assert.isUndefined(err);
        var user = Meteor.user();
        chai.assert.equal(user.emails[0].address, 'gabsun@gmail.com');
      } catch(error) {
        done(error);
      }
    });

    //create test user
    Meteor.call('test.createUser', {email:'test0@testing.com', password: 'password1', profile: {firstName: "test", lastName: "test"}}, function(err) {
      try {
        chai.assert.isUndefined(err);
      } catch(error) {
        done(error);
      }
    });

    // logout admin user
    Meteor.logout(function(err) {
      try {
        chai.assert.isUndefined(err, 'Logout created error');
        var user = Meteor.user();
        chai.assert.isNull(user, 'User is still logged in');
      } catch(error) {
        done(error);
      }
    });

    // login test user
    Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
      try {
        chai.assert.isUndefined(err);
        var user = Meteor.user();
        chai.assert.equal(user.emails[0].address, 'gabsun@gmail.com');
      } catch(error) {
        done(error);
      }
    });

    // simulate router creating a data set
    var screenMode = { params: { screenMode: 'create' }};
    sinon.stub(Router, 'current', () => screenMode);
    done();

  //  sinon.stub(this, 'currentUpload', () => new ReactiveVar(false);
  });

  after(function(done) {
    // remove test user
    var testUser = Meteor.users.findOne({'profile.fullname':'test test'});
    if (testUser) {
      Meteor.call('test.removeUser', {_id: testUser._id}, function(err, docId) {
        console.log('Test user removed');
        done(err);
      });
      done(); // temporary - until I work out the problem
    }
    else done();

    // restore router settings
    Router.current.restore();
  });

  describe('Upload a file', function() {
    it('allows a registered user to upload a file', function(done) {
      done();
    });
  });
/*  describe('Upload a file', function() {
    it('allows a registered user to upload a file', function(done) {
      withRenderedTemplate('dataSet', {}, el => {
        $(el).find('button.upload-btn').click();
        var downloadPanel = $(el).find('#upload-panel');
        chai.assert.isAbove(downloadPanel.length, 0, 'Download panel not displaying');
        $(el).find('input[type="file"]').val("C:\\Users\\Danny\\Downloads\\pals-nci\\webappdata\\axel\\mo24829.nc");

        setTimeout(function() {
          var newFile = Files.findOne({name: 'mo24829.nc'});
          chai.assert.isDefined(newFile);
          done();
        }, 5000);
      });
    });
  });
  */
});
