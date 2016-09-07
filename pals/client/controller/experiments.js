Template.experiments.onCreated(function() {
  Meteor.subscribe('experiments');
});

Template.experiments.helpers({
  isChecked: function(buttonLevel) {
    var level = getCurrentSpatialLevel();
    return (level == buttonLevel) ? 'checked' : ''
  },

  experiments: function() {
    var source = getSource();
    var selector = {};

    if( source == 'workspace' ) {
        var user = Meteor.user();
        if( user ) {
            selector.workspace = user.profile.currentWorkspace;
            selector.recordType = 'instance';
        }
        else selector.recordType = ' '; // not logged in, find should return empty
    }
    else if (source == 'templates') {
      selector.recordType='template';
    }
    else if (source == 'anywhere') {
      userId = Meteor.userId();
      workspaces = getAvailableWorkspaceIds(userId);
      selector.workspace = {$in:workspaces};
      selector.recordType = 'instance';
    }

    var resolution = getCurrentSpatialLevel();
    if( resolution != 'All' ) {
        selector.spatialLevel = resolution;
    }

    return Experiments.find(selector,{sort:{name:1}});
  },

  fields: function() {
    var currentSpatialLevel = getCurrentSpatialLevel();
    switch (currentSpatialLevel) {
      case "All":
      case "Global":
      case "MultipleSite":
        var fields = [ NAME_FIELD, SP_LEVEL_FIELD, RESOLUTION_FIELD, TIME_STEP_FIELD,
          OWNER_FIELD, VIEW_ANALYSES_FIELD ];
        break;

      case "SingleSite":
        var fields = [ NAME_FIELD, VEG_TYPE_FIELD, COUNTRY_FIELD, YEARS_FIELD,
          OWNER_FIELD, VIEW_ANALYSES_FIELD ];
        break;

      case "Catchment":
      case "Regional":
        var fields = [ NAME_FIELD, REGION_FIELD, SP_LEVEL_FIELD, RESOLUTION_FIELD,
          TIME_STEP_FIELD, VIEW_ANALYSES_FIELD ];
        break;
    }

    var source = getSource();

    if (source == "templates")
      fields.push(CLONE_FIELD);

    if (authorisedToEdit("experiment"))
      fields.push(DELETE_FIELD);

    return fields;
  },

  workspaceName: function(workspaceId) {
    var ws = Workspaces.findOne({_id: workspaceId});
    if (ws && ws.name) return ws.name;
  },

  notCloned: function(experimentId) {
    var selector = {templateId:experimentId};
    selector.recordType = 'instance';
    var user = Meteor.user();
    if( user ) {
      selector.workspace = user.profile.currentWorkspace;
      return (Experiments.find(selector).fetch().length > 0) ? false : true;
    }
    else return null;
  },
  source: function() {
    return getSource();
  },
  currentSpatialLevel: function() {
    return getCurrentSpatialLevel();
  },
  analysesExist: function(analysisId) {
    return (Analyses.findOne({'_id':analysisId})) ? true : false;

  }
});


Template.experiments.events({
    'click input[name="spatialLevel"]' : function(event) {
        event.preventDefault();
        var spatialLevel = $("input[type='radio'][name='spatialLevel']:checked").val();
        Router.go('/experiments/' + getSource() + '/' + spatialLevel);
    },
    'click .delete' : function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        if( confirm("Are you sure?")) {
            var id = $(event.target).attr('id');
            if( id ) {
                Meteor.call('deleteExperiment', {'_id':id}, function(error){
                    if(error) {
                        window.scrollTo(0,0);
                        $('.error').html('Failed to delete the experiment, please try again');
                        $('.error').show();
                        console.log(error.reason);
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
          Router.go('/experiment/display/' + this._id);
    },

     /*
    'click tr' : function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        var id = $(event.target).parent().attr('id');
        Router.go('/experiment/display/'+id);
    },*/
    'click .clone-exp' : function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        var id = $(event.target).attr('id');
        console.log(id);
        if (id) {
            var thisExperiment = Experiments.findOne({_id: id});
            var newExpInstance = jQuery.extend({}, thisExperiment);
            delete newExpInstance._id;
            newExpInstance.recordType = 'instance';
            newExpInstance.templateId = id;
            newExpInstance.workspace = Meteor.user().profile.currentWorkspace;
            newExpInstance.templateVersion = newExpInstance._version;
            if (newExpInstance.dataSets && newExpInstance.dataSets.length > 0) {
                newExpInstance.dataSets.forEach(function(dataSet){
                    dataSet._version = getDataSetVersion(dataSet._id);
                });
            }
            else console.log("Experiment doesn't have dataSets");
            Meteor.call('insertExperiment', newExpInstance, function(error,docId){
                if (error) {
                    window.scrollTo(0,0);
                    $('.error').html('Failed to clone the experiment, please try again');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                  // if successful, refresh the publication to ensure the user has access to the new experiment document
                  Meteor.subscribe('experiments');
                  console.log('Created experiment: ' + docId);
                }
            });
        }
    }
});

notCloned = function (experimentId) {
    var selector = { templateId:experimentId };
    selector.recordType = 'instance';
    var user = Meteor.user();
    if( user ) {
      selector.workspace = user.profile.currentWorkspace;
      return (Experiments.find(selector).fetch().length > 0) ? false : true;
    }
    else return null;
}


/*helpers
experiments: function() {
    var user = Meteor.user();
    if( user ) {
      var selector = {};
      var source = Session.get('source');
      // if the source is from the current workspace
      if( source ) {
        selector = {'workspaces':user.profile.currentWorkspace};
      }
      selector.recordType='template';
      //selector.$where = 'this.latest == true';

      var resolution = Session.get('currentSpatialLevel');
      if( resolution ) {
          selector.spatialLevel = resolution;
      }
      return Experiments.find(selector,{sort:{created:-1}});
    }
},*/
