/* eslint-env mocha */

import 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';

import '../../both/collections.js';

// global variables
myDsId = '';
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

    describe('Insert new data sets by admin', function(done) {
      it('allows an admin user to insert a data set', function(done) {
        var newDataSet = makeDataSet("Data Set 1");
        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            var insertedDataSet = DataSets.findOne({_id: dsId});
            chai.assert.isDefined(insertedDataSet, 'New data set was not inserted');
            myDsId = dsId;
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
            chai.assert.isUndefined(err, 'Error was called');
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

    before(function(done) {
      // while still logged in as admin user insert model, experiment, model output and data set into mongodb
      // and then log out
      var newModel = makeModel("Model 2");
      Meteor.call('insertModel', newModel, function(err, modelId) {
        try {
          chai.assert.isUndefined(err, 'Model was not inserted');
          myModelId2 = modelId;
        } catch(error) {
          done(error);
        }
      });

      var newExperiment = makeExperiment("Experiment 2", "template");
      Meteor.call('insertExperiment', newExperiment, function(err, expId) {
        try {
          chai.assert.isUndefined(err, 'Experiment template was not inserted');
          myExpId2 = expId;
        } catch(error) {
          done(error);
        }
      });

      var newModelOutput = makeModelOutput("Model Output 2");
      Meteor.call('insertModelOutput', newModelOutput, function(err, moId) {
        try {
          chai.assert.isUndefined(err, 'Model output was not inserted');
          myMoId2 = moId;
        } catch(error) {
          done(error);
        }
      });

      var newDataSet = makeDataSet("Data Set 2");
      Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
        try {
          chai.assert.isUndefined(err, 'Data set was not inserted');
          myDsId2 = dsId;
        } catch(error) {
          done(error);
        }
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

    describe('inserting model when not logged in', function(done) {
      it('does not allow unregistered user to insert a model', function(done) {
        var newModel = makeModel("Model 3");
        Meteor.call('insertModel', newModel, function(err, modelId) {
          try {
            chai.assert.isDefined(err);
            chai.assert.equal(err.error, "not-authorized");
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
        Meteor.call('updateModel', {_id: ModelId}, modifier, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was erroneously not called');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
            Meteor.call('test.Models.findOne', myModelId2, function(err, updatedModel) {
              chai.assert.isUndefined(err);
              chai.assert.notEqual(updatedModel.references, " ", 'Model was erroneously updated');
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Removing model when not logged in', function() {
      it('does not allow unregistered user to remove a model', function(done) {
        Meteor.call('removeModel', {_id: myModelId2}, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Model was erroneously removed');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Inserting data set when not logged in', function(done) {
      it('does not allow unregistered user to insert a data set', function(done) {
        var newDataSet = makeDataSet("Data Set 3");
        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          try {
            chai.assert.isDefined(err);
            chai.assert.equal(err.error, "not-authorized");
            var insertedDataSet = DataSets.findOne({_id: dsId});
            chai.assert.isUndefined(insertedDataSet);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Updating data set when not logged in', function(done) {
      it('does not allow unregistered user to update a data set', function(done) {
        var modifier = {$set: {spatialLevel: "MultipleSite"}};
        Meteor.call('updateDataSet', {_id: myDsId2}, modifier, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was erroneously not called');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
            Meteor.call('test.DataSets.findOne', myDsId2, function(err, updatedDataSet) {
              chai.assert.isUndefined(err);
              chai.assert.equal(updatedDataSet.spatialLevel, "SingleSite", 'Data set was erroneously updated');
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Removing data set when not logged in', function() {
      it('does not allow unregistered user to remove a data set', function(done) {
        Meteor.call('removeDataSet', {_id: myDsId2}, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Data set was erroneously removed');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Inserting experiment template when not logged in', function(done) {
      it('does not allow unregistered user to insert an experiment', function(done) {
        var newExperiment = makeExperiment("Experiment Template 3", "template");
        Meteor.call('insertExperiment', newExperiment, function(err, expId) {
          try {
            chai.assert.isDefined(err);
            chai.assert.equal(err.error, "not-authorized");
            var insertedExperiment = Experiments.findOne({_id: expId});
            chai.assert.isUndefined(insertedExperiment);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Updating experiment template when not logged in', function(done) {
      it('does not allow unregistered user to update an experiment template', function(done) {
        var modifier = {$set: {spatialLevel: "MultipleSite"}};
        Meteor.call('updateExperiment', {_id: myExpId2}, modifier, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was erroneously not called');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
            Meteor.call('test.Experiments.findOne', myExpId2, function(err, updatedExperiment) {
              chai.assert.isUndefined(err);
              chai.assert.equal(updatedExperiment.spatialLevel, "SingleSite", 'Experiment was erroneously updated');
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Removing experiment template when not logged in', function() {
      it('does not allow unregistered user to remove an experiment', function(done) {
        Meteor.call('removeExperiment', {_id: myExpId2}, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Experiment template was erroneously removed');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Inserting model output when not logged in', function(done) {
      it('does not allow unregistered user to insert a model output', function(done) {
        var newModelOutput = makeModelOutput("modelOutput 3");
        Meteor.call('insertModelOutput', newModelOutput, function(err, moId) {
          try {
            chai.assert.isDefined(err);
            chai.assert.equal(err.error, "not-authorized");
            var insertedExperiment = Experiments.findOne({_id: moId});
            chai.assert.isUndefined(insertedExperiment);
          } catch(error) {
            done(error);
          }
          done();
        })
      });
    });

    describe('Updating model output when not logged in', function(done) {
      it('does not allow unregistered user to update a model output', function(done) {
        var modifier = {$set: {spatialLevel: "MultipleSite"}};
        Meteor.call('updateModelOutput', {_id: myMoId2}, modifier, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was erroneously not called');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
            Meteor.call('test.ModelOutputs.findOne', myMoId2, function(err, updatedModelOutput) {
              chai.assert.isUndefined(err);
              chai.assert.equal(updatedModelOutput.spatialLevel, "SingleSite", 'ModelOutput was erroneously updated');
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Removing model output when not logged in', function() {
      it('does not allow unregistered user to remove a model output', function(done) {
        Meteor.call('removeModelOutput', {_id: myMoId2}, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'model output was erroneously removed');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
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

    describe('Change workspace', function(done) {
      it('allows a non-admin user to change workspaces', function(done) {
        var ws = Workspaces.findOne({name: 'WS 1'});
        Meteor.call('changeWorkspace', ws._id, function(err, success) {
          try {
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
            chai.assert.isDefined(err);
            chai.assert.equal(err.error, 'not-authorized');
            Meteor.call('test.Experiments.findOne', expId, function(err, insertedExperiment) {
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
            chai.assert.isUndefined(err);
            Meteor.call('test.Experiments.findOne', expId, function(err, insertedExperiment) {
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
        Meteor.call('insertModelOutput', newModelOutput, function(err, moId) {
          try {
            chai.assert.isUndefined(err);
            Meteor.call('test.ModelOutputs.findOne', moId, function(err, insertedModelOutput) {
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
    spatialLevel: 'SingleSite',
    references: " "
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
