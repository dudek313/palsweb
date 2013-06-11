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
                    $('.error').html(error);
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
        $(event.target).next('.modifier').show();
        $(event.target).hide();
    },
    'change select':function(event) {
        Template.dataset.update(event);
    }
});

Template.dataset.reference = function() {
    var reference = Reference.findOne();
    return reference;
};

Handlebars.registerHelper('selected', function(foo, bar) {
    return foo == bar ? 'selected' : '';
});