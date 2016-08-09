
Template.dataset.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
    Session.set('filesToDelete', []);
    Session.set('filesUploaded', []);
};

// Currently not working. findOne() returns 'undefined'
function removeDeletedFiles(fileIds) {

    if (fileIds && fileIds.length > 0) {
        fileIds.forEach(function(fileId) {
            var fileDoc = Files.findOne({_id:fileId});
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
    }
}

function testFiles() {
    console.log(Files.find().fetch());
}

AutoForm.hooks({
    createDatasetForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            insertDoc._version = 1;
            insertDoc.owner = Meteor.user()._id;
            insertDoc.files = Session.get('tempFiles');
            // insert data set document to the mongodb collection
            Meteor.call('insertDataSet', insertDoc, function(error, docId){
                if(error) {
                  displayError('Failed to create the data set. Please try again.');
                  console.log(error.reason);
                }
                else {
                    // if successful, display the created data sets
                    testFiles();
                    removeDeletedFiles(Session.get('filesToDelete'));
                    Session.set('filesToDelete', []);

                    Session.set('dirty', false);
                    Router.go('/dataset/display/' + docId);
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
                  displayError('Failed to update the data set. Please try again.');
                  console.log(error.reason);
                }
                else {
                    Session.set('dirty', false);
                    removeDeletedFiles(Session.get('filesToDelete'));
                    Session.set('filesToDelete', []);

                    var currentDataSetId = getCurrentObjectId();
                    Router.go('/dataset/display/' + currentDataSetId);
                }
            });

            this.done();
            return false;
        }
    }
})

Template.dataset.events = {
    'click .upload-btn':function(event){
        event.preventDefault();
        Session.set('uploadButtonClicked', true);
    },
    'click .cancel-update':function(event){
        event.preventDefault();
        removeDeletedFiles(Session.get('filesUploaded'));
        Session.set('filesUploaded', []);
        Router.go('/dataset/display/' + getCurrentObjectId());
    },
    'click .cancel-create':function(event){
        event.preventDefault();
        removeDeletedFiles(Session.get('filesUploaded'));
        Session.set('filesUploaded', []);
        Router.go('/home')
    },
    'click .delete-file':function(event) {
        event.preventDefault();
        var selectedFileId = $(event.target).attr('id');
        var currentFiles = Session.get('tempFiles');

        var newFiles = [];
        if (currentFiles && currentFiles.length > 0) {
          // remove file from tempFiles session variable
            currentFiles.forEach(function(file) {
                if (file.key != selectedFileId)
                    newFiles.push(file);
            });
            Session.set('tempFiles', newFiles);

            // add file to filesToDelete session variable
            var filesToDelete = Session.get('filesToDelete');
            filesToDelete.push(selectedFileId);
            Session.set('filesToDelete', filesToDelete);
        }

        else {
          displayError('Error removing data set, please try again');
          console.log(error.reason);
        }
    },
    'click .enable-update':function(event){
        event.preventDefault();
        var dataSetId = getCurrentObjectId();
        Router.go('/dataset/update/' + dataSetId);
    },
    'change .file-select':function(event, template){
        FS.Utility.eachFile(event, function(file) {
            while(filenameAlreadyExists(filename = file.name)) {
                filename = prompt('A file with this name has already been uploaded to this data set. Please enter an alternative name for the uploaded file.', filename);
            };
            Files.insert(file, function (err, fileObj) {
                if(err) console.log(err);
                else {
//                    var originalFilename = filename;
                    var name = 'files-' + fileObj._id + '-' + filename;
//                    var name = 'files-' + fileObj._id + '-' + originalFilename;
                    var isDownloadable = document.getElementById('downloadable').checked;
                    var fileType = $("input[type='radio'][name='fileType']:checked").val();
                    var fileRecord = {
                        path: FILE_BUCKET+'/'+name,
                        name: filename,
                        size: fileObj.size(),
                        key: name,
  //                        fileObjId: fileObj._id,
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
    }
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

Template.dataset.helpers({
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
  userEmail: function(userId) {
      var user = Meteor.users.findOne({'_id':userId});
      if( user && user.emails && user.emails.length > 0 ) {
          return Meteor.users.findOne({'_id':userId}).emails[0].address;
      }
      else return '';
  }
});
