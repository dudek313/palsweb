Template.model.rendered = function() {
    window['directives']();
};

AutoForm.hooks({
    createModelForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            event.preventDefault();
            insertDoc._version = 1;
            insertDoc.owner = Meteor.user()._id;
            insertDoc.created = new Date();
            Meteor.call('insertModel', insertDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to create the model profile. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    console.log(docId);
                    Router.go('/model/display/' + docId);
                }
            });

            this.done();
            return false;
        },
        before: {
            normal: function(doc) {
                doc._id = Session.get(currentDataSet);
            }
        },
    },

    updateModelForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            updateDoc.$set.modified = new Date();
            Meteor.call('updateModel', currentDoc, updateDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to update the model. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    Session.set('screenMode', 'display');
                    var currentModelId = Session.get('currentModel');
                    Router.go('/model/display/' + currentModelId);
                }
            });

            this.done();
            return false;
        }
    }
})

function getCurrentModel() {
    var currentModelId = Session.get('currentModel');
    var currentModel = Models.findOne({'_id':currentModelId});
    return currentModel;
}

Template.model.events = {
    'click .cancel-update':function(event){
        event.preventDefault();
        Session.set('screenMode','display');
    },
    'click .cancel-create':function(event){
        event.preventDefault();
        Router.go('/home')
    },
    'click .enable-update':function(event){
        Session.set('screenMode', 'update');
    }
};

Template.model.helpers({
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
  inCreateMode: function() {
      return (Session.get('screenMode')=='create');
  },
  inUpdateMode: function() {
      return (Session.get('screenMode')=='update');
  },
  inEditMode: function() {
      var screenMode = Session.get('screenMode');
      return (screenMode =='update' || screenMode =='create');
  },
  formType: function() {
    var screenMode = Session.get('screenMode');
    if(screenMode == 'create') return "insert"
    else if(screenMode == 'update') return "update"
    else return null;
  },
  owner: function() {
      var user = Meteor.user();
      var model = getCurrentModel();
      if( user && model ) {
          if( model.owner == user._id ) return true;
          else return false;
      }
      else {
          return true;
      }
  },
  userEmail: function(userId) {
      var user = Meteor.users.findOne({'_id':userId});
      if( user && user.emails && user.emails.length > 0 ) {
          return Meteor.users.findOne({'_id':userId}).emails[0].address;
      }
      else return '';
  },
  model: function() {
      return getCurrentModel();

  },
  updateBtnDisabled: function() {
    return Session.get('disableUpdateBtn');
  }
});
