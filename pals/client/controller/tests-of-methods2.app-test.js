/* eslint-env mocha */

import 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';

import '../../both/collections.js';

import { Random } from 'meteor/random';

ownModel = makeModel("My Model");
notOwnModel = makeModel("Another's model");

describe('Testing methods', function(done) {
  before(function(done) {
    Meteor.call('test.resetDatabase', done);
  });

  afterEach(function(done) {
    Meteor.call('test.resetDatabase', done);
  });


  describe('Admin functions', function() {
    before(function(done) {

      // log in data admin
      Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
        try {
          console.log(err);
          chai.assert.isUndefined(err);
          var user = Meteor.user();
          chai.assert.equal(user.emails[0].address, 'gabsun@gmail.com');
        } catch(error) {
          done(error);
        }
      });

      // create test user for later tests
      Meteor.call('test.createUser', {email:'test0@testing.com', password: 'password1', profile: {fullname: "test test"}}, function(err) {
        try {
          console.log(err);
          chai.assert.isUndefined(err);
        } catch(error) {
          done(error);
        }
        done();
      });

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
      var testUser = Meteor.users.findOne({'profile.fullname':'test test'});
      if (testUser && testUser._id)
      Meteor.call('test.updateUser', {_id : testUser._id}, {$set: {emails: [{address: 'test0@testing.com', verified: true}]}});

      Meteor.loginWithPassword('test0@testing.com', 'password1', function(err) {
        try {
          if (err) console.log(err);
          chai.assert.isUndefined(err);
          var user = Meteor.user();
          chai.assert.equal(user.emails[0].address, 'test0@testing.com');
        } catch(error) {
          done(error);
        }
      });

      eval("Meteor.call('test.updateUser', {_id : testUser._id}, {$set: {roles: {'model " + ownModel._id + "' : [ 'edit' ]} }});");
      done();
    });


    describe("Models - one's own", function(done) {

      describe('Updating own model', function(done) {
        before(function(done) {
          Meteor.call('test.resetDatabase', done);
          documentInsert('ownModel', 'Models', done);
        });

        it('allows a registered user to update own model', function(done) {
          var myModelId = Session.get('currentDocId');
          testUpdateMethod('updateModel', {_id: myModelId}, 'Models', 'references', 'all references', 'allows', done);
        });

      });

    });
/*
    describe("Models - another's", function(done) {

      beforeEach(function(done) {
        Meteor.call('test.resetDatabase', done);
      });

      it('does not allow a user to update the model of another user', function(done) {
        notOwnModelId = documentInsert('Models', done);
        testUpdateMethod('updateModel', {_id: notOwnModelId}, 'Models', 'references', 'A random ref', "does not allow", done);
      });

      it('does not allow a user to remove the model of another user', function(done) {
        notOwnModelId = documentInsert('Models', done);
        testRemoveMethod('removeModel', {_id: notOwnModelId}, 'Models', 'does not allow', done);
      });
    });
*/

/*    describe('Adding new Workspace', function(done) {
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
      before(function(done) {
        Meteor.call('test.Workspace.insert', "WS 2", function(err, doc) {
          try {
            chai.assert.isUndefined(err);
          } catch(error) {
            done(error);
          }
          myWs = doc;
          done();
        })
      });

      it('allows a non-admin user to change workspaces', function(done) {
//        var ws = Workspaces.findOne({name: 'WS 1'});
        console.log(Workspaces.find().fetch());
        Meteor.call('changeWorkspace', myWs._id, function(err, success) {
          try {
            console.log(Workspaces.find().fetch());
            if (err) console.log(err);
            chai.assert.isUndefined(err);
            console.log(success);
            chai.assert.isDefined(success);
            var currentWorkspace = getCurrentWorkspace();
            chai.assert.equal(currentWorkspace.name, "WS 2", 'Not in the correct workspace.');
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
      it('allows a registered user to remove their own workspace', function(done) {
        Meteor.call('removeWorkspace', {_id: myWsId}, function(err, doc) {
          try {
            if (err) console.log(err);
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
            if (err) console.log(err);
            chai.assert.isDefined(err, 'Error was not called');
            Meteor.call('test.Workspaces.findOne', {_id: myWsId4}, function(err, ws) {
              chai.assert.isDefined(ws, 'Workspace was erroneously removed');
            });
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    */
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
/*

  describe('Registered user functions', function() {


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

    describe('Removing data set', function() {
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

    describe('Inserting experiment template', function(done) {
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

    describe('Updating experiment template', function(done) {
      it('does not allow a registered non-admin user to update an experiment template', function(done) {
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

    describe('Removing experiment template', function() {
      it('does not allow a non-admin user to remove an experiment template', function(done) {
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

    describe('Inserting model output', function(done) {

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


    describe('Updating model output', function(done) {
      it('does not allow non-data admin user to update a model output', function(done) {
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

    describe('Removing model output', function() {
      it('does not allow non-data admin user to remove a model output', function(done) {
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


});


*/

function testObjectMethods(objectName, userType, objectToInsert, attributeUpdated, updatedValue, expectedOutcome, done) {
  var collectionName = objectName + 's';
  describe('Inserting a ' + objectName, function(done) {

    it(expectedOutcome + ' ' + userType + ' to insert a ' + objectName, function(done) {
      var methodName = 'insert' + objectName;
      testInsertMethod(methodName, collectionName, objectToInsert, expectedOutcome, done);
    });
  });


  describe('Updating a ' + objectName, function(done) {
    before(function(done) {
      documentInsert('docToUpdate', collectionName, done);
    });

    it(expectedOutcome + ' ' + userType + ' to update a ' + objectName, function(done) {
      var methodName = 'update' + objectName;
      myObjectId = Session.get('currentDocId');
      testUpdateMethod(methodName, {_id: myObjectId}, collectionName, attributeUpdated, updatedValue, expectedOutcome, done);
    });
  });

  describe('Removing a ' + objectName, function(done) {
    before(function(done) {
      documentInsert('docToRemove', collectionName, done);
    });

    it(expectedOutcome + ' ' + userType + ' to remove a ' + objectName, function(done) {
      var methodName = 'remove' + objectName;
      myObjectId2 = Session.get('currentDocId');
      console.log(myObjectId2);
      testRemoveMethod(methodName, {_id: myObjectId2}, collectionName, expectedOutcome, done);
    });
  });
}

function testInsertMethod(method, collection, docToInsert, expectedOutcome, done) {
  findOneMethodName = 'test.' + collection + '.findOne';
  Meteor.call(method, docToInsert, function(err, docId) {
    try {
      if (expectedOutcome == 'allows') {
        if (err) console.log(err);
        chai.assert.isUndefined(err, 'Error was called');
        chai.assert.isDefined(docId, 'Document was not inserted');
        Meteor.call(findOneMethodName, {_id: docId}, function(err, insertedDoc) {
          console.log(insertedDoc);
          chai.assert.isUndefined(err);
          chai.assert.equal(insertedDoc.name, docToInsert.name, 'Document was not inserted');
        });
      }
      else {
        chai.assert.isDefined(err, 'Error was not called');
        chai.assert.equal(err.error, "not-authorized", 'Wrong error called');
        chai.assert.isUndefined(docId, 'Document was inserted');
      }
    } catch(error) {
      done(error);
    }
    done();
  });
}

function testUpdateMethod(method, selector, collection, updatedAttribute, updatedValue, expectedOutcome, done) {
  var findOneMethodName = 'test.' + collection + '.findOne';
  eval('var modifier = {$set: {' + updatedAttribute + ': "' + updatedValue + '"}}')
  console.log('selector', selector);
  Meteor.call(method, selector, modifier, function(err, doc) {
    try {
      if (expectedOutcome == "allows") {
        if (err) console.log(err);
        if (doc) console.log(doc);
        chai.assert.isUndefined(err, 'Error was called');
        Meteor.call(findOneMethodName, selector, function(err, newDoc) {
          console.log(newDoc);
          if (err) console.log(err);
          chai.assert.isUndefined(err);
          chai.assert.equal(newDoc[updatedAttribute], updatedValue, collection + ' collection was not updated');
        });
      }
      else {
        chai.assert.isUndefined(doc, 'Document was updated');
        chai.assert.isDefined(err, 'Error was not called');
        chai.assert.equal(err.error, "not-authorized", 'Wrong error called');
      }
    } catch(error) {
      done(error);
    }
    done();
  });
}

function testRemoveMethod(method, selector, collection, expectedOutcome, done) {
  findOneMethodName = 'test.' + collection + '.findOne';
  console.log('testRemoveMethod selector: ', selector);
  Meteor.call(method, selector, function(err, success) {
    try {
      if (expectedOutcome == "allows") {
        chai.assert.isUndefined(err, 'Error was called');
        Meteor.call(findOneMethodName, selector, function(err, doc) {
          console.log(doc);
          if (err) console.log(err);
          chai.assert.isUndefined(err, 'An error message was given');
          chai.assert.isUndefined(doc, 'Document was not removed');
        });
      }
      else {
        chai.assert.isDefined(err, 'Error was not called');
        chai.assert.equal(err.error, "not-authorized", 'Wrong error called');
        chai.assert.isUndefined(success, 'Remove was performed');
      }
    } catch(error) {
      done(error);
    }
    done();
  });
};



//////////////////////////
// Need to include owner
//////////////////////////
function documentInsert(docName, collectionName, done) {
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
      console.log(err);
      chai.assert.isUndefined(err, 'Error was called');
      chai.assert.isDefined(docId, 'Document was not inserted to collection ' + collectionName);
    } catch(error) {
      done(error);
    }
    Session.set('currentDocId', docId);
    done();
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