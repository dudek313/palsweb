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
});