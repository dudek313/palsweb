/* eslint-env mocha */

import 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';

import '../../both/collections.js';

// global variables
myDsID = '';
myExpId = '';
myModelId = '';
myMoId = '';

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

  after(function(done) {
    var testUser = Meteor.users.findOne({'profile.fullname':'test test'});
    if (testUser) {
      Meteor.call('test.removeUser', {_id: testUser._id}, function(err, docId) {
        if (err) done(err);
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

      // insert model in order to test update model method later
      var newModel = makeModel("Model 1");
      Meteor.call('insertModel', newModel, function(err, modelId) {
	myModelId = modelId;
        if (err) console.log('error inserting model 1', err);
      });

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
        var newExperiment = makeExperiment("Experiment 1", "template");
        Meteor.call('insertExperiment', newExperiment, function(err, expId) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            Meteor.call('test.Experiments.findOne', expId, function(err, insertedExperiment) {
              console.log('insertedExperiment', insertedExperiment);
              chai.assert.isDefined(insertedExperiment, 'New experiment template was not inserted');
            });
            myExpId = expId;
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Update experiment by admin', function(done) {
      it('allows an admin user to update an experiment', function(done) {
        var modifier = {$set: {spatialLevel: "MultipleSite"}};
        Meteor.call('updateExperiment', {_id: myExpId}, modifier, function(err, doc) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            var updatedExperiment = Experiments.findOne({_id: myExpId});
            chai.assert.equal(updatedExperiment.spatialLevel, "MultipleSite", 'experiment was not updated');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Remove experiment by admin', function(done) {
      it('allows an admin user to remove an experiment', function(done) {
        Meteor.call('deleteExperiment', {_id: myExpId}, function(err, doc) {
          try {
            console.log('Error removing experiment: ', err);
            chai.assert.isUndefined(err, 'Error was called');
            if (err) console.log('Error removing experiment', err);
            var exp = Experiments.findOne({_id: myExpId});
            chai.assert.isUndefined(exp, 'experiment was not removed');
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
            chai.assert.equal(err.error, "not-authorized");
            console.log(err);
            var insertedModel = Models.findOne({_id: modelId});
            chai.assert.isUndefined(insertedModel);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Updating model when not logged in', function(done) {
      it('does not allow unregistered user to update a model', function(done) {
        var modifier = {$set: {references: "All kinds of references to be sure"}};
        Meteor.call('updateModel', {_id: myModelId}, modifier, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was mistakenly not called');
            console.log('Updating model error', err);
            Meteor.call('test.Models.findOne', myModelId, function(err, updatedModel) {
              chai.assert.isUndefined(err);
              chai.assert.notEqual(updatedModel.references, " ", 'Model was mistakenly updated');
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('NEED TO FILL IN - Removing model when not logged in', function() {
      it('UNFINISHED', function(done) {
	done();
      });
    });

    describe('inserting data set when not logged in', function(done) {
      it('does not allow unregistered user to insert a data set', function(done) {
        var newDataSet = makeDataSet("Data Set 3");
        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          try {
            chai.assert.isDefined(err);
            chai.assert.equal(err.error, "not-authorized");
            console.log(err);
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
        var newExperiment = makeExperiment("Experiment Template 3", "template");
        Meteor.call('insertExperiment', newExperiment, function(err, expId) {
          try {
            chai.assert.isDefined(err);
            chai.assert.equal(err.error, "not-authorized");
            console.log(err);
            var insertedExperiment = Experiments.findOne({_id: expId});
            chai.assert.isUndefined(insertedExperiment);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('inserting model output when not logged in', function(done) {
      it('does not allow unregistered user to insert a model output', function(done) {
        var newModelOutput = makeModelOutput("modelOutput 1");
        Meteor.call('insertModelOutput', newModelOutput, function(err, moId) {
          try {
            chai.assert.isDefined(err);
            chai.assert.equal(err.error, "not-authorized");
            console.log(err);
            var insertedExperiment = Experiments.findOne({_id: moId});
            chai.assert.isUndefined(insertedExperiment);
          } catch(error) {
            done(error);
          }
          done();
        })
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

    describe('Change workspace', function(done) {
      it('allows a non-admin user to change workspaces', function(done) {
        var ws = Workspaces.findOne({name: 'WS 1'});
        Meteor.call('changeWorkspace', ws._id, function(err, success) {
          try {
            console.log('err: ', err);
            console.log('success: ', success);
            chai.assert.isUndefined(err);
            chai.assert.isDefined(success);
            var currentWorkspace = getCurrentWorkspace();
            chai.assert.equal(currentWorkspace.name, "WS 1", 'Not in the correct workspace.');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('inserting experiment template by non-data admin', function(done) {
      it('does not allow a registered, non-admin user to insert an experiment template', function(done) {
        var newExperiment = makeExperiment("Experiment Set 3", "template");
        Meteor.call('insertExperiment', newExperiment, function(err, expId) {
          try {
            console.log('experiment template error', err);
            chai.assert.isDefined(err);
            Meteor.call('test.Experiments.findOne', expId, function(err, insertedExperiment) {
              console.log('insertedExperiment', insertedExperiment);
              chai.assert.isUndefined(insertedExperiment);
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('clone experiment into workspace', function(done) {
      it('allows a registered non-admin user to clone an experiment into their own workspace', function(done) {
        var expInstance = makeExperiment("Experiment 1", "instance");
        Meteor.call('insertExperiment', expInstance, function(err, expId) {
          try {
            if (err) console.log('insert clone error', err)
            else console.log('expId', expId);
            chai.assert.isUndefined(err);
            Meteor.call('test.Experiments.findOne', expId, function(err, insertedExperiment) {
              console.log('insertedExperiment', insertedExperiment);
              chai.assert.equal(insertedExperiment.name, "Experiment 1");
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('inserting model output by non-admin', function(done) {

      it('allows a registered user to insert a model output', function(done) {
        var newModelOutput = makeModelOutput("Model Output 2");
        console.log('newModelOutput: ', newModelOutput);
        Meteor.call('insertModelOutput', newModelOutput, function(err, moId) {
          try {
            console.log(err);
            chai.assert.isUndefined(err);
            console.log('mo id: ', moId);
            Meteor.call('test.ModelOutputs.findOne', moId, function(err, insertedModelOutput) {
              console.log('insertedModelOutput', insertedModelOutput);
              chai.assert.equal(insertedModelOutput.name, "Model Output 2");
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

  });


});



function makeModel(modelName) {
  var model = {
    name: modelName,
    references: " "
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

function makeExperiment(experimentName, recordType) {
  var experiment = {
    name: experimentName,
    recordType: recordType,
    spatialLevel: 'SingleSite'

  }
  return experiment;
}

function makeModelOutput(modelOutputName) {
  var modelOutput = {
    name: modelOutputName,
    experiment: 'randomExp',
    model: 'testModel'
  }
  return modelOutput;
}
