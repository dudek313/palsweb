Template.dataset.rendered = function() {
    window['directives']();
};

Template.dataset.dataSet = function() {
    var currentDataSetId = Session.get('currentDataSet');
    var currentDataSet = DataSets.findOne({'_id':currentDataSetId});
    return currentDataSet;
}

Template.dataset.update = function(event) {
    var fieldName = $(event.target).attr('name');
    var value = $(event.target).val();
    if( value && value.length > 0 ) {
    
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
        else if( fieldName != 'name' ) {
            $('.error').html('Please choose a name first');
            $('.error').show();
        }
        else {
            currentDataSet = {
                'name' : value,
                'owner' : user._id,
                'created' : new Date(),
                'workspaces' : [user.profile.currentWorkspace._id]
            };
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
    /*'keydown input': function (event) {
        if( event.which == 13 ) Template.dataset.update(event);
    }*/
    'click .display':function(event) {
        $(event.target).next('.modifier').show();
        $(event.target).hide();
    }
});

Template.dataset.dataSetTypes = function() {
    return DataSetTypes.find();
};

Template.dataset.rendered = function() {
    $('.display').each(function(index,element){
        var content = $(element).html();
        if( content && content.length > 0 ) {
            $(element).next('.modifier').hide();
            $(element).show();
        }
    });
};