/* eslint-env mocha */

import 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';

import '../../both/collections.js';

import { Random } from 'meteor/random';

myModelId = "";
ownModel = makeModel("My Model");
notOwnModel = makeModel("Another's model");

describe('Testing methods', function(done) {
  before(function(done) {
    resetDatabase(done);
  });


  describe('Admin functions', function() {
    before(function(done) {
      Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
        try {
          chai.assert.isUndefined(err);
          var user = Meteor.user();
          chai.assert.equal(user.emails[0].address, 'gabsun@gmail.com');
        // create test user for later tests
        } catch(error) {
          done(error);
        }
        done();
      });


    });

    afterEach(function(done) {
      resetDatabase(done);
    });

    describe('Data set methods', function(done) {
      var newDataSet = makeDataSet("Data Set 1");
      testObjectMethods('DataSet', 'an admin user', newDataSet, 'spatialLevel', 'MultipleSite', 'allows', done);
    });


    describe('Experiment template methods', function(done) {

      var newExperiment = makeExperiment("Experiment 1", "template");
      testObjectMethods('Experiment', 'an admin user', newExperiment, 'spatialLevel', 'MultipleSite', 'allows', done);
    });

    after(function(done) {
      logout(done);
    });

  });

  describe('Unregistered user', function() {

    afterEach(function(done) {
      resetDatabase(done);
    });

    describe('Model methods', function() {
      var newModel = makeModel("Model 1");
      testObjectMethods('Model', 'an unregistered user', newModel, 'references', 'All of them', 'does not allow', done);
    });

    describe('Data Sets', function(done) {
      var newDataSet = makeDataSet("Data Set 3");
      testObjectMethods('DataSet', 'an unregistered user', newDataSet, 'spatialLevel', 'MultipleSite', 'does not allow', done);
    })

    describe('Experiment Templates', function(done) {
      var newExperiment = makeExperiment("Experiment Template 3", "template");
      testObjectMethods('Experiment', 'an unregistered user', newExperiment, 'spatialLevel', 'MultipleSite', 'does not allow', done);
    })

    describe('Model Outputs', function(done) {
      var newModelOutput = makeModelOutput("modelOutput 3");
      testObjectMethods('ModelOutput', 'an unregistered user', newModelOutput, 'experiment', 'A random experiment', 'does not allow', done);
    })

  });

  describe('Registered user functions', function() {

    before(function(done){

      // Logs in the admin user in order to create a test user, who is then logged in.
      Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
        try {
          chai.assert.isUndefined(err);
          var user = Meteor.user();
          chai.assert.equal(user.emails[0].address, 'gabsun@gmail.com');
        // create test user for later tests

          Meteor.call('test.createUser', {email:'test0@testing.com', password: 'password1', profile: {fullname: "test test"}}, function(err, testUserId) {
            try {
              if (err) console.log(err);
              chai.assert.isUndefined(err);
              var testUser = Meteor.users.findOne({'profile.fullname':'test test'});

              if (testUser && testUser._id)
              Meteor.call('test.updateUser', {_id : testUser._id}, {$set: {emails: [{address: 'test0@testing.com', verified: true}]}}, function() {

                Meteor.loginWithPassword('test0@testing.com', 'password1', function(err) {
                  try {
                    console.log(Meteor.user());
                    if (err) console.log(err);
                    chai.assert.isUndefined(err);
                    var user = Meteor.user();
                    console.log('Logged in')
                    chai.assert.equal(user.emails[0].address, 'test0@testing.com');
                  } catch(error) {
                    done(error);
                  }
                  done();
                });

              });

            } catch(error) {
              done(error);
            }
          });
        } catch(error) {
          done(error);
        }

      });

    });

    describe("Models - one's own", function() {

      afterEach(function(done) {
        resetDatabase(done);
      });

      describe('Inserting', function(done) {
        it('allows a registered user to insert a model', function(done) {
          var newModel = makeModel("Registered model");
          testInsertMethod('insertModel', 'Models', newModel, "allows", done);
        });
      });

      describe('Updating own model', function(done) {
        before(function(done) {
          documentInsert('ownModel', 'Models', function(err, docId) {
            ownModelId = docId
            var testUserId = Meteor.userId();
            eval("Meteor.call('test.updateUser', {_id : testUserId}, {$set: {roles: {'model " + ownModelId + "' : [ 'edit' ]} }}, done);");
          });
        });

        it('allows a registered user to update own model', function(done) {
          testUpdateMethod('updateModel', {_id: ownModelId}, 'Models', 'references', 'all references', 'allows', done);
        });

      });

      describe('Removing own model', function(done) {
        before(function(done) {
          documentInsert('ownModelToRemove', 'Models', function(err, docId) {
            var testUserId = Meteor.userId();
            ownModelToRemoveId = docId;
            eval("Meteor.call('test.updateUser', {_id : testUserId}, {$set: {roles: {'model " + docId + "' : [ 'edit' ]} }}, done);");
          });
        });

        it('allows a registered user to remove own model', function(done) {
          testRemoveMethod('removeModel', {_id: ownModelToRemoveId}, 'Models', 'allows', done);
        });

      });

    });

    describe("Models - another's", function(done) {
      afterEach(function(done) {
        resetDatabase(done);
      });

      describe("Updating", function(done) {
        before(function(done) {
          documentInsert("Someone_elses_model", 'Models', function(err, docId) {
            if (err) done(error);
            notOwnModelId = docId;
            console.log('docId', docId);
            done();
          });
        });

        it('does not allow a user to update the model of another user', function(done) {
          console.log(Models.findOne({_id: notOwnModelId}));
          testUpdateMethod('updateModel', {_id: notOwnModelId}, 'Models', 'references', 'A random ref', "does not allow", done);
        });
      });

      describe("Removing", function(done) {
        before(function(done) {
          documentInsert("Someone_elses_other_model", 'Models', function(err, docId) {
            if (err) done(error);
            notOwnModelToRemoveId = docId;
            done();
          });
        });

        it('does not allow a user to remove the model of another user', function(done) {
          testRemoveMethod('removeModel', {_id: notOwnModelToRemoveId}, 'Models', 'does not allow', done);
        });

      });
    });

    describe('Workspaces', function() {
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
            console.log(Meteor.user());
            done(err);
          });
        });
      });

      describe('Change workspace', function() {
        before(function(done) {
          Meteor.call('test.Workspaces.insert', "WS 2", function(err, docId) {
            try {
              if (err) console.log(err);
              chai.assert.isUndefined(err);
            } catch(error) {
              done(error);
            }
            myWsId = docId;
            done();
          })
        });

        it('allows a non-admin user to change workspaces', function(done) {
          Meteor.call('changeWorkspace', myWsId, function(err, success) {
            try {
              chai.assert.isUndefined(err);
              chai.assert.isDefined(success);
              var currentWorkspaceId = getCurrentWorkspaceId();
              chai.assert.equal(currentWorkspaceId, myWsId, 'Not in the correct workspace.');
            } catch(error) {
              done(error);
            }
            done();
          });
        });
      });

      describe('Inserting duplicate workspace', function(done) {
        before(function(done) {
          Meteor.call('test.Workspaces.insert', "WS 3", function(err, docId) {
            try {
              if (err) console.log(err);
              chai.assert.isUndefined(err);
            } catch(error) {
              done(error);
            }
            done();
          })
        });

        it('does not allow a registered user to insert duplicate workspaces', function(done) {

          Meteor.call('insertWorkspace', "WS 3", function(err, wsId) {
            try {
              if (err) console.log(err);
              chai.assert.isDefined(err);
            } catch(error) {
              done(error);
            }

            done();
          });
        });
      });

      describe('Removing own workspace', function(done) {
        before(function(done) {
          Meteor.call('test.Workspaces.insert', "WS 4", function(err, docId) {
            try {
              if (err) console.log(err);
              chai.assert.isUndefined(err);
              var userId = Meteor.userId();
              ownWsToRemoveId = docId;
              var group = 'workspace ' + docId;
              var selector = {_id: userId};
              eval("var modifier = {$set: {'roles' : { '" + group + "' : ['edit'] }}};");
              console.log(modifier);
              Meteor.call('test.updateUser', selector, modifier, function(err, doc) {
                try {
                  chai.assert.isUndefined(err, 'user roles - error message given');
                  chai.assert.isDefined(doc, 'user roles were not updated');
                } catch(error) {
                  done(error);
                }
                done();
              });
            } catch(error) {
              done(error);
            }
          });
        });

        it('allows a registered user to remove their own workspace', function(done) {
          Meteor.call('removeWorkspace', {_id: ownWsToRemoveId}, function(err, doc) {
            try {
              if (err) console.log(err);
              chai.assert.isUndefined(err, 'Error was called');
              var ws = Workspaces.findOne({_id: ownWsToRemoveId});
              chai.assert.isUndefined(ws, 'Workspace was not removed');
            } catch(error) {
              done(error);
            }
            done();
          });
        });
      });

      describe("Removing another user's workspace", function(done) {
        before(function(done) {
          Meteor.call('test.Workspaces.insert', "WS 5", function(err, docId) {
            try {
              if (err) console.log(err);
              chai.assert.isUndefined(err);
            } catch(error) {
              done(error);
            }
            othersWsToRemoveId = docId;
            done();
          });
        });

        it("does not allow a registered user to remove another user's workspace", function(done) {
          Meteor.call('removeWorkspace', {_id: othersWsToRemoveId}, function(err, doc) {
            try {
              if (err) console.log(err);
              chai.assert.isDefined(err, 'Error was not called');
              Meteor.call('test.Workspaces.findOne', {_id: othersWsToRemoveId}, function(err, ws) {
                try {
                  chai.assert.isDefined(ws, 'Workspace was erroneously removed');
                } catch (error) {
                  done(error)
                }
                done();
              });
            } catch(error) {
              done(error);
            }
          });
        });
      });

    });

    describe('Data Sets', function(done) {

      newDataSet = makeDataSet("DS registered");
      testObjectMethods('DataSet', 'a registered user', newDataSet, 'spatialLevel', 'MultipleSite', 'does not allow', done);
    });

    describe('Experiment Templates', function(done) {
      var newExperiment = makeExperiment("Exp registered", "template");
      testObjectMethods('Experiment', 'a registered user', newExperiment, 'spatialLevel', 'MultipleSite', 'does not allow', done);
    })

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

    describe("Model Outputs", function(done){
      describe("Model Outputs - one's own", function(done) {

        describe("Inserting", function(done) {
          it('allows a registered user to insert a model output', function(done) {
            var newModelOutput = makeModelOutput("MO registered");
            testInsertMethod('insertModelOutput', 'ModelOutputs', newModelOutput, "allows", done);
          });
        });


        describe('Updating', function(done) {
          before(function(done) {
            documentInsert('ownModelOutput', 'ModelOutputs', function(err, docId) {
              ownModelOutputId = docId
              var testUserId = Meteor.userId();
              eval("Meteor.call('test.updateUser', {_id : testUserId}, {$set: {roles: {'modelOutput " + docId + "' : [ 'edit' ]} }}, done);");
            });
          });

          it('allows a registered user to update own model output', function(done) {
            testUpdateMethod('updateModelOutput', {_id: ownModelOutputId}, 'ModelOutputs', 'experiment', 'different experiment', 'allows', done);
          });

        });

        describe('Removing', function(done) {
          before(function(done) {
            documentInsert('removableModelOutput', 'ModelOutputs', function(err, docId) {
              var testUserId = Meteor.userId();
              anotherModelOutputId = docId;
              eval("Meteor.call('test.updateUser', {_id : testUserId}, {$set: {roles: {'modelOutput " + docId + "' : [ 'edit' ]} }}, done);");
            });
          });

          it('allows a registered user to remove own model output', function(done) {
            testRemoveMethod('removeModelOutput', {_id: anotherModelOutputId}, 'ModelOutputs', 'allows', done);
          });

        });
      });

      describe("Model outputs - another's", function(done) {
        afterEach(function(done) {
          resetDatabase(done);
        });

        describe("Updating", function(done) {
          before(function(done) {
            documentInsert("Someone_elses_modelOutput", 'ModelOutputs', function(err, docId) {
              if (err) done(error);
              notOwnModelOutputId = docId;
              console.log('docId', docId);
              done();
            });
          });

          it('does not allow a user to update the modelOutput of another user', function(done) {
            console.log(ModelOutputs.findOne({_id: notOwnModelOutputId}));
            testUpdateMethod('updateModelOutput', {_id: notOwnModelOutputId}, 'ModelOutputs', 'references', 'A random ref', "does not allow", done);
          });
        });

        describe("Removing", function(done) {
          before(function(done) {
            documentInsert("Someone_elses_other_modelOutput", 'ModelOutputs', function(err, docId) {
              if (err) done(error);
              notOwnModelOutputToRemoveId = docId;
              done();
            });
          });

          it('does not allow a user to remove the modelOutput of another user', function(done) {
            testRemoveMethod('removeModelOutput', {_id: notOwnModelOutputToRemoveId}, 'ModelOutputs', 'does not allow', done);
          });

        });

      });

    });


    after(function(done) {
      logout(done);
    });

  });


  after(function(done) {
    var testUser = Meteor.users.findOne({'profile.fullname':'test test'});
    if (testUser) {
      Meteor.call('test.removeUser', {_id: testUser._id}, function(err, docId) {
        if (err) done(err);
      });
      done();
    }
    else done();
  });

});
/*  describe('Registered user functions', function() {


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

*/

