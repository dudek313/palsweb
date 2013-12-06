Template.model.rendered = function() {
    window['directives']();
    $('.display').each(function(index,element){
        var content = $(element).html();
        if( content && content.length > 0 ) {
            $(element).next('.modifier').hide();
            $(element).show();
        }
    });
};

Template.model.model = function() {
    currentModelId = Session.get('currentModel');
    if( currentModelId ) {
        return Models.findOne({'_id':currentModelId});
    }
}

Template.model.update = function(event) {
    var fieldName = $(event.target).attr('name');
    var value = $(event.target).val();
    Template.model.performUpdate(fieldName,value);
};

Template.model.performUpdate = function(fieldName,value) {
    if( value ) {
    
        var user = Meteor.user();
        currentModelId = Session.get('currentExperiment');
        
        if( currentModelId ) {
            var selector = {'_id':currentModelId};
            var fieldModifier = {};
            fieldModifier[fieldName] = value;
            var modifier = {'$set':fieldModifier};
            Models.update(selector,modifier,function(error){
                if( error ) {
                    $('.error').html('There was an error saving the field, please try again');
                    $('.error').show();
                }
            });
        }
        else {
            currentModel = {
                'owner' : user._id,
                'created' : new Date(),
                'workspaces' : [user.profile.currentWorkspace._id]
            };
            currentModel[fieldName] = value;
            Models.insert(currentModel,function(error,id) {
                if( error ) {
                    if( error.error == 409 ) $('.error').html('A model with that name already exists');
                    else $('.error').html('There was an error saving your value, please try again');
                    $('.error').show();
                }
                else {
                    currentModel._id = id;
                    Session.set('currentModel',id);
                }
            });
        }
    }
};


Template.model.events({
    'blur input': function (event) {
        Template.model.update(event);
    },
    'click .display':function(event) {
        if( Template.model.owner() ) {
            $(event.target).next('.modifier').show();
            $(event.target).hide();
        }
    }
});

Template.model.owner = function() {
    var user = Meteor.user();
    var model = Template.model.model();
    if( user && model ) {
        if( model.owner == user._id ) return true;
        else return false;
    }
    else {
        return true;
    }
};