Template.modelOutputs.helpers({
  // finds model output data to populate the model outputs table
  modelOutputs : function() {
      var user = Meteor.user();
      var modelOutputs = [];
      if( user ) {

          var source = getSource();
          if (source == 'workspace') {  // Find model outputs in current workspace
              experiments = Experiments.find({workspace:user.profile.currentWorkspace._id, recordType:'instance'},{sort:{name:1}});

              var currentModelOutputs;
              if (experiments) {
                  experiments.forEach(function(currentExperiment){
                      currentModelOutputs = ModelOutputs.find({experiment:currentExperiment._id},{sort:{name:1}}).fetch();
                      Array.prototype.push.apply(modelOutputs, currentModelOutputs);
                  });
              }
          }
          else if (source == 'mine')  // Find my model outputs
              modelOutputs = ModelOutputs.find({owner:user._id}).fetch();

          // Find experiment name and owner's email for each model output
          modelOutputs.forEach(function(modelOutput){
              experiment = Experiments.findOne({_id:modelOutput.experiment});
              if (experiment) {
                  modelOutput.experimentName = experiment.name;
              }
              moOwner = Meteor.users.findOne({_id:modelOutput.owner});
              if (moOwner)
              modelOutput.ownerEmail = moOwner.emails[0].address;
          });
      }
      return modelOutputs;
  },
  source : function() {
    // returns the source of model outputs requested
    // either 'mine' or in current 'workspace'
      return getSource();
  }

});

Template.modelOutputs.events({
    'click .delete' : function(event) {
        var id = $(event.target).attr('id');
        if( id ) {
            if( confirm("Are you sure?")) {
                ModelOutputs.remove({'_id':id},function(error){
                    if(error) {
                        $('.error').html('Failed to delete the model output, please try again');
                        $('.error').show();
                    }
                });
            }
        }
    }
});
/*
          var modelOutputs;
          var modelOutputs = ModelOutputs.find({'workspaces':user.profile.currentWorkspace._id},
              {sort:{created:-1}}).fetch();
          if( modelOutputs )
          {
              modelOutputs.forEach(function(modelOutput){
                  if( modelOutput.owner ) {
                      modelOutput.owner =
                          Meteor.users.findOne({'_id':modelOutput.owner},{'_id':1,'name':1});
                      if( modelOutput.owner ) {
                          modelOutput.owner.email = modelOutput.owner.emails[0].address;
                      }
                  }
                  if( modelOutput.experiment ) modelOutput.experiment =
                      Experiments.findOne({'_id':modelOutput.experiment},{'_id':1,'name':1});
              });
          }
          return modelOutputs;
      }*/
