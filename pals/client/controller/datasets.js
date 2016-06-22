Template.datasets.rendered = function() {
    window['directives']();
};

getCurrentSpatialLevel = function() {
    return Session.get('currentSpatialLevel');
}

Template.datasets.events({
    'click .delete' : function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        if( confirm("Are you sure?")) {
            var id = $(event.target).attr('id');
            if( id ) {
                console.log(id);
                DataSets.remove({'_id':id},function(error){
                    if(error) {
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
        currentExpDataSetIds = getExperimentDataSetIds(experiment);
        currentExpDataSetIds.forEach(function(dataSetId) {
            if (dataSetIds.indexOf(dataSetId) == -1)
                dataSetIds.push(dataSetId);
        });
    });
    return dataSetIds;
}

Template.datasets.helpers({
   dataSets: function() {
     var source = Session.get('source');
     var selector = {};

     if( source ) {
         var user = Meteor.user();
         if( user ) {
           selector.workspace = user.profile.currentWorkspace._id;
         }
         else console.log('Error: User not logged in');
     }
     else {
          var availableWorkspaces = getAvailableWorkspaceIds();
          selector.workspace = {$in:availableWorkspaces};
//          selector = { 'experiments.workspace': {$in:workspaces} }
     }

     var resolution = getCurrentSpatialLevel();
     if( resolution ) {
       selector.spatialLevel = resolution;
     }
     var experiments = Experiments.find(selector);
     var dataSetIds = getMultipleExperimentDataSetIds(experiments);

     return DataSets.find({_id:{$in:dataSetIds}});

   },
   currentSpatialLevel: function() {
      return Session.get('currentSpatialLevel');
   },
   source: function() {
      return Session.get('source');
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
