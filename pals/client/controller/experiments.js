Template.experiments.helpers({
   areEqual: function(firstString,secondString) {
       if( firstString === secondString ) {
           return true;
       }
   },
   experiments: function() {
     var source = Session.get('source');
     var selector = {};

     if( source ) {
         var user = Meteor.user();
         if( user ) {
             selector.workspace = user.profile.currentWorkspace._id;
             selector.recordType = 'instanceVersion';
         }
         else console.log('Error: User not logged in');
     }
     else {
          selector.recordType='template';
     }

     var resolution = Session.get('currentSpatialLevel');
     if( resolution ) {
         selector.spatialLevel = resolution;
     }
     return Experiments.find(selector,{sort:{created:-1}});
   },
   /*experiments: function() {
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
                console.log(id);
                Experiments.remove({'_id':id},function(error){
                    if(error) {
                        $('.error').html('Failed to delete the experiment, please try again');
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
        Router.go('/experiment/display/'+id);
    }
});
