Template.datasets.onCreated(function() {
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


Template.datasets.events({
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
  }/*,
  'click tr' : function(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
    var id = $(event.target).parent().attr('id');
    Router.go('/dataset/display/'+id);
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

function variableList(dataset) {
  var varList = "";
  if(dataset.variables) {
    var variables = dataset.variables;

    if(variables.NEE) varList += "NEE  ";
    if(variables.Qg) varList += "Qg  ";
    if(variables.Qh) varList += "Qh  ";
    if(variables.Qle) varList += "Qle  ";
    if(variables.RNet) varList += "Rnet  ";
    if(variables.SWnet) varList += "SWnet ";
  }
  return varList;
}

Template.datasets.helpers({
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
        var fields = [ nameField, spLevelField, resolutionField, timeStepField,
          variablesField, ownerField, viewAnalysesField ];
        break;

      case "SingleSite":
        var fields = [ nameField, vegTypeField, countryField, yearsField,
          variablesField, ownerField, viewAnalysesField ];
        break;

      case "Catchment":
      case "Regional":
        var fields = [ nameField, regionField, spLevelField, resolutionField,
          timeStepField, variablesField, viewAnalysesField ];
        break;
    }

    if (authorisedToEdit("dataset"))
      fields.push(deleteField);

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
  variableList: function(dataset) {
    var varList = "";
    if(dataset.variables) {
      variables = dataset.variables;

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

const nameField = { fieldId: "1", key: 'name', label: 'Name' };
const spLevelField = { fieldId: "2", key: 'spatialLevel', label: 'Spatial Level' };
const resolutionField = { fieldId: "3", key: 'resolution', label: 'Resolution' };
const timeStepField = { fieldId: "4", key: 'timeStepSize', label: 'Time Step Size' };
const vegTypeField = { fieldId: "5", key: 'vegType', label: 'Vegetation Type' };
const regionField = { fieldId: "6", key: 'region', label: 'Region' };
const countryField = { fieldId: "7", key: 'country', label: 'Country' };
const yearsField = { fieldId: "8", key: 'years', label: 'Years' };

const variablesField = {
    fieldId: "9",
    key: 'variables',
    label: 'Variables',
    fn: function (value, object, key) {
      return variableList(object);
    }
};

// Fullname has been deprecated from the system. Will need to be updated.
const ownerField = {
    fieldId: "10",
    key: 'ownerName',
    label: "Owner",
    fn: function (value, object, key) {
      var selector = {_id: object.owner};
      var owner = Meteor.users.findOne(selector);
      if (owner && owner.profile) {
        if (owner.profile.fullname)
          var fullname = owner.profile.fullname;
        else if (owner.profile.firstName && owner.profile.lastName)
          var fullname = owner.profile.firstName + " " + owner.profile.lastName;
      }

      return fullname;
    }
};

const viewAnalysesField = {
    fieldId: "11",
    key: 'viewAnalyses',
    label: "View Analyses",
    fn: function (value, object, key) {   }
};

const deleteField = {
  fieldId: "12",
  key: 'delete',
  label: "Delete",
  fn: function (value, object, key) {
    return new Spacebars.SafeString(
      "<button class='btn delete-btn btn-danger btn-xs' id="+ object._id +">Delete</button>");
  }
}
