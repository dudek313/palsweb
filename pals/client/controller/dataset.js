import '../views/dataset.html';

Template.dataSet.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
  window['directives']();
  templateSharedObjects.progress().hide();
  Session.set('deletedFileIds', []);
//    Session.set('filesUploaded', []);
  SimpleSchema.debug = true;
});


// Currently not working - probably issue with publish & subscribe - for old cfs package
function removeDeletedFiles(fileIds) {

/*    if (fileIds && fileIds.length > 0) {
        fileIds.forEach(function(fileId) {
            var fileDoc = Files.findOne({_id:fileId});
            console.log(fileDoc);
            if (fileDoc) {
                Files.remove(fileDoc, function(err, doc) {
                    if (err)
                        console.log('Unable to delete file: ' + fileId);
                    else {
                        console.log('Deleted file: ' + fileId);
                    }
                });
            }
            else console.log('File not found: ' + fileId);
        });
    }*/
}

function testFiles() {
    console.log(Files.find().fetch());
}

AutoForm.hooks({
    createDatasetForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {

//            insertDoc._version = 1;
//            insertDoc.owner = Meteor.user()._id;
            insertDoc.files = Session.get('tempFiles');

            // insert data set document to the mongodb collection
            Meteor.call('insertDataSet', insertDoc, function(error, docId){
              if(error) {
                displayError('Failed to create the data set. Please try again.', error);
              }
              else {
                // if successful
                // set uploaded files as not dirty
                insertDoc.files.forEach(function(file) {
                  if (file && file.key)
                    setFileDirtyStatus(file.key, false);
                });

                //display the created data set
                Meteor.subscribe('dataSets');   // refresh the publication to ensure the user has access to the new experiment document
                Router.go('/dataSet/display/' + docId);
              }
            });


            this.done();
            return false;
        },
    },
    updateDatasetForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            updateDoc.$set.files = Session.get('tempFiles');
            Meteor.call('updateDataSet', currentDoc, updateDoc, function(error, docId){
                if(error) {
                  displayError('Failed to update the data set. Please try again.', error);
                }
                else {
                    // set uploaded files as clean
                    updateDoc.$set.files.forEach(function(file) {
                      if (file && file.key)
                        setFileDirtyStatus(file.key, false);
                    });

                    // mark deleted files as dirty
                    var deletedFileIds = Session.get('deletedFileIds');
                    deletedFileIds.forEach(function(fileId) {
                      setFileDirtyStatus(fileId, true);
                    });
                    Session.set('deletedFileIds', []);

                    var currentDataSetId = getCurrentObjectId();
                    Router.go('/dataSet/display/' + currentDataSetId);
                }
            });

            this.done();
            return false;
        }
    }
})

Template.dataSet.events = {
    'click .upload-btn':function(event){
        event.preventDefault();
        Session.set('uploadButtonClicked', true);
    },
    'click .cancel-update':function(event){
        event.preventDefault();
        Session.set('tempFiles', null);
        Session.set('deletedFileIds', []);
        Router.go('/dataSet/display/' + getCurrentObjectId());
    },
    'click .cancel-create':function(event){
        event.preventDefault();
        Session.set('tempFiles', null);
        Session.set('deletedFileIds', []);
//        Session.set('filesUploaded', []);
        window.history.back();
    },
    'click .delete-file':function(event) {
        event.preventDefault();
        var selectedFileId = $(event.target).attr('id');
        var currentFiles = Session.get('tempFiles');

        var deletedFileIds = Session.get('deletedFileIds');
        deletedFileIds.push(selectedFileId);
        Session.set('deletedFileIds', deletedFileIds);

        var newFiles = [];
        if (currentFiles && currentFiles.length > 0) {
          // remove file from tempFiles session variable
            currentFiles.forEach(function(file) {
                if (file.key != selectedFileId)
                    newFiles.push(file);
            });
            Session.set('tempFiles', newFiles);

        }

        else {
          displayError('Error removing data set, please try again', error);
        }
    },
    'click .enable-update':function(event){
        event.preventDefault();
        var dataSetId = getCurrentObjectId();
        Router.go('/dataSet/update/' + dataSetId);
    },

    'change #fileInput': function (e, template) {
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        var file = e.currentTarget.files[0];
        // We upload only one file, in case
        // multiple files were selected

        var filename = file.name;
        while(filenameAlreadyExists(filename)) {
            filename = prompt('A file with this name has already been uploaded to this data set. Please enter an alternative name for the uploaded file.', filename);
        };

        var upload = StoredFiles.insert({
          file: file,
          fileName: filename,
          streams: 'dynamic',
          chunkSize: 'dynamic',
          meta: {
            dirty: true
          }
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
            Session.set('uploadButtonClicked', false);

/*            keep track of what files have been uploaded so that they can be deleted if the create/update is cancelled
            var filesUploaded = Session.get('filesUploaded');
            filesUploaded.push(name);
            Session.set('filesUploaded', filesUploaded); */
          }
          template.currentUpload.set(false);
        });

        upload.start();


      }
    }

