
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
                    Router.go('/dataset/display/' + docId);
                }
            });

            this.done();
            return false;
        },
        before: {
            normal: function(doc) {

            }
        },
/*
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            event.preventDefault();
            updateDoc._version = 1;
            console.log('currentDoc: ' + currentDoc);
//            currentDoc._id = Session.get('currentDataSet');
            console.log('ready to insert doc: ' + currentDoc);
            Meteor.call('updateDataSet', currentDoc, updateDoc);
// need to include code to Router.go to the new inserted dataSet
            this.done();
            return false;
        },
        onSuccess: function(doc) {
//            Router.go('/dataset/display/'+this.docId);
        }
        */
    },
    updateDatasetForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
          event.preventDefault();
          insertDoc._version = 1;
          insertDoc.draft = true;
          Meteor.call('insertDataSet', insertDoc, function(error, docId){
              if(error) {
                  console.log(error.reason);
              }
              else {
                  Router.go('/dataset/display/' + docId);
              }
          });

          this.done();
          return false;
      },
  }

/*       onSubmit: function(insertDoc, updateDoc, currentDoc) {
            console.log('entered onSubmit');

            event.preventDefault();
            Meteor.call('updateDataSet', currentDoc, updateDoc, function(error, docId){
                if(error) {
                    console.log(error.reason);
                }
                else {
                    Router.go('dataset/display/' + docId);
                }
            });

            this.done();
            return false;
        }

    }
*/
})

Template.dataset.events = {
//    'click .create-btn':function(event) {
//        console.log('created new dataSet');
//    },
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
                    Files.remove({_id:currentFile.fileObjId},function(err){
                       if(err) console.log(err);
                    });
                }
            }
        }
    },
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
    'click .enable-update':function(event){
        Session.set('screenMode', 'update');
    },
/*
    'click .save-update':function(event){
        var oldDSVersion = Template.dataset.dataSet();
        var newDSVersion = Template.dataset.cloneDataSet();
        updateVersion('dataSet', oldDSVersion, newDSVersion);
        Session.set('inEditMode', false);
        Session.set('disableUpdateBtn', false);
    },
    'click .cancel-update':function(event){
        console.log('update canceled');
        Session.set('inEditMode', false);
        Session.set('disableUpdateBtn', false);
//        window.location.reload();
    },
*/
    'click .file-select':function(event, template){

        var currentDataSetId = Session.get('currentDataSet');
        if( !currentDataSetId ) {

        }
    },
    'change .file-select':function(event, template){
        event.preventDefault();

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
                    console.log('fileRecord: ');
                    console.log(fileRecord);
                    var selector = {'_id':currentDataSetId};
                    var updateDoc = {'$push':{'files':{'path':"/1234"}}};
                    Meteor.call('updateDataSet', selector, updateDoc, function(error,docId){
//                        {'$push':{'files':fileRecord}},function(error,docId){
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

//Template.dataset.events(templateSharedObjects.form({
//    meteorSessionId: 'currentDataSet',
//    collectionName: 'DataSets'
//}).events().extend(events));

/*Template.dataset.dataSet = function() {
    var currentDataSetId = Session.get('currentDataSet');
    var currentDataSet = DataSets.findOne({'_id':currentDataSetId});
    return currentDataSet;
}
*/
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
/*  invokeAfterLoad: function() {
      Meteor.defer(function() {
          var id_value = new Meteor.Collection.ObjectID()._str;
          var draftDataSet = {

              _id: id_value,
              name: id_value,
              type: 'flux tower',
              spatialLevel: 'SingleSite',
              draft: true
          };
          console.log('draft name: ' + draftDataSet.name);
          console.log('draft id: ' + draftDataSet._id);
          Meteor.call('insertDataSet', draftDataSet);
          Session.set('currentDataSet', draftDataSet._id);
      });
  },
  */
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