function testObjectMethods(objectName, userType, objectToInsert, attributeUpdated, updatedValue, expectedOutcome, done) {
  var collectionName = objectName + 's';
  describe('Inserting a ' + objectName, function(done) {

    it(expectedOutcome + ' ' + userType + ' to insert a ' + objectName, function(done) {
      var methodName = 'insert' + objectName;
      testInsertMethod(methodName, collectionName, objectToInsert, expectedOutcome, done);
    });

    after(function(done) {
      resetDatabase(done);
    });
  });


  describe('Updating a ' + objectName, function(done) {
    before(function(done) {
      documentInsert('docToUpdate', collectionName, function(err, docId) {
        if (err) done(err);
        docToUpdateId = docId;
        done();
      });
    });

    it(expectedOutcome + ' ' + userType + ' to update a ' + objectName, function(done) {
      var methodName = 'update' + objectName;
      testUpdateMethod(methodName, {_id: docToUpdateId}, collectionName, attributeUpdated, updatedValue, expectedOutcome, done);
    });
  });

  describe('Removing a ' + objectName, function(done) {
    before(function(done) {
      documentInsert('docToRemove', collectionName, function(err, docId) {
        if (err) done(err);
        docToRemoveId = docId;
        done();
      });
    });

    it(expectedOutcome + ' ' + userType + ' to remove a ' + objectName, function(done) {
      var methodName = 'remove' + objectName;
      testRemoveMethod(methodName, {_id: docToRemoveId}, collectionName, expectedOutcome, done);
    });
  });
}

