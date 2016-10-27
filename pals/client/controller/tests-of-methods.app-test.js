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

    describe('Updating data set by admin', function(done) {
      it('allows an admin user to update a data set', function(done) {
        var modifier = {$set: {spatialLevel: "MultipleSite"}};
        Meteor.call('updateDataSet', {_id: myDsId}, modifier, function(err, doc) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            var updatedDataSet = DataSets.findOne({_id: myDsId});
            chai.assert.equal(updatedDataSet.spatialLevel, "MultipleSite", 'Data set was not updated');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Removing data set by admin', function(done) {
      it('allows an admin user to remove a data set', function(done) {
        Meteor.call('removeDataSet', {_id: myDsId}, function(err, doc) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            var ds = DataSets.findOne({_id: myDsId});
            chai.assert.isUndefined(ds, 'data set was not removed');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Inserting new experiment template by admin', function(done) {
      it('allows an admin user to insert an experiment template', function(done) {
        var newExperiment = makeExperiment("Experiment 1", "template");
        Meteor.call('insertExperiment', newExperiment, function(err, expId) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            Meteor.call('test.Experiments.findOne', {_id: expId}, function(err, insertedExperiment) {
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

    describe('Updating experiment by admin', function(done) {
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

    describe('Removing experiment by admin', function(done) {
      it('allows an admin user to remove an experiment', function(done) {
        Meteor.call('removeExperiment', {_id: myExpId}, function(err, doc) {
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

      var newModel = makeModel("Model 4");
      Meteor.call('insertModel', newModel, function(err, modelId) {
        try {
          chai.assert.isUndefined(err, 'Error was called');
          var insertedModel = Models.findOne({_id: modelId});
          chai.assert.isDefined(insertedModel, 'New model was not inserted');
          myModelId4 = modelId;
        } catch(error) {
          done(error);
        }
      });

      Meteor.call('insertWorkspace', "WS 4", function(err, wsId) {
        try {
          chai.assert.isUndefined(err, 'error message was given');
        } catch(error) {
          done(error);
        }

        var insertedWS = Workspaces.findOne({_id: wsId});
        try {
          chai.assert.equal(insertedWS.name, 'WS 4', 'workspace was not inserted');
          myWsId4 = wsId;
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
        Meteor.call('updateModel', {_id: myModelId2}, modifier, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was erroneously not called');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
            Meteor.call('test.Models.findOne', {_id: myModelId2}, function(err, updatedModel) {
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
            Meteor.call('test.DataSets.findOne', {_id: myDsId2}, function(err, updatedDataSet) {
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
            Meteor.call('test.Experiments.findOne', {_id: myExpId2}, function(err, updatedExperiment) {
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
        var modifier = {$set: {experiment: "notRandom"}};
        Meteor.call('updateModelOutput', {_id: myMoId2}, modifier, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was erroneously not called');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
            Meteor.call('test.ModelOutputs.findOne', {_id: myMoId2}, function(err, updatedModelOutput) {
              chai.assert.isUndefined(err);
              chai.assert.equal(updatedModelOutput.experiment, "randomExp", 'ModelOutput was erroneously updated');
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

    describe('Login', function() {
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

    describe('Inserting new model', function(done) {
      it('allows a registered user to insert a model', function(done) {
        var newModel = makeModel("Model 1");
        Meteor.call('insertModel', newModel, function(err, modelId) {
        try {
          chai.assert.isUndefined(err);
          var insertedModel = Models.findOne({_id: modelId});
          chai.assert.equal(insertedModel.name, 'Model 1');
          myModelId = modelId;
        } catch(error) {
          done(error);
        }
        done();
        });
      });
    });

    describe('Updating own model', function(done) {
      it('allows a registered user to update their own model', function(done) {
        var modifier = {$set: {references: "some references"}};
        Meteor.call('updateModel', {_id: myModelId}, modifier, function(err, doc) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            var updatedModel = Models.findOne({_id: myModelId});
            chai.assert.equal(updatedModel.references, "some references", 'Model was not updated');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe("Updating another's model", function(done) {
      it("does not allow a registered user to update another user's model", function(done) {
        var modifier = {$set: {references: "All kinds of references to be sure"}};
        Meteor.call('updateModel', {_id: myModelId4}, modifier, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was erroneously not called');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
            Meteor.call('test.Models.findOne', {_id: myModelId4}, function(err, updatedModel) {
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

    describe('Removing own model', function(done) {
      it('allows a registered user to remove their own model', function(done) {
        Meteor.call('removeModel', {_id: myModelId}, function(err, doc) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            Meteor.call('test.Models.findOne', {_id: myModelId}, function(err, model) {
              chai.assert.isUndefined(err);
              chai.assert.isUndefined(model, 'Model was not removed');
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe("Removing another's model", function() {
      it("does not allow a registered user to remove another user's model", function(done) {
        Meteor.call('removeModel', {_id: myModelId4}, function(err, doc) {
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

    describe('Adding new Workspace', function(done) {
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
            myWsId = wsId;
          } catch(error) {
            done(error);
          }

          done(err);
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

    describe('Inserting duplicate workspace', function(done) {
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

    describe('Removing own workspace', function(done) {
      it('allows a registered user to remove their own workspace', function(done) {
        Meteor.call('removeWorkspace', {_id: myWsId}, function(err, doc) {
          try {
            chai.assert.isUndefined(err, 'Error was called');
            var ws = Workspaces.findOne({_id: myWsId});
            chai.assert.isUndefined(ws, 'Workspace was not removed');
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe("Removing another user's workspace", function(done) {
      it("does not allow a registered user to remove another user's workspace", function(done) {
        Meteor.call('removeWorkspace', {_id: myWsId4}, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was not called');
            Meteor.call('test.Workspaces.findOne', {_id: myWsId4}, function(err, ws) {
              chai.assert.isDefined(ws, 'Workspace was erroneously removed');
            });
/*            var ws = Workspaces.findOne({_id: myWsId4});
            chai.assert.isDefined(err, 'Error was not called');
            chai.assert.isDefined(ws, 'Workspace was erroneously removed');*/
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Inserting new data set', function(done) {
      it('does not allow a non-admin user to insert a data set', function(done) {

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

    describe('Updating data set', function(done) {
      it('does not allow a non-admin user to update a data set', function(done) {
        var modifier = {$set: {spatialLevel: "MultipleSite"}};
        Meteor.call('updateDataSet', {_id: myDsId2}, modifier, function(err, doc) {
          try {
            chai.assert.isDefined(err, 'Error was erroneously not called');
            chai.assert.equal(err.error, 'not-authorized', 'incorrect error message displayed');
            Meteor.call('test.DataSets.findOne', {_id: myDsId2}, function(err, updatedDataSet) {
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

    describe('inserting experiment template by non-data admin', function(done) {
      it('does not allow a registered, non-admin user to insert an experiment template', function(done) {
        var newExperiment = makeExperiment("Experiment Set 3", "template");
        Meteor.call('insertExperiment', newExperiment, function(err, expId) {
          try {
            chai.assert.isDefined(err);
            chai.assert.equal(err.error, 'not-authorized');
            chai.assert.isUndefined(expId, 'experiment document was erroneously inserted');
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
            Meteor.call('test.Experiments.findOne', {_id: expId}, function(err, insertedExperiment) {
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
        var newModelOutput = makeModelOutput("Model Output 3");
        Meteor.call('insertModelOutput', newModelOutput, function(err, moId) {
          try {
            chai.assert.isUndefined(err);
            Meteor.call('test.ModelOutputs.findOne', {_id: moId}, function(err, insertedModelOutput) {
              chai.assert.equal(insertedModelOutput.name, "Model Output 3");
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
