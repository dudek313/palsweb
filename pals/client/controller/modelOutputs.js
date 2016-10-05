Template.modelOutputs.onCreated(function() {
  Meteor.subscribe('modelOutputs');

  // store current page in memory for next time
  var currentPage = new ReactiveVar(Session.get('current-modelOutputs-page') || 0);
  this.currentPage = currentPage;
  this.autorun(function () {
    Session.set('current-modelOutputs-page', currentPage.get());
  });

  var rowsPerPage = new ReactiveVar(Session.get('rows-per-modelOutputs-page') || 10);
  this.rowsPerPage = rowsPerPage;
  this.autorun(function () {
    Session.set('rows-per-modelOutputs-page', rowsPerPage.get());
  });
});

Template.modelOutputs.helpers({
  // finds model output data to populate the model outputs table
  modelOutputs : function() {
      var user = Meteor.user();
      var modelOutputs = [];
      if( user ) {

          var source = getSource();

          // Finds model outputs in current workspace
          if (source == 'workspace') {
              experiments = Experiments.find({workspace:user.profile.currentWorkspace, recordType:'instance'},{sort:{name:1}});

              var currentModelOutputs;
              if (experiments) {
                  experiments.forEach(function(currentExperiment){
                      currentModelOutputs = ModelOutputs.find({experiments:currentExperiment._id},{sort:{name:1}}).fetch();
                      Array.prototype.push.apply(modelOutputs, currentModelOutputs);
                  });
              }
          }

          // Finds my model outputs
          else if (source == 'mine')
              modelOutputs = ModelOutputs.find({owner:user._id}, {sort:{name:1}}).fetch();

          // Adds experiment name and owner's email for each model output
/*          modelOutputs.forEach(function(modelOutput){
              if (modelOutput && modelOutput.experiments && modelOutput.experiments.length > 0) {
                  experiment = Experiments.findOne({_id:modelOutput.experiments[0]});
                  if (experiment) {
                      modelOutput.experimentName = experiment.name;
                  }
              }
              moOwner = Meteor.users.findOne({_id:modelOutput.owner});
              if (moOwner) {
                var profile = moOwner.profile;
                modelOutput.owner = profile.fullname; // fullname has been deprecated. should be removed
                if (!modelOutput.owner)
                  modelOutput.owner = profile.firstName + " " + profile.lastName;
              }
          });
*/
      }
      return modelOutputs;
  },

  fields: function() {
    var fields = [ NAME_FIELD, EXPERIMENT_NAME_FIELD, OWNER_FIELD ];

    if (authorisedToEdit("modelOutput"))
      fields.push(DELETE_FIELD);

    return fields;
  },

  source : function() {
    // returns the source of model outputs requested
    // either 'mine' or in current 'workspace'
      return getSource();
  },

  tableSettings: function () {
    return {
      id: "saveModelOutputsFilter",
      currentPage: Template.instance().currentPage,
      rowsPerPage: Template.instance().rowsPerPage
    };
  }

});

Template.modelOutputs.events({
    // deletes a model output from the model output list
    'click .delete' : function(event) {
        var id = $(event.target).attr('id');
        if( id ) {
            if( confirm("Are you sure?")) {
                Meteor.call('removeModelOutput', id, function(error){
                    if(error) {
                        displayError('Failed to delete the model output, please try again', error);
                    }
                });
            }
        }
    },

    'click .reactive-table tbody tr': function (event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        if (event.target.className == 'exp-link') {
          var experimentId = $(event.target).attr('id');
          Router.go('/experiment/display/' + experimentId)
        }
        else if (event.target.className != 'btn delete-btn btn-danger btn-xs') {
          Router.go('/modelOutput/display/' + this._id);
        }
    }

});


/*
          var modelOutputs;
          var modelOutputs = ModelOutputs.find({'workspaces':user.profile.currentWorkspace},
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
