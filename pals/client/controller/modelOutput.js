Template.modelOutput.rendered = function() {
    window['directives']();
    $('.display').each(function(index,element){
        var content = $(element).html();
        if( content && content.length > 0 ) {
            $(element).next('.modifier').hide();
            $(element).show();
        }
    });
};

Template.modelOutput.modelOutput = function() {
    var currentModelOutputId = Session.get('currentModelOutput');
    var currentModelOutput = ModelOutputs.findOne({'_id':currentModelOutputId});
    if( currentModelOutput && currentModelOutput.experiment ) {
        currentModelOutput.experiment = Experiments.findOne({_id:currentModelOutput.experiment});
    }
    return currentModelOutput;
}

Template.modelOutput.update = function(event) {
    var fieldName = $(event.target).attr('name');
    var value = $(event.target).val();
    Template.modelOutput.performUpdate(fieldName,value);
};

Template.modelOutput.reference = function() {
    var reference = Reference.findOne();
    return reference;
};

Template.modelOutput.performUpdate = function(fieldName,value) {
    if( value ) {
    
        var user = Meteor.user();
        currentModelOutputId = Session.get('currentModelOutput');
        var reference = Template.modelOutput.reference();
        
        if( currentModelOutputId ) {
            var selector = {'_id':currentModelOutputId};
            var fieldModifier = {};
            fieldModifier[fieldName] = value;
            var modifier = {'$set':fieldModifier};
            ModelOutputs.update(selector,modifier,function(error){
                if( error ) {
                    $('.error').html('There was an error saving the field, please try again');
                    $('.error').show();
                }
            });
        }
        else {
            currentModelOutput = {
                'owner' : user._id,
                'created' : new Date(),
                'workspaces' : [user.profile.currentWorkspace._id]
            };
            if( fieldName != 'stateSelection' ) currentModelOutput.stateSelection = reference.stateSelection[0];
            if( fieldName != 'parameterSelection' ) currentModelOutput.parameterSelection = reference.parameterSelection[0];
            var experiments = Template.modelOutput.experiments();
            currentModelOutput[fieldName] = value;
            ModelOutputs.insert(currentModelOutput,function(error,id) {
                if( error ) {
                    if( error.error == 409 ) $('.error').html('A model output with that name already exists');
                    else $('.error').html('There was an error saving your value, please try again');
                    $('.error').show();
                }
                else {
                    currentModelOutput._id = id;
                    Session.set('currentModelOutput',id);
                }
            });
        }
    }
};

Template.modelOutput.events({
    'blur input': function (event) {
        Template.modelOutput.update(event);
    },
    'blur textarea': function (event) {
        Template.modelOutput.update(event);
    },
    'blur select':function(event) {
        Template.modelOutput.update(event);
    },
    'click .display':function(event) {
        if( Template.modelOutput.owner() ) {
            $(event.target).next('.modifier').show();
            $(event.target).hide();
        }
    },
    'change select':function(event) {
        Template.modelOutput.update(event);
    },
    'click #upload-version':function(event) {
        event.preventDefault();
        Template.modelOutput.upload();
    },
    'click .delete-version':function(event) {
        if( Template.modelOutput.owner() ) {
            var key = $(event.target).attr('id');
        
            var currentModelOutput = Template.modelOutput.modelOutput();
            if( currentModelOutput.versions ) {
                var currentVersion = undefined;
                currentModelOutput.versions.forEach(function(version) {
                    if( version.key == key ) {
                        currentVersion = version;
                    }
                });
                if( currentVersion ) {
                    ModelOutputs.update({'_id':currentModelOutput._id},
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
    },
    'click .start-analysis':function(event) {
    if( Template.modelOutput.owner() ) {
            var key = $(event.target).attr('id');
            var currentModelOutputId = Session.get('currentModelOutput');
            Meteor.call('startAnalysis',key,currentModelOutputId,function(error,result){
                if( error ) alert(error);
                console.log(result);
            });
        }
    }
});

Template.modelOutput.experiments = function() {
    var user = Meteor.user();
    return Experiments.find({'workspaces':user.profile.currentWorkspace._id});
};

Template.modelOutput.owner = function() {
    var user = Meteor.user();
    var modelOutput = Template.modelOutput.modelOutput();
    if( user && modelOutput ) {
        if( modelOutput.owner == user._id ) return true;
        else return false;
    }
    else {
        return true;
    }
};

Template.modelOutput.upload = function() {
    filepicker.setKey(Reference.findOne().filePickerAPIKey);
    filepicker.pickAndStore({},{},function(fpfiles){
        fpfiles.forEach(function(file){
            file.created = new Date();
        });
        currentModelOutputId = Session.get('currentModelOutput');
        ModelOutputs.update({'_id':currentModelOutputId},
            {'$pushAll':{'versions':fpfiles}},function(error){
                if( error ) {
                    console.log(error);
                    $('.error').html('Failed to add uploaded version to the model output');
                    $('.error').show();
                }
        });
    });
};

Template.modelOutput.hasVersions = function() {
    var modelOutput = Template.modelOutput.modelOutput();
    if( modelOutput && modelOutput.versions && modelOutput.versions.length > 0 ) return true;
    else return false;
};

Template.modelOutput.analyses = function() {
   var modelOutput = Template.modelOutput.modelOutput();
   return Analyses.find({'modelOutput':modelOutput._id});
};