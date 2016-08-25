/* eslint-env mocha */

import 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';

import '../../both/collections.js';

/*import { resetDatabase } from 'meteor/xolvio:cleaner';

Meteor.methods({
  'test.resetDatabase': function(callback) {
    resetDatabase({excludedCollections: ['users']}, callback)
  }
});*/

describe('my module', function(done) {
  beforeEach(function(done) {
    Meteor.call('test.resetDatabase', done);
  });

  describe('Login Admin', function() {
    it('allows an admin user to login', function(done) {

      Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
        console.log(err);
        chai.assert.isUndefined(err);
        var user = Meteor.user();
        chai.assert.equal(user.emails[0].address, 'gabsun@gmail.com');
        done();
      });
    });
  });


  describe('Register new user', function() {
    it('allows a new user to be registered on the system', function(done) {
      Meteor.call('test.createUser', {email:'test0@testing.com', password: 'password1'}, function(err) {
        console.log(err);
        chai.assert.isUndefined(err);
        done()
      });
    });
  });

  describe('logout', function() {
    it('allows a logged-in user to logout', function(done) {
      Meteor.logout(function(err) {
        chai.assert.isUndefined(err);
        var user = Meteor.user();
        chai.assert.isNull(user);
        done();
      });
    });
  });

  describe('try to insert model when not logged in', function(done) {
    it('does not allow unregistered user to insert a model', function(done) {
      var newModel = makeModel("Model 2");
      Meteor.call('insertModel', newModel, function(err, modelId) {
        chai.assert.isDefined(err);
        var insertedModel = Models.findOne({_id: modelId});
        chai.assert.isUndefined(insertedModel);
        done();
      });
    });
  });

  describe('Login registered user', function() {
    it('allows a registered user to login', function(done) {

      Meteor.loginWithPassword('test0@testing.com', 'password1', function(err) {
        console.log(err);
        chai.assert.isUndefined(err);
        var user = Meteor.user();
        chai.assert.equal(user.emails[0].address, 'gabsun@gmail.com');
        done();
      });
    });
  });

  describe('Insert new model', function(done) {
    it('allows a registered user to insert a model', function(done) {

      var newModel = makeModel("Model 1");
      Meteor.call('insertModel', newModel, function(err, modelId) {
        console.log('err');console.log(err);
        console.log('modelId');console.log(modelId);
        chai.assert.isUndefined(err);
        var insertedModel = Models.findOne({_id: modelId});
        chai.assert.equal(insertedModel.name, 'Model 1');
        done();
      });
    });
  });

  describe('Insert duplicate model', function(done) {
    it('does not allow a registered user to insert a duplicate model', function(done) {

      var newModel = makeModel("Model 1");
      Meteor.call('insertModel', newModel, function(err, modelId) {
        chai.assert.isUndefined(err);
        var insertedModel = Models.findOne({_id: modelId});
        chai.assert.equal(insertedModel.name, 'Model 1');
        done();
      });

      var newModel = makeModel("Model 1");
      Meteor.call('insertModel', newModel, function(err, modelId) {
        chai.assert.isDefined(err);
        var insertedModel = Models.findOne({_id: modelId});
        chai.assert.isUndefined(insertedModel);
        done();
      });

    });
  });

  describe('insertWorkspace', function(done) {
    it('allows a registered user to insert a new workspace', function(done) {
      Meteor.call('insertWorkspace', "WS 1", function(err, wsId) {
        chai.assert.isUndefined(err);
        var insertedWS = Workspaces.findOne({_id: wsId});
        chai.assert.equal(insertedWS.name, 'WS 1');
        done();
      });
    });
  });

  describe('remove registered user', function(done) {
    it('removes a registered user from the system', function(done) {
      Meteor.
    })
  })
});




function makeModel(modelName) {
  var model = {
    name: modelName
  };

  return model;
}
