Template.modelOutputs.helpers({
  modelOutputs : function() {
      var user = Meteor.user();
      var modelOutputs = [];
      if( user ) {

          var source = Session.get('source');
          if (source == 'workspace')
              experiments = Experiments.find({workspace:user.profile.currentWorkspace._id, recordType:'instance'},{sort:{name:1}});
          else if (source == 'mine')
              experiments = Experiments.find({owner:user._id, recordType:'instance'});
          else {
              console.log('Error: Model Output source is not set correctly.');
          }

          var currentModelOutputs;
          experiments.forEach(function(currentExperiment){
              currentModelOutputs = ModelOutputs.find({experiment:currentExperiment._id},{sort:{name:1}}).fetch();
              currentModelOutputs.forEach(function(modelOutput){
                  modelOutput.experimentName = currentExperiment.name;
                  moOwner = Meteor.users.findOne({_id:modelOutput.owner});
                  if (moOwner)
                      modelOutput.ownerEmail = moOwner.emails[0].address;
              });
              Array.prototype.push.apply(modelOutputs, currentModelOutputs);
          });
      }
      return modelOutputs;
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
