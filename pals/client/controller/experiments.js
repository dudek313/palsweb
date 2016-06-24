Template.experiments.helpers({
   areEqual: function(firstString,secondString) {
       if( firstString === secondString ) {
           return true;
       }
   },
   experiments: function() {
     var source = Session.get('source');
     var selector = {};

     if( source == 'Workspace' ) {
         var user = Meteor.user();
         if( user ) {
             selector.workspace = user.profile.currentWorkspace._id;
             selector.recordType = 'instance';
         }
         else console.log('Error: User not logged in');
     }
     else if (source == 'Templates') {
          selector.recordType='template';
     }
     else if (source == 'Anywhere') {
          workspaces = getAvailableWorkspaceIds();
          selector.workspace = {$in:workspaces};
          selector.recordType = 'instance';
     }

     var resolution = Session.get('currentSpatialLevel');
     if( resolution ) {
         selector.spatialLevel = resolution;
     }
     return Experiments.find(selector,{sort:{created:-1}});
   },
   notCloned: function(experimentId) {
     var selector = {templateId:experimentId};
     selector.recordType = 'instance';
     selector.workspace = Meteor.user().profile.currentWorkspace._id;
     return (Experiments.find(selector).fetch().length > 0) ? false : true;
   },
   source: function() {
       return Session.get('source');
   },
   currentSpatialLevel: function() {
       return Session.get('currentSpatialLevel');
   },
   analysesExist: function(analysisId) {
      return (Analyses.findOne({'_id':analysisId})) ? true : false;

   }
});


Template.experiments.events({
    'click .delete' : function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        if( confirm("Are you sure?")) {
            var id = $(event.target).attr('id');
            if( id ) {
                Meteor.call('deleteExperiment', {'_id':id}, function(error){
                    if(error) {
                        $('.error').html('Failed to delete the experiment, please try again');
                        $('.error').show();
                        console.log(error.reason);
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
        Router.go('/experiment/display/'+id);
    },
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
            newExpInstance.workspace = Meteor.user().profile.currentWorkspace._id;
            newExpInstance.templateVersion = newExpInstance._version;
            if (newExpInstance.dataSets && newExpInstance.dataSets.length > 0) {
                newExpInstance.dataSets.forEach(function(dataset){
                    dataset._version = getDataSetVersion(dataset._id);
                });
            }
            else console.log("Experiment doesn't have datasets");
            Meteor.call('insertExperiment', newExpInstance, function(error,docId){
                if (error) {
                    $('.error').html('Failed to clone the experiment, please try again');
                    $('.error').show();
                    console.log(error.reason);
                }
                else console.log('Created experiment: ' + docId);
            });
        }
    }
});


/*helpers
experiments: function() {
    var user = Meteor.user();
    if( user ) {
      var selector = {};
      var source = Session.get('source');
      // if the source is from the current workspace
      if( source ) {
        selector = {'workspaces':user.profile.currentWorkspace._id};
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
