import '../views/models.html';

Template.models.onCreated(function() {
  Meteor.subscribe('models');

  // store current page in memory for next time
  var currentPage = new ReactiveVar(Session.get('current-models-page') || 0);
  this.currentPage = currentPage;
  this.autorun(function () {
    Session.set('current-models-page', currentPage.get());
  });

  var rowsPerPage = new ReactiveVar(Session.get('rows-per-models-page') || 10);
  this.rowsPerPage = rowsPerPage;
  this.autorun(function () {
    Session.set('rows-per-models-page', rowsPerPage.get());
  });

});


Template.models.events({
    'click .delete' : function(event) {
        if( confirm("Are you sure?")) {
            var id = $(event.target).attr('id');
            if( id ) {
                console.log(id);
                Meteor.call('removeModel', id, function(error){
                    if(error) {
                        displayError('Failed to delete the model, please try again');
                    }
                });
            }
        }
    },

    'click .reactive-table tbody tr': function (event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        if (event.target.className != 'btn delete-btn btn-danger btn-xs')
          Router.go('/model/display/' + this._id);
    }

});

getModelOutputsInWorkspace = function(ws) {
    var user = Meteor.user();
    if (ws)
        var expSelector = {workspace:ws};
    else {
        // get model outputs from all available workspaces
        var userId = Meteor.userId();
        var availableWorkspaceIds = getAvailableWorkspaceIds(userId);
        var expSelector = {workspace:{$in:availableWorkspaceIds}};
    }
    var exps = Experiments.find(expSelector).fetch();
    var expIds = getIdsFromObjects(exps);
    var modelOutputs = ModelOutputs.find({experiments: {$in: expIds}}).fetch();
    return modelOutputs;
}

getModelsFromModelOutputs = function(modelOutputs) {
    var modelIdArray = [];

    if (modelOutputs) {
        modelOutputs.forEach(function(modelOutput){
            var modelId = modelOutput.model;
            if (modelId && (modelIdArray.indexOf(modelId) == -1)) {
                modelIdArray.push(modelId);
            }
        });
    }
    return modelIdArray;
}

Template.models.helpers({
    pageTitle: function() {
        var source = getSource();
        if (source == 'mine')
            return "My Model Profiles";
        else if (source == 'workspace')
            return "Model Profiles in the Current Workspace";
        else if (source == 'anywhere')
            return "Model Profiles in All Available Workspaces";
        else {
          window.scrollTo(0,0);
          $('.error').html('An error occurred in displaying the page. Please try again.');
          $('.error').show();
        }
    },
    models: function() {
        var user = Meteor.user();

        var source = getSource();
        if (source == 'mine' && user)
            var models = Models.find({'owner':user._id});
        else if (source == 'workspace' || source == 'anywhere') {

           // select relevant modelOutputs and associated models
            var workspace = ((source == 'workspace') ? user.profile.currentWorkspace : null);
            var modelOutputs = getModelOutputsInWorkspace(workspace);
            var modelIds = getModelsFromModelOutputs(modelOutputs);
            var models = Models.find({_id : {$in : modelIds}});
        }
        else {
            window.scrollTo(0,0);
            $('.error').html('Unable to display models');
            $('.error').show();
            var models = [];
        }
        return models;

        // set model.owner to the owner's email
/*        if( models ) {
            models.forEach(function(model){
                if( model ) {
                    if( model.owner ) {
                        model.owner = Meteor.users.findOne({'_id':model.owner},{'_id':1,'name':1});
                        if( model.owner && model.owner.emails && model.owner.emails.length > 0) {
                            model.owner.email = model.owner.emails[0].address;
                        }
                    }
                }
            });

        return models;
            return models.sort(function(a,b) {
              x = a.name.toLowerCase();
              y = b.name.toLowerCase();
              return x < y ? -1 : x > y ? 1 : 0;
            });

        }
        else return null;
*/


    },

    fields: function() {
      fields = [ NAME_FIELD, OWNER_FIELD, DATE_FIELD, COMMENTS_FIELD, URL_FIELD ];

    if (authorisedToEdit("model"))
      fields.push(DELETE_FIELD);

      return fields;
    },

    tableSettings: function () {
      return {
        id: "saveModelsFilter",
        currentPage: Template.instance().currentPage,
        rowsPerPage: Template.instance().rowsPerPage
      };
    }

})
