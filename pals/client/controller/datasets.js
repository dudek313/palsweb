import '../views/datasets.html';
import '../lib/tableFields.js';

Template.dataSets.onCreated(function() {
  window['directives']();
  Meteor.subscribe('dataSets');
});

/*function dataSetFilters() {
  var source = getSource();
  var spatialLevel = getCurrentSpatialLevel();
  var filters = {};

  if (spatialLevel != "All")
    filters.spatialLevel = getCurrentSpatialLevel();

  var user = Meteor.user();
  if( source == 'workspace' && user ) {
    selector = {workspace: user.profile.currentWorkspace};
    var experiments = Experiments.find(selector);
    var dataSetIds = getMultipleExperimentDataSetIds(experiments);

    filters._id = {$in: dataSetIds};
  }
  console.log(filters);
  return filters;
}*/


Template.dataSets.events({
  'click input[name="spatialLevel"]' : function(event) {
    event.preventDefault();
    var spatialLevel = $("input[type='radio'][name='spatialLevel']:checked").val();
    Router.go('/dataSets/' + getSource() + '/' + spatialLevel);
  },
  'click .delete-btn' : function(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
    if( confirm("Are you sure?")) {
      var id = $(event.target).attr('id');
      if( id ) {
        Meteor.call('removeDataSet', {'_id':id},function(error){
          if(error) {
            displayError('Failed to delete the data set, please try again', error);
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
        Router.go('/dataSet/display/' + this._id);
  },

/*  'click tr' : function(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
    var id = $(event.target).parent().attr('id');
    Router.go('/dataSet/display/'+id);
  }*/

});


getExperimentDataSetIds = function(experiment) {
  var dataSets = experiment.dataSets;
  var dataSetIds = []
  dataSets.forEach(function(dataSet) {
    dataSetIds.push(dataSet._id);
  });
  return dataSetIds;
}

getMultipleExperimentDataSetIds = function(experiments) {
  var dataSetIds = [];
  experiments.forEach(function(experiment) {
    var dataSets = experiment.dataSets;
    currentExpDataSetIds = getIdsFromObjects(dataSets);
//    currentExpDataSetIds = getExperimentDataSetIds(experiment);
    currentExpDataSetIds.forEach(function(dataSetId) {
      if (dataSetIds.indexOf(dataSetId) == -1)
        dataSetIds.push(dataSetId);
    });
  });
  return dataSetIds;
}

variableList = function(dataSet) {
  var varList = "";
  if(dataSet.variables) {
    var variables = dataSet.variables;

    if(variables.NEE) varList += "NEE  ";
    if(variables.Qg) varList += "Qg  ";
    if(variables.Qh) varList += "Qh  ";
    if(variables.Qle) varList += "Qle  ";
    if(variables.RNet) varList += "Rnet  ";
    if(variables.SWnet) varList += "SWnet ";
  }
  return varList;
}

Template.dataSets.helpers({
  isChecked: function(buttonLevel) {
    var level = getCurrentSpatialLevel();
    return (level == buttonLevel) ? 'checked' : ''
  },
  dataSets: function() {
    var source = getSource();
    var selector = {};

    var resolution = getCurrentSpatialLevel();
    if( resolution != 'All' ) {
      selector.spatialLevel = resolution;
    }

    if( source == 'anywhere' ) {
      return DataSets.find(selector, {sort: {name:1}}).fetch();
    }
    else if( source == 'workspace' ) {
      var user = Meteor.user();
      if( user ) {
        selector.workspace = user.profile.currentWorkspace;
        var experiments = Experiments.find(selector);
        var dataSetIds = getMultipleExperimentDataSetIds(experiments);

        return DataSets.find({_id: {$in : dataSetIds}});

      }
    }

  },

  fields: function() {
    var currentSpatialLevel = getCurrentSpatialLevel();
    switch (currentSpatialLevel) {
      case "All":
      case "Global":
      case "MultipleSite":
        var fields = [ NAME_FIELD, SP_LEVEL_FIELD, RESOLUTION_FIELD, TIME_STEP_FIELD,
          VARIABLES_FIELD, OWNER_FIELD, VIEW_ANALYSES_FIELD ];
        break;

      case "SingleSite":
        var fields = [ NAME_FIELD, VEG_TYPE_FIELD, COUNTRY_FIELD, YEARS_FIELD,
          VARIABLES_FIELD, OWNER_FIELD, VIEW_ANALYSES_FIELD ];
        break;

      case "Catchment":
      case "Regional":
        var fields = [ NAME_FIELD, REGION_FIELD, SP_LEVEL_FIELD, RESOLUTION_FIELD,
          TIME_STEP_FIELD, VARIABLES_FIELD, VIEW_ANALYSES_FIELD ];
        break;
    }

    if (authorisedToEdit("dataSet"))
      fields.push(DELETE_FIELD);

    return fields;
  },

  currentSpatialLevel: function() {
    return getCurrentSpatialLevel();
  },
  source: function() {
    return getSource();
  },
  userEmail: function(userId) {
    var user = Meteor.users.findOne({'_id':userId});
    if( user && user.emails && user.emails.length > 0 ) {
      return Meteor.users.findOne({'_id':userId}).emails[0].address;
    }
    else return '';
  },
  variableList: function(dataSet) {
    var varList = "";
    if(dataSet.variables) {
      variables = dataSet.variables;

   if(variables.NEE) varList += "NEE  ";
   if(variables.Qg) varList += "Qg  ";
   if(variables.Qh) varList += "Qh  ";
   if(variables.Qle) varList += "Qle  ";
   if(variables.RNet) varList += "Rnet  ";
   if(variables.SWnet) varList += "SWnet ";
   }
   return varList;
   }
});
