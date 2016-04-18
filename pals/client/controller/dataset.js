
Template.dataset.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
    Session.set('disableUpdate',false);
    this.autorun( function(){
      if(Session.equals('inEditMode', true))
        return;

    });
//    console.log(Session.get('editMode'));
};

var events = {
    'click .delete-file':function(event) {
        if( Meteor.user().admin ) {
            var key = $(event.target).attr('id');
            console.log('Key: ' + key);

            var currentDataSet = Template.dataset.dataSet();
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
    },
    'click .update-dataset':function(event){
        Session.set('inEditMode', true);
        Session.set('disableUpdate', true);
        console.log(Session.get('disableUpdate'));
    },
    'change .file-select':function(event, template){

        var currentDataSetId = Session.get('currentDataSet');
        if( !currentDataSetId ) {
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

Template.dataset.events(templateSharedObjects.form({
    meteorSessionId: 'currentDataSet',
    collectionName: 'DataSets'
}).events().extend(events));

Template.dataset.dataSet = function() {
    console.log()
    var currentDataSetId = Session.get('currentDataSet');
    var currentDataSet = DataSets.findOne({'_id':currentDataSetId});
    return currentDataSet;
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

Template.dataset.files = function() {
    var dataSet = Template.dataset.dataSet();
    return getFiles(dataSet);
}

Template.dataset.reference = function() {
    var reference = Reference.findOne();
    return reference;
};

Template.dataset.hasFiles = function() {
    var dataSet = Template.dataset.dataSet();
    if( dataSet && dataSet.files && dataSet.files.length > 0 ) return true;
    else return false;
};

Template.dataset.updateDisabled = function() {
    var toDisable = Session.get(disableUpdate);
    console.log(toDisable);
    if ( toDisable ) return true
    else return '';
}

Template.dataset.variables = function() {
    return Variables.find();
}

Template.dataset.helpers({
  isPublic: function() {
    var dataSet = Template.dataset.dataSet();
    if( dataSet ) {
        if( !dataSet.public ) return 'checked'
        if( dataSet.public === 'true') return 'checked'
        else return undefined
    }
    else return 'checked';
  },
  isPublicOrOwner: function() {
    var dataSet = Template.dataset.dataSet();
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
  inEditMode: function() {
    return Session.get('ininEditMode');
  },
  updateDisabled: function() {
    return Session.get('disableUpdate');
  }
});
