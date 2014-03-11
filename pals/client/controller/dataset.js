Template.dataset.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
};

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

Template.dataset.update = function(event) {
    var fieldName = $(event.target).attr('name');
    var value = $(event.target).val();
    Template.dataset.performUpdate(fieldName,value);
};

Template.dataset.performUpdate = function(fieldName,value) {
    if( value ) {
    
        var user = Meteor.user();
        currentDataSetId = Session.get('currentDataSet');
        var reference = Template.dataset.reference();
        
        if( currentDataSetId ) {
        
            if ( value == "n/a" ) value = null;
        
            var selector = {'_id':currentDataSetId};
            var fieldModifier = {};
            fieldModifier[fieldName] = value;
            var modifier = {'$set':fieldModifier};
            DataSets.update(selector,modifier,function(error){
                if( error ) {
                    $('.error').html('There was an error saving the field, please try again');
                    $('.error').show();
                }
            });
        }
        else {
            currentDataSet = {
                'owner' : user._id,
                'created' : new Date(),
                'workspaces' : [user.profile.currentWorkspace._id]
            };
            //if( fieldName != 'type' ) currentDataSet.type = reference.dataSetType[0];
            //if( fieldName != 'country' ) currentDataSet.country = reference.country[0];
            //if( fieldName != 'vegType' ) currentDataSet.vegType = reference.vegType[0];
            if( fieldName != 'spatialLevel' ) currentDataSet.spatialLevel = reference.spatialLevel[0];
            currentDataSet[fieldName] = value;
            DataSets.insert(currentDataSet,function(error,id) {
                if( error ) {
                    if( error.error == 409 ) $('.error').html('A data set with that name already exists');
                    else $('.error').html('There was an error saving your value, please try again');
                    $('.error').show();
                }
                else {
                    currentDataSet._id = id;
                    Session.set('currentDataSet',id);
                }
            });
        }
    }
};

Template.dataset.events({
    'blur input': function (event) {
        Template.dataset.update(event);
    },
    'blur textarea': function (event) {
        Template.dataset.update(event);
    },
    'change select.trigger':function(event) {
        Template.dataset.update(event);
    },
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
                
                    Meteor.call('removeFileByUrl',currentVersion.url);
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
    'change .file-select': function(event, template){
        var file = event.target.files[0];
        var reader = new FileReader();
        var currentDataSetId = Session.get('currentDataSet');
        if( !currentDataSetId ) {
            alert("Please enter a data set name before uploading scripts");
            return;
        }
        var progress = templateSharedObjects.progress();
        progress.showProgress();
        reader.onload = function(fileLoadEvent) {
            Meteor.call('uploadDataSet', currentDataSetId, file.name, file.size, reader.result);
        };
        reader.onprogress = progress.readerProgress;
        reader.readAsBinaryString(file);
    }
});

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