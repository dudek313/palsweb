Template.model.rendered = function() {
    window['directives']();
};

Template.model.model = function() {
    currentModelId = Session.get('currentModel');
    if( currentModelId ) {
        var model = Models.findOne({'_id':currentModelId});
        if( model.owner ) {
            model.owner = Meteor.users.findOne({'_id':model.owner},{'_id':1,'name':1});
            if( model.owner && model.owner.emails && model.owner.emails.length > 0) {
                model.owner.email = model.owner.emails[0].address;
            }
        }
        console.log(model.owner);
        return model;
    }
}

Template.model.events(templateSharedObjects.form({
    meteorSessionId: 'currentModel',
    collectionName: 'Models'
}).events());

AutoForm.hooks({
    createModelForm: {
        onSuccess: function(formType, result) {
            Session.set('screenMode', 'display');
            Router.go('/dataset/display/' + docId);
        }
    },
    updateDatasetForm: {
        
    }
})


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

function getCurrentModel() {
    var currentModelId = Session.get('currentModel');
    var currentModel = Models.findOne({'_id':currentModelId});
    return currentModel;
}


Template.dataset.helpers({
  formId: function() {
    var screenMode = Session.get('screenMode');
    if(screenMode == 'create') return "createModelForm"
    else if(screenMode == 'update') return "updateModelForm"
    else return null;
  },
  dataIfNeeded: function() {
    var screenMode = Session.get('screenMode');
    if(screenMode == 'create') return null
    else if(screenMode == 'update') return getCurrentModel()
    else return null;
  },
  formType: function() {
    var screenMode = Session.get('screenMode');
    if(screenMode == 'create') return "insert"
    else if(screenMode == 'update') return "update"
    else return null;
  }
});
