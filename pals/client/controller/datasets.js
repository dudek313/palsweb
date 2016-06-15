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

Template.datasets.helpers({
   dataSets: function() {
     var source = Session.get('source');
     var selector = {};

     if( source ) {
         var user = Meteor.user();
         if( user ) {
             selector = {'experiments.workspace':user.profile.currentWorkspace._id};
         }
         else console.log('Error: User not logged in');
     }
     else {
          var workspaces = getAvailableWorkspaceIds();
          selector = { 'experiments.workspace': {$in:workspaces} }
     }

     var resolution = getCurrentSpatialLevel();
     if( resolution ) {
         selector.spatialLevel = resolution;
     }
     return DataSets.find(selector,{sort:{created:-1}});

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
