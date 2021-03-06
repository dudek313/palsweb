Template.experiment.rendered = function() {
  window['directives']();
  templateSharedObjects.progress().hide();
};

Template.experiment.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
});

AutoForm.hooks({
  createExperimentForm: {
/*    this will only be called when creating experiment templates, not active experiments.
    insertDoc contains the values of the fields filled in on the form.
    This function also adds extra fields not included in the form, e.g. _version, owner and recordType.

    tempScripts and tempDataSets contain the data about the sets of to be added to the experiment document at submission time.
*/

    onSubmit: function(insertDoc, updateDoc, currentDoc) {
      if(Experiments.findOne({name: insertDoc.name})) {
        displayError('An experiment template with this name already exists');
      }

//      insertDoc._version = 1;
//      insertDoc.owner = Meteor.user()._id;
      insertDoc.scripts = Session.get('tempScripts');
      insertDoc.recordType = 'template';
      var currentDataSets = Session.get('tempDataSets');
      // for each data set added, need to format as id and version number
      insertDoc.dataSets = [];
      if (currentDataSets && currentDataSets.length > 0) {
        currentDataSets.forEach(function(dataSet) {
          var dataSetDetails = {
            _id : dataSet._id,
            _version : null //  experiment templates don't need data set version
                    //  numbers, as the most recent version will be used when cloned.
          };
          insertDoc.dataSets.push(dataSetDetails);
        })
      }
      // insert experiment document to the mongodb collection
      Meteor.call('insertExperiment', insertDoc, function(error, docId){
        if(error) {
          displayError('Error: Failed to create the experiment', error);
        }
        else {
          // if successful, refresh the publication to ensure the user has access to the new experiment document
          // then display the new document
          Meteor.subscribe('experiments');
          Router.go('/experiment/display/' + docId);
        }
      });

      this.done();
      return false;
    }
  },
  updateExperimentForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {
      if (Session.get('tempScripts').length == 0) {
        displayError('At least one analysis script must be uploaded');
      }
      else if (Session.get('tempDataSets').length == 0) {
        displayError('At least one data set must be provided');
      }
      else {
        updateDoc.$set.scripts = Session.get('tempScripts');
        var currentDataSets = Session.get('tempDataSets');
        updateDoc.$set.dataSets = [];
        var recordType = getRecordType();
        if (recordType != 'template' && recordType != 'instance') {
          window.scrollTo(0,0);
          $('.error').html('Error: Failed to update the data set');
          $('.error').show();
        }
        else {
          // add version number to the data set details, if relevant.
          // Templates don't need data set version numbers,
          // but active experiments ("instances") do.
          if (currentDataSets && currentDataSets.length > 0) {
            currentDataSets.forEach(function(dataSet) {
              var dataSetDetails = {
                _id : dataSet._id,
                _version : (recordType == 'template') ? null : dataSet._version
              };
              updateDoc.$set.dataSets.push(dataSetDetails);
            });
          }
        }

        // update experiment collection
        Meteor.call('updateExperiment', currentDoc, updateDoc, function(error, docId){
          if(error) {
            displayError('Error: Failed to update the experiment. ', error);
          }
          else {
            // if successful, display the updated experiment document
            Router.go('/experiment/display/' + currentDoc._id);
          }
        });
      }
      this.done();
      return false;
    }

  }
})

Template.experiment.events = {
  // when user clicks cancel during update experiment, returns them to display mode
  'click .cancel-update':function(event){
    event.preventDefault();
    Router.go('/experiment/display/' + getCurrentExperiment()._id)
  },
  // when user clicks cancel while creating experiment, returns them to home page
  'click .cancel-create':function(event){
    event.preventDefault();
    window.history.back();
  },
  // when user clicks on delete script button,
  //removes script from the tempScripts session variable
  'click .delete-script':function(event) {
    event.preventDefault();
    var key = $(event.target).attr('id');
    var tempScripts = Session.get('tempScripts');
    var newScripts = [];
    tempScripts.forEach(function(script) {
      if (script.key != key)
        newScripts.push(script);
    });
    Session.set('tempScripts', newScripts);
  },

  // when user clicks on update experiment button,
  // changes from display mode to update mode
  'click .enable-update':function(event){
    // store current experiment scripts and data sets in session variables
    // to be updated without making the changes permanent
    var currentExperiment = getCurrentExperiment();
    Router.go('/experiment/update/' + currentExperiment._id);
  },

  'click #add-data-set':function(event) {
    event.preventDefault();
    var selected = $('select[name="addDataSet"]').val();
    if( selected ) {
      var currentDataSets = Session.get('tempDataSets');
      if (currentDataSets) {
        var currentVersion = getDataSetVersion(selected);
        dataSetDetails = {_id: selected, _version: currentVersion};
        currentDataSets.push(dataSetDetails);
        Session.set('tempDataSets', currentDataSets);
      }
      else {
        window.scrollTo(0,0);
        $('.error').html('Error adding data set, please try again');
        $('.error').show();
      }

    }
  },
  // removes a selected dataSet from the tempDataSets session variable,
  // thereby removing it from display on the update page
  'click .remove-dataSet':function(event) {
    event.preventDefault();
    var selectedDataSetId = $(event.target).attr('id');
    var currentDataSets = Session.get('tempDataSets');
    var newDataSetIds = [];
    if (currentDataSets && currentDataSets.length > 0) {
      currentDataSets.forEach(function(currentDataSet) {
        if (currentDataSet._id != selectedDataSetId)
          newDataSetIds.push(currentDataSet);
      });
      Session.set('tempDataSets', newDataSetIds);
    }
    else {
      window.scrollTo(0,0);
      $('.error').html('Error removing data set, please try again');
      $('.error').show();
    }
  },
  'click .clone' : function(event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
    var newExpInstance = getCurrentExperiment();
    newExpInstance.templateId = newExpInstance._id;
    delete newExpInstance._id;
    newExpInstance.recordType = 'instance';
    newExpInstance.workspace = Meteor.user().profile.currentWorkspace;
    newExpInstance.templateVersion = newExpInstance._version;
    if (newExpInstance.dataSets && newExpInstance.dataSets.length > 0) {
      newExpInstance.dataSets.forEach(function(dataSet){
        dataSet._version = getDataSetVersion(dataSet._id);
      });
    }
    else console.log("Experiment doesn't have data sets");
    Meteor.call('insertExperiment', newExpInstance, function(error,docId){
      if (error) {
        window.scrollTo(0,0);
        $('.error').html('Failed to clone the experiment, please try again');
        $('.error').show();
        console.log(error.reason);
      }
      else console.log('Created experiment: ' + docId);
    });

  }

};


