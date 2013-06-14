Template.experiment.rendered = function() {
    window['directives']();
    $('.display').each(function(index,element){
        var content = $(element).html();
        if( content && content.length > 0 ) {
            $(element).next('.modifier').hide();
            $(element).show();
        }
    });
};

Template.experiment.experiment = function() {
    currentExperimentId = Session.get('currentExperiment');
    if( currentExperimentId ) {
        return Experiments.findOne({'_id':currentExperimentId});
    }
}

Template.experiment.reference = function() {
    return Reference.findOne();
};

Template.experiment.update = function(event) {
    var fieldName = $(event.target).attr('name');
    var value = $(event.target).val();
    Template.experiment.performUpdate(fieldName,value);
};

Template.experiment.performUpdate = function(fieldName,value) {
    if( value ) {
    
        var user = Meteor.user();
        currentExperimentId = Session.get('currentExperiment');
        var reference = Template.experiment.reference();
        
        if( currentExperimentId ) {
            var selector = {'_id':currentExperimentId};
            var fieldModifier = {};
            fieldModifier[fieldName] = value;
            var modifier = {'$set':fieldModifier};
            Experiments.update(selector,modifier,function(error){
                if( error ) {
                    $('.error').html('There was an error saving the field, please try again');
                    $('.error').show();
                }
            });
        }
        else {
            currentExperiment = {
                'owner' : user._id,
                'created' : new Date(),
                'workspaces' : [user.profile.currentWorkspace._id]
            };
            if( fieldName != 'type' ) currentExperiment.type = reference.dataSetType[0];
            if( fieldName != 'country' ) currentExperiment.country = reference.country[0];
            if( fieldName != 'vegType' ) currentExperiment.vegType = reference.vegType[0];
            if( fieldName != 'spatialLevel' ) currentExperiment.spatialLevel = reference.spatialLevel[0];
            if( fieldName != 'timeStepSize' ) currentExperiment.timeStepSize = reference.timeStepSize[0];
            currentExperiment[fieldName] = value;
            Experiments.insert(currentExperiment,function(error,id) {
                if( error ) {
                    if( error.error == 409 ) $('.error').html('An experiment with that name already exists');
                    else $('.error').html('There was an error saving your value, please try again');
                    $('.error').show();
                }
                else {
                    currentExperiment._id = id;
                    Session.set('currentExperiment',id);
                }
            });
        }
    }
};

Template.experiment.events({
    'blur input': function (event) {
        Template.experiment.update(event);
    },
    'blur textarea': function (event) {
        Template.experiment.update(event);
    },
    'click .display':function(event) {
        if( Meteor.user().admin ) {
            $(event.target).next('.modifier').show();
            $(event.target).hide();
        }
    },
    'change select':function(event) {
        Template.experiment.update(event);
    },
    'click #driving-data-set':function(event) {
        event.preventDefault();
        var selected = $('select[name="drivingDataSet"]').val();
        if( selected ) {
            var experimentId = Session.get('currentExperiment');
            if( !experimentId ) alert('Please enter an experiment name before adding data sets');
            else {
                Experiments.update({'_id':experimentId},
                    {'$push':{'drivingDataSets':selected}},function(error){
                    if( error ) {
                         $('.error').html('Error adding data set, please try again');
                         $('.error').show();
                    }
                });
            }
        }
    },
    'click .remove-driving-dataset':function(event) {
        console.log('here');
        var dataSetId = $(event.target).attr('id');
        var experimentId = Session.get('currentExperiment');
        if( dataSetId && experimentId ) {
            Experiments.update({_id:experimentId},
                {$pull:{'drivingDataSets':dataSetId}},function(error){
                if(error) {
                    $('.error').html('Sorry, there was an error removing the driving data set, try again');
                    $('.error').show();
                }
            });
        }
    },
    'click .remove-input-dataset':function(event) {
        console.log('here');
        var dataSetId = $(event.target).attr('id');
        var experimentId = Session.get('currentExperiment');
        if( dataSetId && experimentId ) {
            Experiments.update({_id:experimentId},
                {$pull:{'inputDataSets':dataSetId}},function(error){
                if(error) {
                    $('.error').html('Sorry, there was an error removing the input data set, try again');
                    $('.error').show();
                }
            });
        }
    },
    'click #input-data-set':function(event) {
        event.preventDefault();
        var selected = $('select[name="inputDataSet"]').val();
        if( selected ) {
            var experimentId = Session.get('currentExperiment');
            if( !experimentId ) alert('Please enter an experiment name before adding data sets');
            else {
                Experiments.update({'_id':experimentId},
                    {'$push':{'inputDataSets':selected}},function(error){
                    if( error ) {
                         $('.error').html('Error adding data set, please try again');
                         $('.error').show();
                    }
                });
            }
        }
    },
    'click #upload-script':function(event) {
        event.preventDefault();
        Template.experiment.upload();
    },
    'click .delete-script':function(event) {
        if( Meteor.user().admin ) {
            var key = $(event.target).attr('id');
        
            var currentExperiment = Template.experiment.experiment();
            if( currentExperiment.scripts ) {
                var currentScript = undefined;
                currentExperiment.scripts.forEach(function(script) {
                    if( script.key == key ) {
                        currentScript = script;
                    }
                });
                if( currentScript ) {
                    Experiments.update({'_id':currentExperiment._id},
                        {$pull : {'scripts':{ 'key':key }}}, function(error) {
                            if( error ) {
                                $('.error').html('Failed to delete script, please try again');
                                $('.error').show();
                            }
                        }
                    );
                
                    filepicker.setKey(Reference.findOne().filePickerAPIKey);
                    filepicker.remove(currentScript, {}, function(){
                    }, function(FPError){
                        console.log('Failed to delete the script from the file system');
                    });
                }
            }
        }
    }
});

Template.experiment.dataSets = function() {
    var user = Meteor.user();
    return  DataSets.find({'workspaces':user.profile.currentWorkspace._id});
};

Template.experiment.drivingDataSets = function() {
    var exp = Template.experiment.experiment();
    if( exp && exp.drivingDataSets && exp.drivingDataSets.length > 0) {
        var drivingDataSets = DataSets.find({_id:{$in:exp.drivingDataSets}});
        return drivingDataSets;
    }
};

Template.experiment.inputDataSets = function() {
    var exp = Template.experiment.experiment();
    if( exp && exp.inputDataSets && exp.inputDataSets.length > 0) {
        var inputDataSets = DataSets.find({_id:{$in:exp.inputDataSets}});
        return inputDataSets;
    }
};

Template.experiment.upload = function() {
    var currentExperimentId = Session.get('currentExperiment');
    if( !currentExperimentId ) {
        alert("Please enter an experiment name before uploading scripts");
        return;
    }
    filepicker.setKey(Reference.findOne().filePickerAPIKey);
    filepicker.pickAndStore({},{},function(fpfiles){
        fpfiles.forEach(function(file){
            file.created = new Date();
        });
        Experiments.update({'_id':currentExperimentId},
            {'$pushAll':{'scripts':fpfiles}},function(error){
                if( error ) {
                    $('.error').html('Failed to add uploaded script to the experiment');
                    $('.error').show();
                }
        });
    });
};

Template.experiment.hasScripts = function() {
    var experiment = Template.experiment.experiment();
    if( experiment && experiment.scripts && experiment.scripts.length > 0 ) return true;
    else return false;
};