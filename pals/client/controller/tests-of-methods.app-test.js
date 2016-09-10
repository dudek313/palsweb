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

describe('Testing methods', function(done) {
  before(function(done) {
    Meteor.call('test.resetDatabase', done);
  });

///////////////////// Not working. Tried to copy loginWithPassword below ////////////////
  after(function(done) {
    var testUser = Meteor.users.findOne({'profile.fullname':'test test'});
    if (testUser) {
      Meteor.call('test.removeUser', {_id: testUser._id}, function(err, docId) {
        done(err);
      });
      done(); // temporary - until I work out the problem
    }
    else done();
  });

  describe('Admin functions', function() {
    before(function(done) {

      // log in data admin
      Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
        try {
          chai.assert.isUndefined(err);
          var user = Meteor.user();
          chai.assert.equal(user.emails[0].address, 'gabsun@gmail.com');
        } catch(error) {
          done(error);
        }
        done();
      });
    });

    after(function(done) {
      Meteor.logout(function(err) {
        try {
          chai.assert.isUndefined(err, 'Logout created error');
          var user = Meteor.user();
          chai.assert.isNull(user, 'User is still logged in');
        } catch(error) {
          done(error);
        }
        done();
      });
    });

    describe('Register new user', function() {

      it('allows a new user to be registered on the system', function(done) {
        Meteor.call('test.createUser', {email:'test0@testing.com', password: 'password1', profile: {fullname: "test test"}}, function(err) {
          try {
            chai.assert.isUndefined(err);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Insert new data set by admin', function(done) {
      it('allows an admin user to insert a data set', function(done) {
        var newDataSet = makeDataSet("Data Set 1");
        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            var insertedDataSet = DataSets.findOne({_id: dsId});
            chai.assert.isDefined(insertedDataSet, 'New data set was not inserted');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Insert new experiment template by admin', function(done) {
      it('allows an admin user to insert an experiment template', function(done) {
        var newExperiment = makeExperimentTemplate("Experiment Template 1");
        Meteor.call('insertExperiment', newExperiment, function(err, dsId) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            var insertedExperiment = Experiments.findOne({_id: dsId});
            chai.assert.isDefined(insertedExperiment, 'New experiment template was not inserted');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });


  });

  describe('Unregistered user', function() {

    describe('inserting model when not logged in', function(done) {
      it('does not allow unregistered user to insert a model', function(done) {
        var newModel = makeModel("Model 2");
        Meteor.call('insertModel', newModel, function(err, modelId) {
          try {
            chai.assert.isDefined(err);
            var insertedModel = Models.findOne({_id: modelId});
            chai.assert.isUndefined(insertedModel);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('inserting data set when not logged in', function(done) {
      it('does not allow unregistered user to insert a data set', function(done) {
        var newDataSet = makeDataSet("Data Set 3");
        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          try {
            chai.assert.isDefined(err);
            var insertedDataSet = DataSets.findOne({_id: dsId});
            chai.assert.isUndefined(insertedDataSet);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('inserting experiment template when not logged in', function(done) {
      it('does not allow unregistered user to insert an experiment', function(done) {
        var newExperiment = makeExperimentTemplate("Experiment Template 3");
        Meteor.call('insertExperiment', newExperiment, function(err, dsId) {
          try {
            chai.assert.isDefined(err);
            var insertedExperiment = Experiments.findOne({_id: dsId});
            chai.assert.isUndefined(insertedExperiment);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

  });


  describe('Registered user functions', function() {

    describe('Login registered user', function() {
      beforeEach(function(done){
        var testUser = Meteor.users.findOne({'profile.fullname':'test test'});
        if (testUser && testUser._id)
          Meteor.call('test.updateUser', {_id : testUser._id}, {$set: {emails: [{address: 'test0@testing.com', verified: true}]}});
        done();
      });

      it('allows a registered user to login', function(done) {

        Meteor.loginWithPassword('test0@testing.com', 'password1', function(err) {
          try {
            chai.assert.isUndefined(err);
            var user = Meteor.user();
            chai.assert.equal(user.emails[0].address, 'test0@testing.com');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Insert new model', function(done) {
      it('allows a registered user to insert a model', function(done) {
        var newModel = makeModel("Model 1");
        Meteor.call('insertModel', newModel, function(err, modelId) {
        try {
          chai.assert.isUndefined(err);
          var insertedModel = Models.findOne({_id: modelId});
          chai.assert.equal(insertedModel.name, 'Model 1');
        } catch(error) {
          done(error);
        }
        done();
        });
      });
    });

    describe('insertWorkspace', function(done) {
      it('allows a registered user to insert a new workspace', function(done) {
        Meteor.call('insertWorkspace', "WS 1", function(err, wsId) {
          try {
            chai.assert.isUndefined(err);
          } catch(error) {
            done(error);
          }

          var insertedWS = Workspaces.findOne({_id: wsId});
          try {
            chai.assert.equal(insertedWS.name, 'WS 1');
          } catch(error) {
            done(error);
          }

          done(err);
        });
      });
    });

    describe('insert duplicate workspace', function(done) {
      it('does not allow a registered user to insert duplicate workspaces', function(done) {

        Meteor.call('insertWorkspace', "WS 1", function(err, wsId) {
          try {
            chai.assert.isDefined(err);
          } catch(error) {
            done(error);
          }

          done();
        });

      });
    });

    describe('Insert new data set by non-admin', function(done) {
      it('does not allow a non-admin user to insert a model', function(done) {

        var newDataSet = makeDataSet("Data Set 2");
        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          try {
            chai.assert.isDefined(err);
            var insertedDataSet = DataSets.findOne({_id: dsId});
            chai.assert.isUndefined(insertedDataSet);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('inserting experiment template by non-data admin', function(done) {
      it('does not allow a registered, non-admin user to insert an experiment template', function(done) {
        var newExperiment = makeExperimentTemplate("Experiment Set 3");
        Meteor.call('insertExperiment', newExperiment, function(err, dsId) {
          try {
            chai.assert.isDefined(err);
            console.log(err);
            var insertedExperiment = Experiments.findOne({_id: dsId});
            chai.assert.isUndefined(insertedExperiment);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

  });

});

/*  The system currently doesn't prevent duplicate models per user
    describe('Insert duplicate model', function(done) {
      it('does not allow a registered user to insert a duplicate model', function(done) {
        var newModel = makeModel("Model 1");
        Meteor.call('insertModel', newModel, function(err, modelId) {
  //        chai.assert.isUndefined(err);
          var insertedModel = Models.findOne({_id: modelId});
  //        chai.assert.equal(insertedModel.name, 'Model 1');
          done();
        });

        var newModel = makeModel("Model 1");
        Meteor.call('insertModel', newModel, function(err, modelId) {
          try {
            chai.assert.isDefined(err);
          } catch(error) {
            done(error);
          }
          var insertedModel = Models.findOne({_id: modelId});
          done();
        });

      });
    });
*/



function makeModel(modelName) {
  var model = {
    name: modelName
  };

  return model;
}

function makeDataSet(dataSetName) {
  var dataSet = {
    name: dataSetName,
    type: 'flux tower',
    spatialLevel: 'SingleSite'
  };

  return dataSet;
}

function makeExperimentTemplate(experimentName) {
  var experiment = {
    name: experimentName,
    recordType: 'template',
    spatialLevel: 'SingleSite'

  }
  return experiment;
}