/*    'change .file-select':function(event, template){
        FS.Utility.eachFile(event, function(file) {
            while(filenameAlreadyExists(filename = file.name)) {
                filename = prompt('A file with this name has already been uploaded to this data set. Please enter an alternative name for the uploaded file.', filename);
            };
            file.type = 'dataSet';
            file.dataSetId = getCurrentObjectId();
            Files.insert(file, function (err, fileObj) {
                if(err) console.log(err);
                else {
                    var name = 'files-' + fileObj._id + '-' + filename;
                    var isDownloadable = document.getElementById('downloadable').checked;
                    var fileType = $("input[type='radio'][name='fileType']:checked").val();
                    var fileRecord = {
                        path: FILE_BUCKET+'/'+name,
                        name: filename,
                        size: fileObj.size(),
                        key: name,
                        created: new Date(),
                        downloadable: isDownloadable,
                        type: fileType,
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
                }
            });

        });
    }*/
};

function filenameAlreadyExists(filename) {
    var tempFiles = Session.get('tempFiles');
    var tempFileNames = getAttributeArrayFromObjects(tempFiles, "name");
    return (tempFileNames.indexOf(filename) != -1)
}

function getCurrentDataSet() {
  if(Router.current().data && Router.current().data())
    return Router.current().data();
}

function getFiles(dataSet) {
    if( dataSet && dataSet.files && dataSet.files.length > 0 ) {
        var files = new Array();
        for( var i=0; i < dataSet.files.length; ++i ) {
            var file = dataSet.files[i];
            files.push(file);
        }
        return files;
    }
}

Template.dataSet.helpers({
  uploadButtonClicked: function() {
    return Session.get('uploadButtonClicked');
  },
  formId: function() {
    var screenMode = getScreenMode();
    if(screenMode == 'create') return "createDatasetForm"
    else if(screenMode == 'update') return "updateDatasetForm"
    else return null;
  },
  dataIfNeeded: function() {
    var screenMode = getScreenMode();
    if(screenMode == 'create') return null
    else if(screenMode == 'update') return getCurrentDataSet()
    else return null;
  },
  isDownloadable: function() {
      if (this.downloadable)
          return "Yes"
      else {
          return "No"
      }
  },
  dataSet: function() {
      return getCurrentDataSet();
  },
  files: function() {
      var dataSet = getCurrentDataSet();
      return getFiles(dataSet);
  },
  draftFiles: function() {
      return Session.get('tempFiles');
  },
  hasFiles: function() {
      var dataSet = getCurrentDataSet();
      if( dataSet && dataSet.files && dataSet.files.length > 0 ) return true;
      else return false;
  },
  draftHasFiles: function() {
      var tempFiles = Session.get('tempFiles');
      if( tempFiles && tempFiles.length > 0 ) return true;
      else return false;
  },
  isPublic: function() {
      var dataSet = getCurrentDataSet();
      if( dataSet ) {
          if( !dataSet.public ) return 'checked'
          if( dataSet.public === 'true') return 'checked'
          else return undefined
      }
      else return 'checked';
  },
  isPublicOrOwner: function() {
    var dataSet = getCurrentDataSet();
    if( dataSet ) {
        if( !dataSet.public ) return true
        if( dataSet.public === 'true') return true
        else {
            var user = Meteor.user();
            if( user._id === dataSet.owner ) return true;
            else return false;
        }
    }
    else return true;
  },
  inCreateMode: function() {
    var screenMode = getScreenMode();
    return (screenMode == 'create')
  },
  latestVersion: function() {
    var currentDataSet = getCurrentDataSet();
    if(currentDataSet)
        return currentDataSet.latest
    else {
        return false;
    }
  },
  noVariablesRecorded: function() {
    var currentDataSet = getCurrentDataSet();
    if (currentDataSet && currentDataSet.variables) {
        variables = currentDataSet.variables;
        return (!(variables.NEE || variables.Qg || variables.Qh || variables.Qle ||
              variables.Rnet || variables.SWnet));
    }
    else return true;

  },
  userName: function(userId) {
    var user = Meteor.users.findOne({'_id':userId});
    if (user && user.profile) {
      if (user.profile.fullname)
        return user.profile.fullname;
      else if (user.profile.firstName && user.profile.lastName)
        return user.profile.firstName + " " + user.profile.lastName;
      else {
        return '';
      }
    }
    else {
      return '';
    }
  }
});
