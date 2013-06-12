Template.dataset.rendered = function() {
    window['directives']();
    $('.display').each(function(index,element){
        var content = $(element).html();
        if( content && content.length > 0 ) {
            $(element).next('.modifier').hide();
            $(element).show();
        }
    });
};

Template.dataset.dataSet = function() {
    var currentDataSetId = Session.get('currentDataSet');
    var currentDataSet = DataSets.findOne({'_id':currentDataSetId});
    return currentDataSet;
}

Template.dataset.update = function(event) {
    var fieldName = $(event.target).attr('name');
    var value = $(event.target).val();
    Template.dataset.performUpdate(fieldName,value);
};

/*
Template.dataset.select = function(event) {
    var fieldName = $(event.target).attr('name');
    var id = $(event.target).val();
    var value = undefined;
    if( fieldName == 'type' ) {
        value = DataSetTypes.findOne({'_id':id});
    }
    Template.dataset.performUpdate(fieldName,value);
};
*/

Template.dataset.performUpdate = function(fieldName,value) {
    if( value ) {
    
        var user = Meteor.user();
        currentDataSetId = Session.get('currentDataSet');
        
        if( currentDataSetId ) {
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
    'click .display':function(event) {
        if( Meteor.user().admin ) {
            $(event.target).next('.modifier').show();
            $(event.target).hide();
        }
    },
    'change select':function(event) {
        Template.dataset.update(event);
    },
    'click #upload-version':function(event) {
        event.preventDefault();
        Template.dataset.upload();
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
                
                    filepicker.setKey(Reference.findOne().filePickerAPIKey);
                    filepicker.remove(currentVersion, {}, function(){
                    }, function(FPError){
                        console.log('Failed to delete the version from the file system');
                    });
                }
            }
        }
    }
});

Template.dataset.reference = function() {
    var reference = Reference.findOne();
    return reference;
};

Handlebars.registerHelper('selected', function(foo, bar) {
    return foo == bar ? 'selected' : '';
});

Template.dataset.upload = function() {
    filepicker.setKey(Reference.findOne().filePickerAPIKey);
    filepicker.pickAndStore({},{},function(fpfiles){
        fpfiles.forEach(function(file){
            file.created = new Date();
        });
        currentDataSetId = Session.get('currentDataSet');
        console.log(currentDataSetId);
        console.log(JSON.stringify(fpfiles));
        DataSets.update({'_id':currentDataSetId},
            {'$pushAll':{'versions':fpfiles}},function(error){
                if( error ) {
                    console.log(error);
                    $('.error').html('Failed to add uploaded version to the data set');
                    $('.error').show();
                }
        });
    });
};

Template.dataset.hasVersions = function() {
    var dataSet = Template.dataset.dataSet();
    if( dataSet && dataSet.versions && dataSet.versions.length > 0 ) return true;
    else return false;
};