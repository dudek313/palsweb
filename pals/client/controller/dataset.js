
Template.dataset.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
};

AutoForm.hooks({
    createDatasetForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            event.preventDefault();
            insertDoc._version = 1;
            var currentDraftDataSet = getCurrentDraftDataSet();
            insertDoc.owner = Meteor.user()._id;
            insertDoc.files = getDraftFiles(currentDraftDataSet);
            Meteor.call('insertDataSet', insertDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to create the data set. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    console.log(docId);
                    DraftDataSets.remove({_id:currentDraftDataSet._id});
                    Router.go('/dataset/display/' + docId);
                }
            });

            this.done();
            return false;
        },
        before: {
            normal: function(doc) {
                doc._id = Session.get(currentDataSet);
            }
        },
    },
    updateDatasetForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            var currentDraftDataSet = getCurrentDraftDataSet();
            updateDoc.$set.files = getDraftFiles(currentDraftDataSet);
            Meteor.call('updateDataSet', currentDoc, updateDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to update the data set. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    Session.set('screenMode', 'display');
                    var currentDataSetId = Session.get('currentDataSet');
                    Router.go('/dataset/display/' + currentDataSetId);
                }
            });

            this.done();
            return false;
        }
    }
})

Template.dataset.events = {
    'click .cancel-update':function(event){
        event.preventDefault();
        Session.set('screenMode','display');
    },
    'click .cancel-create':function(event){
        event.preventDefault();
        Router.go('/home')
    },
    'click .delete-file':function(event) {
        event.preventDefault();
        if( Meteor.user().admin ) {
            var key = $(event.target).attr('id');
            var currentDraftDataSet = getCurrentDraftDataSet();
            if( currentDraftDataSet.files ) {
                var currentFile = undefined;
                currentDraftDataSet.files.forEach(function(file) {
                    if( file.key == key ) {
                        currentFile = file;
                    }
                });
                if( currentFile ) {
                    Meteor.call('updateDraftDataSet', {'_id':currentDraftDataSet._id},
                        {$pull : {'files':{ 'key':key }}}, function(error) {
                            if( error ) {
                                $('.error').html('Failed to delete file, please try again');
                                $('.error').show();
                                console.log(error.reason);
                            }
                        }
                    );
//    We don't actually want to remove files from the system when we remove them from the data set
//    We need to create a dashboard for the data admin to be able to delete files from the system.
//                    Files.remove({_id:currentFile.fileObjId},function(err){
//                       if(err) console.log(err);
//                    });
                }
            }
        }
    },
    'change #downloadable': function() {

    },
    'click .enable-update':function(event){
        var dataSetId = Session.get('currentDataSet');
        var draftExists = DraftDataSets.findOne({_id: dataSetId});
        if( draftExists ) {
            DraftDataSets.remove({_id:dataSetId});
        }
        var currentDataSet = getCurrentDataSet();
        Meteor.call('createDraftDataSet', currentDataSet, function(error, docId){
            if(error) {
                $('.error').html('Unable to update data set. Please try again.');
                $('.error').show();
                console.log(error);
            }
            else {
                Session.set('screenMode', 'update');
            }
        });
    },
    'change .file-select':function(event, template){
        var currentDataSetId = Session.get('currentDataSet');
        FS.Utility.eachFile(event, function(file) {
            Files.insert(file, function (err, fileObj) {
                if(err) console.log(err);
                else {
                    var originalFilename = fileObj.name();
                    var name = 'files-' + fileObj._id + '-' + originalFilename;
                    var isDownloadable = document.getElementById('downloadable').checked;
                    var fileType = $("input[type='radio'][name='fileType']:checked").val();
                    var fileRecord = {
                        path: FILE_BUCKET+'/'+name,
                        name: originalFilename,
                        size: fileObj.size(),
                        key: name,
//                        fileObjId: fileObj._id,
                        created: new Date(),
                        downloadable: isDownloadable,
                        type: fileType
                    };
                    Meteor.call('updateDraftDataSet',{'_id':currentDataSetId},
                        {'$push':{'files':fileRecord}},function(error){
                            if( error ) {
                                $('.error').html('Failed to add uploaded file, please try again');
                                $('.error').show();
                                console.log(error.reason);
                            }
                    });
                }
            });
        });
    },
    'click .download-file':function(event, template){
        event.preventDefault();
    }
};

