Template.dataset.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
};

var events = {
    'click .delete-version':function(event) {
        if( Meteor.user().admin ) {
            var key = $(event.target).attr('id');

            var currentDataSet = Template.dataset.dataSet();
            if( currentDataSet.versions ) {
                var currentVersion = undefined;
                currentDataSet.versions.forEach(function(version) {
                    if( version.key == key ) {
                        currentVersion = version;
                    }
                });
                if( currentVersion ) {
                    DataSets.update({'_id':currentDataSet._id},
                        {$pull : {'versions':{ 'key':key }}}, function(error) {
                            if( error ) {
                                $('.error').html('Failed to delete version, please try again');
                                $('.error').show();
                            }
                        }
                    );
                    Files.remove({_id:currentVersion.fileObjId},function(err){
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
                        filename: originalFilename,
                        size: fileObj.size(),
                        key: name,
                        fileObjId: fileObj._id,
                        created: new Date()
                    };
                    DataSets.update({'_id':currentDataSetId},
                        {'$push':{'versions':fileRecord}},function(error){
                            if( error ) {
                                console.log(error);
                                console.log('Failed to add uploaded version to the data set');
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
    var currentDataSetId = Session.get('currentDataSet');
    var currentDataSet = DataSets.findOne({'_id':currentDataSetId});
    return currentDataSet;
}

function getVersions(dataSet) {
    if( dataSet && dataSet.versions && dataSet.versions.length > 0 ) {
        var versions = new Array();
        for( var i=0; i < dataSet.versions.length; ++i ) {
            var version = dataSet.versions[i];
            versions.push(version);
        }
        return versions;
    }
}

Template.dataset.versions = function() {
    var dataSet = Template.dataset.dataSet();
    return getVersions(dataSet);
}

Template.dataset.reference = function() {
    var reference = Reference.findOne();
    return reference;
};

Template.dataset.hasVersions = function() {
    var dataSet = Template.dataset.dataSet();
    if( dataSet && dataSet.versions && dataSet.versions.length > 0 ) return true;
    else return false;
};

Template.dataset.uploadDisabled = function() {
    var currentDataSet = Template.dataset.dataSet();
    if( currentDataSet ) return '';
    else return 'disabled="disabled"';
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
  }
});