function testInsertMethod(method, collection, docToInsert, expectedOutcome, done) {
  findOneMethodName = 'test.' + collection + '.findOne';
  Meteor.call(method, docToInsert, function(err, docId) {
    if (expectedOutcome == 'allows') {
      if (err) console.log(err);
      try {
        chai.assert.isUndefined(err, 'Error was called');
        chai.assert.isDefined(docId, 'Document was not inserted');
        Meteor.call(findOneMethodName, {_id: docId}, function(err, insertedDoc) {
          try {
            chai.assert.isUndefined(err, 'findOne method returned error');
            chai.assert.equal(insertedDoc.name, docToInsert.name, 'Document was not inserted');
          } catch(error) {
            done(error);
          };
          done()
        });
      } catch(error) {
        done(error);
      }
    }
    else {
      try {
        chai.assert.isDefined(err, 'Error was not called');
        chai.assert.equal(err.error, "not-authorized", 'Wrong error called');
        chai.assert.isUndefined(docId, 'Document was inserted');
      }
      catch(error) {
        done(error);
      }
      done();
    }
  });
}

function testUpdateMethod(method, selector, collection, updatedAttribute, updatedValue, expectedOutcome, done) {
  var findOneMethodName = 'test.' + collection + '.findOne';
  eval('var modifier = {$set: {' + updatedAttribute + ': "' + updatedValue + '"}}')
  Meteor.call(method, selector, modifier, function(err, doc) {

    if (expectedOutcome == "allows") {
      try {
        chai.assert.isUndefined(err, 'Error was called');
        Meteor.call(findOneMethodName, selector, function(err, newDoc) {
          chai.assert.isUndefined(err);
          chai.assert.equal(newDoc[updatedAttribute], updatedValue, collection + ' collection was not updated');
        });
      } catch(error) {
        done(error)
      }
      done();
    } else {
      try {
        chai.assert.isUndefined(doc, 'Document was updated');
        chai.assert.isDefined(err, 'Error was not called');
        chai.assert.equal(err.error, "not-authorized", 'Wrong error called');
      } catch(error) {
        done(error)
      }
      done();
    }
  });
}