function getCurrentDataSet() {
    var currentDataSetId = Session.get('currentDataSet');
    var currentDataSet = DataSets.findOne({'_id':currentDataSetId});
    return currentDataSet;
}

function getCurrentDraftDataSet() {
    var currentDataSetId = Session.get('currentDataSet');
    var currentDraftDataSet = DraftDataSets.findOne({'_id':currentDataSetId});
    return currentDraftDataSet;
}

function cloneDataSet() {
    var cloneDS = jQuery.extend({}, getCurrentDataSet());
    cloneDS.version = 0;
    return cloneDS;
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

function getDraftFiles(draftDataSet) {
    if( draftDataSet && draftDataSet.files && draftDataSet.files.length > 0 ) {
        var files = new Array();
        for( var i=0; i < draftDataSet.files.length; ++i ) {
            var file = draftDataSet.files[i];
            files.push(file);
        }
        return files;
    }
}

Template.dataset.updateBtnDisabled = function() {
    var toDisable = Session.get(disableUpdateBtn);
    console.log(toDisable);
    if ( toDisable ) return true
    else return '';
}

Template.dataset.variables = function() {
    return Variables.find();
}

Template.dataset.helpers({
  formId: function() {
    var screenMode = Session.get('screenMode');
    if(screenMode == 'create') return "createDatasetForm"
    else if(screenMode == 'update') return "updateDatasetForm"
    else return null;
  },
  dataIfNeeded: function() {
    var screenMode = Session.get('screenMode');
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
      var draftDataSet = getCurrentDraftDataSet();
      return getDraftFiles(draftDataSet);
  },
  hasFiles: function() {
      var dataSet = getCurrentDataSet();
      if( dataSet && dataSet.files && dataSet.files.length > 0 ) return true;
      else return false;
  },
  draftHasFiles: function() {
      var draftDataSet = getCurrentDraftDataSet();
      if( draftDataSet && draftDataSet.files && draftDataSet.files.length > 0 ) return true;
      else return false;
  },
  reference: function() {
      var reference = Reference.findOne();
      return reference;
  },
  inEditMode: function() {
      var screenMode = Session.get('screenMode');
      return (screenMode =='update' || screenMode =='create');
  },
  inUpdateMode: function() {
      return (Session.get('screenMode')=='update');
  },
  inDisplayMode: function() {
      return (Session.get('screenMode')=='display');
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
    var screenMode = Session.get('screenMode');
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


/*Template.dataset.files = function() {
    var dataSet = getCurrentDataSet();
    return getFiles(dataSet);
}
Template.dataset.reference = function() {
    var reference = Reference.findOne();
    return reference;
};
Template.dataset.hasFiles = function() {
    var dataSet = getCurrentDataSet();
    if( dataSet && dataSet.files && dataSet.files.length > 0 ) return true;
    else return false;
};
*/

/*
    'click .add-variable':function(event){
        if( Meteor.user().admin ) {
            var variableId = $('select[name="variable"]').val();
            var user = Meteor.user();
            currentDataSetId = Session.get('currentDataSet');
            variable = Variables.findOne({'_id':variableId});
            if( currentDataSetId && variable) {
                var selector = {'_id':currentDataSetId};
                var modifier = {'$addToSet': {variables:variable}};
                DataSets.update(selector,modifier,function(error){
                    if( error ) {
                        $('.error').html('There was an error adding the variable, please try again');
                        $('.error').show();
                    }
                });
            }
        }
    },
    'click a.remove-variable':function(event){
        if( Meteor.user().admin ) {
            var variableId = $(event.target).parent().attr('id');
            currentDataSetId = Session.get('currentDataSet');
            console.log('removing variable: ' + variableId);
            DataSets.update({'_id':currentDataSetId},
                {$pull : {'variables':{ '_id':variableId }}}, function(error) {
                    if( error ) {
                        $('.error').html('Failed to remove variable, please try again');
                        $('.error').show();
                    }
                }
            );
        }
    },*/
