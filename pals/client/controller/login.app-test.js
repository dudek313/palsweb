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
  before(function(done) {
    Meteor.call('test.resetDatabase', done);
  });

  describe('Admin functions', function() {

    describe('Login Admin', function() {
      it('allows an admin user to login', function(done) {

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
    });


    describe('Register new user', function() {
      beforeEach(function(done) {
        var testUser = Meteor.users.findOne({'emails.address':'test0@testing.com'});
        if (testUser) {
          Meteor.call('test.removeUser', {_id: testUser._id})
        }
        done();
      });

      it('allows a new user to be registered on the system', function(done) {
        Meteor.call('test.createUser', {email:'test0@testing.com', password: 'password1'}, function(err) {
          console.log(err);
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
        console.log('insert data set');
        var newDataSet = makeDataSet("Data Set 1");
        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          console.log(err); console.log(dsId);
          try {
            chai.assert.isUndefined(err);
            var insertedDataSet = DataSets.findOne({_id: dsId});
            chai.assert.isDefined(insertedDataSet);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

    describe('Insert duplicate data set by admin', function(done) {
      it('does not allow an admin user to insert a duplicate model', function(done) {
        console.log('insert data set');
        var newDataSet = makeDataSet("Data Set 1");

/*        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          try {
            chai.assert.isUndefined(err);
            var insertedDataSet = DataSets.findOne({_id: dsId});
            chai.assert.isDefined(insertedDataSet);
          } catch(error) {
            done(error);
          }
        });
*/
        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          try {
            chai.assert.isDefined(err);
          } catch(error) {
            done(error);
          }
          done();
        });


      });
    });


    describe('logout', function() {
      it('allows a logged-in user to logout', function(done) {
        Meteor.logout(function(err) {
          try {
            chai.assert.isUndefined(err);
            var user = Meteor.user();
            chai.assert.isNull(user);
          } catch(error) {
            done(error);
          }
          done();
        });
      });
    });

  });

  describe('try to insert model when not logged in', function(done) {
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

  describe('Registered user functions', function() {

    describe('Login registered user', function() {
      beforeEach(function(done){
        var testUser = Meteor.users.findOne({'emails.address':'test0@testing.com'});
        if (testUser && testUser._id)
          Meteor.call('test.updateUser', {_id : testUser._id}, {$set: {emails: [{address: 'test0@testing.com', verified: true}]}});
        done();
      });

      it('allows a registered user to login', function(done) {

        Meteor.loginWithPassword('test0@testing.com', 'password1', function(err) {
          console.log(err);
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
        console.log('insert 1 model');
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

    describe('Insert duplicate model', function(done) {
      it('does not allow a registered user to insert a duplicate model', function(done) {
        var newModel = makeModel("Model 1");
/*        Meteor.call('insertModel', newModel, function(err, modelId) {
          console.log('duplicate model 1');
  //        chai.assert.isUndefined(err);
          var insertedModel = Models.findOne({_id: modelId});
  //        chai.assert.equal(insertedModel.name, 'Model 1');
          done();
        });
*/
        var newModel = makeModel("Model 1");
        Meteor.call('insertModel', newModel, function(err, modelId) {
          console.log('duplicate model 2');
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

        console.log('insert data set');
        var newDataSet = makeDataSet("Data Set 2");
        Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
          console.log(err); console.log(dsId);
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

    describe('File upload', function(done) {
      it('allows an nc data set file to be uploaded by a registered user', function(done) {

/*        var file = {

        }

        var upload = StoredFiles.insert({
          file: file,
          fileName: filename,
          streams: 'dynamic',
          chunkSize: 'dynamic'
        }, false);

        upload.on('start', function () {
          template.currentUpload.set(this);
        });

        upload.on('end', function (error, fileObj) {
          if (error) {
            alert('Error during upload: ' + error);
          } else {

            var isDownloadable = document.getElementById('downloadable').checked;
            var fileType = $("input[type='radio'][name='fileType']:checked").val();
            var fileRecord = {
                path: FILE_DIR + fileObj.path,
                name: filename,
                size: fileObj.size,
                key: fileObj._id,
                created: new Date(),
                downloadable: isDownloadable,
                type: fileType
            };
            var tempFiles = Session.get('tempFiles');
            tempFiles.push(fileRecord);
            Session.set('tempFiles', tempFiles);
            Session.set('dirty', true);
            Session.set('uploadButtonClicked', false);

            // keep track of what files have been uploaded so that they can be deleted if the create/update is cancelled
            var filesUploaded = Session.get('filesUploaded');
            filesUploaded.push(name);
            Session.set('filesUploaded', filesUploaded);

            alert('File "' + fileObj.name + '" successfully uploaded');
*/
      }); 
    });
  });

});




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
