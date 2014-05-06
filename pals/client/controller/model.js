Template.model.rendered = function() {
    window['directives']();
};

Template.model.model = function() {
    currentModelId = Session.get('currentModel');
    if( currentModelId ) {
        return Models.findOne({'_id':currentModelId});
    }
}

Template.model.events(templateSharedObjects.form({
    meteorSessionId: 'currentModel',
    collectionName: 'Models'
}).events());

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