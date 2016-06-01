Template.models.models = function() {
    var user = Meteor.user();
    if( user ) {
      var selector = Session.get('selector');
      if (selector == 'mine')
          var models = Models.find({'owner':user._id}).fetch();
      else if (selector == 'workspace') {
      // looks for model profiles belonging to model outputs in the current workspace
          var models = [];
          var model_ids = [];
          var modelOutputs = ModelOutputs.find({'workspaces':user.profile.currentWorkspace._id}).fetch();
          modelOutputs.forEach(function(modelOutput){
              var modelId = modelOutput.model;
              if (model_ids.indexOf(modelId) == -1) {
                  var model = Models.findOne({_id:modelId});
                  models.push(model);
                  model_ids.push(modelId);
              }
          });
      }
      else {
          $('.error').html('Unable to display models');
          $('.error').show();
      }
    //        var models = Models.find({'workspaces':user.profile.currentWorkspace._id}).fetch();

        if( models )
        {
            models.forEach(function(model){
                if( model.owner ) {
                    model.owner = Meteor.users.findOne({'_id':model.owner},{'_id':1,'name':1});
                    if( model.owner && model.owner.emails && model.owner.emails.length > 0) {
                        model.owner.email = model.owner.emails[0].address;
                    }
                }
            });
        }
        return models;
    }
}

Template.models.events({
    'click .delete' : function(event) {
        if( confirm("Are you sure?")) {
            var id = $(event.target).attr('id');
            if( id ) {
                console.log(id);
                Models.remove({'_id':id},function(error){
                    if(error) {
                        $('.error').html('Failed to delete the model, please try again');
                        $('.error').show();
                    }
                });
            }
        }
    }
});

Template.models.helpers({
    pageTitle: function() {
        var selector = Session.get('selector');
        if (selector == 'mine')
            return "My Model Profiles";
        else if (selector == 'workspace')
            return "Model Profiles in the Current Workspace";
        else {
          $('.error').html('An error occurred in displaying the page. Please try again.');
          $('.error').show();
        }
    }
})