function testRemoveMethod(method, selector, collection, expectedOutcome, done) {
  findOneMethodName = 'test.' + collection + '.findOne';
  Meteor.call(method, selector, function(err, success) {

    if (expectedOutcome == "allows") {
      try {
        chai.assert.isUndefined(err, 'Error was called');
        Meteor.call(findOneMethodName, selector, function(err, doc) {
          if (err) console.log(err);
          chai.assert.isUndefined(err, 'An error message was given');
          chai.assert.isUndefined(doc, 'Document was not removed');
        });
      } catch(error) {
        done(error)
      }
      done();
    }
    else {
      try {
        chai.assert.isDefined(err, 'Error was not called');
        chai.assert.equal(err.error, "not-authorized", 'Wrong error called');
        chai.assert.isUndefined(success, 'Remove was performed');
      } catch(error) {
        done(error)
      }
      done();
    }
  });
};



//////////////////////////
// Need to include owner
//////////////////////////

function documentInsert(docName, collectionName, callback) {
  if (collectionName == "DataSets")
    var newDocument = makeDataSet(docName);
  else if (collectionName == "Experiments")
    var newDocument = makeExperiment(docName, "template");
  else if (collectionName == "ModelOutputs")
    var newDocument = makeModelOutput(docName);
  else if (collectionName == "Models")
    var newDocument = makeModel(docName);

  if (!newDocument.owner) newDocument.owner = Random.id();

  Meteor.call('test.' + collectionName + '.insert', newDocument, function(err, docId) {
    try {
      if (err) console.log(err);
      chai.assert.isUndefined(err, 'Error was called');
      chai.assert.isDefined(docId, 'Document was not inserted to collection ' + collectionName);
    } catch(error) {
      callback(error);
    }
    callback(null, docId);
  });

}

function loginAdmin(done) {

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
}

function logout(done) {
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
}

function makeObject(objectType) {
  if (objectType == 'Model')
    return makeModel("Model 1");
  else if (objectType == 'DataSet')
    return makeDataSet("Data Set 1");
  else if (objectType == 'ModelOutput')
    return makeModelOutput("Model Output 1")
  else if (objectType == "Experiment")
    return makeExperiment("Experiment 1", "template");
}

function makeModel(modelName) {
  var model = {
    name: modelName,
    references: "some"
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

function resetDatabase(done) {
  Meteor.call('test.resetDatabase', function() {
    Meteor.call('test.users.findOne', {username: 'gab'}, function(err, gabUser) {
      var selector = {_id: gabUser._id};
      var modifier = {$set: {"roles" : { "__global_roles__" : [ "edit", "workspaceAccess", "admin" ]}}};
      Meteor.call('test.updateUser', selector, modifier, function(err, doc) {
        if (err) console.log('Admin user roles were not reset');
        done();
      });
    });
  });
};
