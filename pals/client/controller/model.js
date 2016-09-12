Template.model.rendered = function() {
    window['directives']();
};

AutoForm.hooks({
    createModelForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
//            insertDoc._version = 1;
//            insertDoc.owner = Meteor.user()._id;
//            insertDoc.created = new Date();
            Meteor.call('insertModel', insertDoc, function(error, docId){
                if(error) {
                    window.scrollTo(0,0);
                    $('.error').html(error.error);
                    $('.error').show();
                    console.log(error);
                }
                else {  // if successful
                    Meteor.subscribe('models'); // Refresh publication of the models collection to ensure user has access to new model profile
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
                    window.scrollTo(0,0);
                    $('.error').html('Failed to update the model. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    var currentModelId = getCurrentObjectId();
                    Router.go('/model/display/' + currentModelId);
                }
            });

            this.done();
            return false;
        }
    }
})

function getCurrentModel() {
    var currentModelId = getCurrentObjectId();
    var currentModel = Models.findOne({'_id':currentModelId});
    return currentModel;
}

Template.model.events = {
    'click .cancel-update':function(event){
        event.preventDefault();
        Router.go('/model/display/' + getCurrentObjectId());
    },
    'click .cancel-create':function(event){
        event.preventDefault();
        window.history.back();
    },
    'click .enable-update':function(event){
        Router.go('/model/update/' + getCurrentObjectId());
    }
};

Template.model.helpers({
  formId: function() {
    var screenMode = getScreenMode();
    if(screenMode == 'create') return "createModelForm"
    else if(screenMode == 'update') return "updateModelForm"
    else return null;
  },
  dataIfNeeded: function() {
    var screenMode = getScreenMode();
    if(screenMode == 'create') return null
    else if(screenMode == 'update') return getCurrentModel()
    else return null;
  },
  formType: function() {
    var screenMode = getScreenMode();
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
  userFullName: function() {
    var userId = Meteor.userId();
    return getUserFullName(userId);
  },
  model: function() {
    var currentModel = getCurrentModel();
    currentModel.ownerName = getUserFullName(currentModel.owner);

    return currentModel;

  },
  updateBtnDisabled: function() {
    return Session.get('disableUpdateBtn');
  }
});
