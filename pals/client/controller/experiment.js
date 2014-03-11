Template.experiment.rendered = function() {
    window['directives']();
    //templateSharedObjects.progress().hide();
};

Template.experiment.experiment = function() {
    currentExperimentId = Session.get('currentExperiment');
    if( currentExperimentId ) {
        return Experiments.findOne({'_id':currentExperimentId});
    }
}

Template.experiment.modelOutputs = function() {
    currentExperimentId = Session.get('currentExperiment');
    if( currentExperimentId ) {
        return  ModelOutputs.find({'experiment':currentExperimentId});
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
        
            if( value == "n/a" ) value = null;
        
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
            //if( fieldName != 'type' ) currentExperiment.type = reference.dataSetType[0];
            //if( fieldName != 'country' ) currentExperiment.country = reference.country[0];
            //if( fieldName != 'vegType' ) currentExperiment.vegType = reference.vegType[0];
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
                    {'$push':{'dataSets':selected}},function(error){
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
                {$pull:{'dataSets':dataSetId}},function(error){
                if(error) {
                    $('.error').html('Sorry, there was an error removing the data set, try again');
                    $('.error').show();
                }
            });
        }
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
                
                    Meteor.call('removeFileByUrl',currentScript.url);
                }
            }
        }
    },
    'change .file-select': function(event, template){
        var file = event.target.files[0];
        var reader = new FileReader();
        var currentExperimentId = Session.get('currentExperiment');
        if( !currentExperimentId ) {
            alert("Please enter an experiment name before uploading scripts");
            return;
        }
        var progress = templateSharedObjects.progress();
        progress.showProgress();
        reader.onload = function(fileLoadEvent) {
            Meteor.call('uploadScript', currentExperimentId, file.name, file.size, reader.result);
        };
        reader.onprogress = progress.readerProgress;
        reader.readAsBinaryString(file);
    }
});

Template.experiment.dataSets = function() {
    var user = Meteor.user();
    return  DataSets.find({'workspaces':user.profile.currentWorkspace._id});
};

Template.experiment.drivingDataSets = function() {
    var exp = Template.experiment.experiment();
    if( exp && exp.dataSets && exp.dataSets.length > 0) {
        var drivingDataSets = DataSets.find({_id:{$in:exp.dataSets}});
        return drivingDataSets;
    }
};

Template.experiment.hasScripts = function() {
    var experiment = Template.experiment.experiment();
    if( experiment && experiment.scripts && experiment.scripts.length > 0 ) return true;
    else return false;
};

Template.experiment.uploadDisabled = function() {
    var currentExperiment = Template.experiment.experiment();
    if( currentExperiment ) return '';
    else return 'disabled="disabled"';
}