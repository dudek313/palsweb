
Template.dataset.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
    this.autorun( function(){
        if(Session.equals('screenMode', 'update'))
          return;

    });
};

AutoForm.hooks({
    createDatasetForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            event.preventDefault();
            insertDoc._version = 1;
            insertDoc.draft = true;
            Meteor.call('insertDataSet', insertDoc, function(error, docId){
                if(error) {
                    console.log(error.reason);
                }
                else {
                    console.log(docId);
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
            Meteor.call('updateDataSet', currentDoc, updateDoc, function(error, docId){
                if(error) {
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
    'click .delete-file':function(event) {
        if( Meteor.user().admin ) {
            var key = $(event.target).attr('id');
            var currentDataSet = getCurrentDataSet();
            if( currentDataSet.files ) {
                var currentFile = undefined;
                currentDataSet.files.forEach(function(file) {
                    if( file.key == key ) {
                        currentFile = file;
                    }
                });
                if( currentFile ) {
                    DataSets.update({'_id':currentDataSet._id},
                        {$pull : {'files':{ 'key':key }}}, function(error) {
                            if( error ) {
                                $('.error').html('Failed to delete file, please try again');
                                $('.error').show();
                                console.log(error);
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
    'click .enable-update':function(event){
        Session.set('screenMode', 'update');
    },
    'click .file-select':function(event, template){
        var currentDataSetId = Session.get('currentDataSet');
        if( !currentDataSetId ) {
            var name = AutoForm.getFieldValue("createDatasetForm", 'name');
            if ( !name ) {
                alert("name not entered");
            }
  //            alert("Please enter a data set name before uploading scripts");
            return;

        }
    },
    'change .file-select':function(event, template){

        var currentDataSetId = Session.get('currentDataSet');
        if( !currentDataSetId ) {
//            var name = AutoForm.getFieldValue("createDatasetForm", 'name');
//            if ( !name )
//                alert("name not entered");
            alert("Please enter a data set name before uploading scripts");
            return;
        }

        FS.Utility.eachFile(event, function(file) {
            Files.insert(file, function (err, fileObj) {
                if(err) console.log(err);
                else {
                    var originalFilename = fileObj.name();
                    var name = 'files-' + fileObj._id + '-' + originalFilename;

                    var fileRecord = {
                        path: FILE_BUCKET+'/'+name,
                        name: originalFilename,
                        size: fileObj.size(),
                        key: name,
//                        fileObjId: fileObj._id,
                        created: new Date()
                    };
                    DataSets.update({'_id':currentDataSetId},
                        {'$push':{'files':fileRecord}},function(error){
                            if( error ) {
                                console.log(error);
                                console.log('Failed to add uploaded file to the data set');
                            }
                    });
                }
            });
        });
    }
};

function getCurrentDataSet() {
  var currentDataSetId = Session.get('currentDataSet');
  var currentDataSet = DataSets.findOne({'_id':currentDataSetId});
  return currentDataSet;
}

Template.dataset.cloneDataSet = function() {
    var cloneDS = jQuery.extend({}, getCurrentDataSet());
    delete cloneDS._id;
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
  dataSet: function() {
      return getCurrentDataSet();
  },
  files: function() {
      var dataSet = getCurrentDataSet();
      return getFiles(dataSet);
  },
  hasFiles: function() {
      var dataSet = getCurrentDataSet();
      if( dataSet && dataSet.files && dataSet.files.length > 0 ) return true;
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
  updateBtnDisabled: function() {
    return Session.get('disableUpdateBtn');
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