// returns the record type of the current experiment,
// whether it is an experiment template or an instance (active experiment)
function getRecordType() {
  var experiment = getCurrentExperiment();
  if (experiment)
    return experiment.recordType;
  else {
    return null;
  }
}

// returns the current experiment record from the mongodb collection
function getCurrentExperiment() {
  if(Router.current().data && Router.current().data())
    return Router.current().data();
}

Template.experiment.helpers({
  // determines whether the current form is a create form or an update form
  formId: function() {
    var screenMode = getScreenMode();
    var formId = null;
    if(screenMode == 'create') formId = "createExperimentForm";
    else if(screenMode == 'update') formId = "updateExperimentForm";
    return formId;
  },
  // determines whether current experiment has already been cloned into the current workspace
  notCloned: function() {
    var template = getCurrentExperiment();
    if (template) {
      var selector = {templateId: template._id};
      selector.recordType = 'instance';
      selector.workspace = Meteor.user().profile.currentWorkspace;
      return (Experiments.find(selector).fetch().length > 0) ? false : true;
    }
  },
  // returns the data sets used by the current experiment
  dataSets: function() {
    var exp = getCurrentExperiment();
    if( exp && exp.dataSets && exp.dataSets.length > 0) {
      exp.dataSets.forEach(function(dataSet){
      dataSet.name = DataSets.findOne({_id: dataSet._id}).name;
    });
    return exp.dataSets;

  }
  else return [];
  },
  // returns the details of the scripts currently uploaded
  tempScripts: function() {
    return Session.get('tempScripts');
  },
  // identifies data sets not yet associated with this experiment
  // that can now be associated with it
  otherDataSets: function() {
    var currentDataSets = Session.get('tempDataSets');
    var currentDataSetIds = getIdsFromObjects(currentDataSets);
    selector = {_id:{$nin:currentDataSetIds}};
    return DataSets.find(selector,{sort:{name:1}});
  },
  // determines the record type of the current experiment
  recordType: function() {
    return getRecordType();
  },
  // returns an array with the names of the data sets currently
  // associated with the current experiment in create or update mode
  tempDataSets: function() {
    var tempDataSets = Session.get('tempDataSets');
    if( tempDataSets && tempDataSets.length > 0) {
      tempDataSets.forEach(function(dataSet){
      dataSet.name = DataSets.findOne({_id: dataSet._id}).name;
      });
      return tempDataSets;
    }
    else return [];
  },
  modelOutputs: function() {
    return getModelOutputs();
  },
  workspaceName: function() {
    var name = '';
    var screenMode = getScreenMode();
    if (screenMode == 'create') {
      currentWS = getCurrentWorkspace();
      if (currentWS && currentWS.name)
        name = currentWS.name;
    }
    else {
      var currentExperiment = getCurrentExperiment();
      if( currentExperiment ) {
        var wsId = currentExperiment.workspace;
        if( wsId ) {
          var ws = Workspaces.findOne({_id: wsId});
          if( ws ) {
            name = ws.name;
          }
        }
      }
    }
    return name;
  }
});

// returns the model outputs associated with the current experiment
function getModelOutputs() {
  currentExperiment = getCurrentExperiment();
  if( currentExperiment ) {
    var selector = {'experiments':currentExperiment._id};
    return  ModelOutputs.find(selector,{sort:{created:-1}}).fetch();
  }
}
