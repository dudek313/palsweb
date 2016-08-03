Template.datasets.rendered = function() {
  window['directives']();
};


Template.datasets.events({
  'click input[name="spatialLevel"]' : function(event) {
    event.preventDefault();
    var spatialLevel = $("input[type='radio'][name='spatialLevel']:checked").val();
    Router.go('/dataSets/' + getSource() + '/' + spatialLevel);
  },
  'click .delete' : function(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
    if( confirm("Are you sure?")) {
      var id = $(event.target).attr('id');
      if( id ) {
        Meteor.call('removeDataSet', {'_id':id},function(error){
          if(error) {
            window.scrollTo(0,0);
            $('.error').html('Failed to delete the data set, please try again');
            $('.error').show();
          }
        });
      }
    }
  },
  'click tr' : function(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
    var id = $(event.target).parent().attr('id');
    Router.go('/dataset/display/'+id);
  }


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

        return getDocsFromIds(dataSetIds, DataSets);

      }
    }
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
