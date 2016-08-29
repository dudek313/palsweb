Template.modelOutput.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
    SimpleSchema.debug = true;
};

AutoForm.hooks({
    createModelOutput: {
/*      this will be called when submitting the form for uploading
        model outputs.
        insertDoc contains the values of the fields filled in on the form.
        The function also adds extra fields not included in the form, such
        as _version and owner.
*/
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            insertDoc._version = 1;
            insertDoc.owner = Meteor.user()._id;
            // tempFile contains the data about the uploaded file which needs
            // to be added to the model output document at submission time.
            insertDoc.file = Session.get('tempFile');
            insertDoc.benchmarks = getTempBenchmarks();
            insertDoc.experiments = [getExperimentId()];

            // insert model output document to the mongodb collection
            Meteor.call('insertModelOutput', insertDoc, function(error, docId){
                if(error) {
                    displayError('Failed to upload the model output. Please try again.', error);
                }
                else {
                    // if successful, display the created experiment
                    Meteor.subscribe('modelOutputs'); // Refresh the publication to allow user access to new model output
                    Router.go('/modelOutput/display/' + docId);
                }
            });

            this.done();
            return false;
        }
    },
    before: {
        normal: function(doc) {
            var self = this;
            var analysesToDelete = Session.get('analysesToDelete');

            if (analysesToDelete && analysesToDelete.length > 0) {
                new Confirmation({
                    message: "Are you sure that you want to delete the specified analysis/es?",
                    title: "Confirmation",
                    cancelText: "Cancel",
                    okText: "Ok",
                    success: true, // whether the button should be green or red
                    focus: "cancel" // which button to autofocus, "cancel" (default) or "ok", or "none"
                }, function (confirmed) {
                    if (confirmed) {
                        self.result(doc);
                    }
                    else {
                        self.result(false);
                    }
                });
            }
        }
    },
    updateModelOutput: {
        // this will be called upon submitting the form in update mode.
        // updateDoc contains the selector which will be used to update
        // fields in the document in the ModelOutputs collection
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
          // tempFile contains the data about the uploaded file which needs
          // to be added to the model output document at submission time.

            var analysesToDelete = Session.get('analysesToDelete');
            if (analysesToDelete && analysesToDelete.length > 0)
              confirmed = confirm('Are you sure you want to delete the specified analysis/es?\n(To undo the change, click Cancel at the bottom of the update page)');

            if (!analysesToDelete || analysesToDelete.length < 1 || confirmed) {

                updateDoc.$set.owner = Meteor.user()._id;

                tempFile = Session.get('tempFile');
                if (tempFile)
                    updateDoc.$set.file = Session.get('tempFile');

                tempBenchmarks = getTempBenchmarks();
                if (tempBenchmarks)
                    updateDoc.$set.benchmarks = tempBenchmarks;

                updateDoc.$set.experiments = [getExperimentId()];
                // update Model Outputs collection
                Meteor.call('updateModelOutput', currentDoc, updateDoc, function(error, docId){
                    if(error) {
                        window.scrollTo(0,0);
                        $('.error').html('Failed to update the data set. Please try again.');
                        $('.error').show();
                        console.log(error.reason);
                    }
                    else {
                        // if successful, display the updated model output document
                        Router.go('/modelOutput/display/' + currentDoc._id);
                    }
                });

                // remove deleted analysis files from Analyses collection
                analysesToDelete.forEach(function(analysisId) {
                    Meteor.call('deleteAnalysis', analysisId, function(error, docId) {
                        if (error) {
                            window.scrollTo(0,0);
                            $('.error').html('Failed to delete analysis (Id: ' + analysisId + ').');
                            $('.error').show();
                            console.log(error.reason);
                        }
                    });
                });

            }
            this.done();
            return false;
        }
    }
})

Template.modelOutput.events = {
    // returns to display mode if user pressed cancel during updating
    'click .cancel-update':function(event){
        event.preventDefault();
        Router.go('/modelOutput/display/' + getCurrentObjectId());
    },
    // returns to home page if user pressed cancel while creating model output
    'click .cancel-create':function(event){
        event.preventDefault();
        Router.go('/home')
    },
    // if user clicks update button while in display mode, moves to update mode
    'click .enable-update':function(event){
        var currentModelOutputId = getCurrentObjectId();
/*        var currentModelOutput = getCurrentModelOutput();
        if (currentModelOutput && currentModelOutput.file) {
            Session.set('tempFile', currentModelOutput.file);
        }
        if (currentModelOutput.benchmarks) {
            Session.set('tempBenchmarks', currentModelOutput.benchmarks);
        }*/
        Router.go('/modelOutput/update/' + currentModelOutputId);
    },
    // if user selects a new model output file to upload
    // Uses collection-fs package, which has been deprecated, but is still widely used
    'change .file-select':function(event, template){
        FS.Utility.eachFile(event, function(file) {
            file.type = 'modelOutput';
            file.modelOutputId = getCurrentObjectId();
            Files.insert(file, function (err, fileObj) {
                if(err) console.log(err);
                else {
                    var originalFilename = fileObj.name();
                    var name = 'files-' + fileObj._id + '-' + originalFilename;
                    var fileRecord = {
                        path: FILE_BUCKET+'/'+name,
                        size: fileObj.size(),
                        filename: originalFilename,
                        key: name,
                        created: new Date()
                    };
                    Session.set('tempFile', fileRecord);
                }
            });
        });
    },
    'click .delete-file':function(event) {
        event.preventDefault();
        if( confirm("Are you sure?")) {
            Session.set('tempFile', null);
        }
    },

// Not sure if this is needed ?
    'click .download-file':function(event, template){
        event.preventDefault();
    },
    'click #addBenchmark': function(event) {
        event.preventDefault();
        var currentBenchmarks = getTempBenchmarks();
        if (currentBenchmarks.length < 3) {
            var selected = $('select[name="addBenchmark"]').val();
            if( selected ) {
                var currentBenchmarks = getTempBenchmarks();
                currentBenchmarks.push(selected);
                Session.set('tempBenchmarks', currentBenchmarks);
            }
            else {
              window.scrollTo(0,0);
              $('.error').html('Error adding data set, please try again');
              $('.error').show();
            }
        }
        else {
            alert('This model output already has 3 benchmarks. Please remove at least one if you wish to add more.');
        }
    },
    'click .remove-benchmark': function(event) {
        event.preventDefault();
        var selectedMOId = $(event.target).attr('id');
        var currentBenchmarkIds = getTempBenchmarks();
        var newBenchmarkIds = [];
        if (currentBenchmarkIds && currentBenchmarkIds.length > 0) {
            currentBenchmarkIds.forEach(function(benchmarkId) {
                if (benchmarkId != selectedMOId)
                    newBenchmarkIds.push(benchmarkId);
            });
            Session.set('tempBenchmarks', newBenchmarkIds);
        }
        else {
            window.scrollTo(0,0);
            $('.error').html('Error removing benchmark, please try again');
            $('.error').show();
        }
    },
    'click .run-analysis':function(event) {
        var userId = Meteor.userId();
        var currentModelOutputId = getCurrentObjectId();
        var group = 'modelOutput: ' + currentModelOutputId;
        if( Roles.userIsInRole(userId, 'edit', group) ) {
//            var key = $(event.target).attr('id');
            Meteor.call('checkIfAnalyserOnline', function(error, online) {
              if (error)
                displayError('An error occurred. Analyser might not be currently functioning.', error);
              else if (!online)
                displayError('Analyser is not currently functioning. Please try again later.');
              else {
                Meteor.call('startAnalysis', currentModelOutputId,function(error,result){
                    if( error ) alert(error);
                    console.log(result);
                });
              }
          });
        }
    },
    'click .delete-analysis':function(event) {
        event.preventDefault();
        var selectedAnalysisId = $(event.target).attr('id');
        var currentAnalysisIds = Session.get('tempAnalyses');
        var newAnalysisIds = [];
        if (currentAnalysisIds && currentAnalysisIds.length > 0) {
            currentAnalysisIds.forEach(function(analysisId) {
                if (analysisId != selectedAnalysisId)
                    newAnalysisIds.push(analysisId);
            });
            Session.set('tempAnalyses', newAnalysisIds);
            // add current analysis to array of analyses to delete when submitting the form
            var analysesToDelete = Session.get('analysesToDelete');
            analysesToDelete.push(selectedAnalysisId);
            Session.set('analysesToDelete', analysesToDelete);
        }
        else {
            window.scrollTo(0,0);
            $('.error').html('Error removing analysis, please try again');
            $('.error').show();
        }
    },
};

function getTempBenchmarks() {
    tempBM = Session.get('tempBenchmarks');
    if (!tempBM) tempBM = [];
    return tempBM;
}
// returns the current experiment record from the mongodb collection
function getCurrentModelOutput() {
  if(Router.current().data && Router.current().data())
    return Router.current().data();
}

function getExperimentId() {
    expElement = document.getElementById("experimentId");
    if (expElement) {
        return expElement.options[expElement.selectedIndex].value;
    }
}

Template.modelOutput.helpers({
  // returns the model outputs to display for selection as benchmark.
  // excludes the current model output from the list, as well as those already
  // selected as benchmarks
  otherModelOutputs: function() {
    var usedMOIds = getTempBenchmarks();

    var currentMO = getCurrentModelOutput();
    if (currentMO) {
        usedMOIds.push(currentMO._id);
        var exp = currentMO.experiments[0];
        selector = {_id:{$nin:usedMOIds}, experiments:exp};
        return ModelOutputs.find(selector,{sort:{name:1}});
    }
  },
  // determines whether the current form is a create form or an update form
  formId: function() {
    var screenMode = getScreenMode();
    var formId = null;
    if(screenMode == 'create') formId = "createModelOutput";
    else if(screenMode == 'update') formId = "updateModelOutput";
    return formId;
  },
  // returns the model output file to display
  file: function() {
    var modelOutput = getCurrentModelOutput();
    if (modelOutput) {
        return modelOutput.file;
    }
  },
  tempFile: function() {
    var tempFile = Session.get('tempFile');
    return tempFile;
  },
  benchmarks: function() {
      var modelOutput = getCurrentModelOutput();
      if (modelOutput && modelOutput.benchmarks)
          return getDocsFromIds(modelOutput.benchmarks, ModelOutputs);
  },
  tempBenchmarks: function() {
    var tempBenchmarkIds = getTempBenchmarks();
    if (tempBenchmarkIds)
        return getDocsFromIds(tempBenchmarkIds, ModelOutputs);
  },
  experiment: function() {
    var modelOutput = getCurrentModelOutput();
    if (modelOutput && modelOutput.experiments) {
        var expId = modelOutput.experiments[0];
        if (expId) {
            exp = Experiments.findOne({_id:expId});
            if (exp)
                return exp;
        }
    }
  },
  experimentName: function() {
    var modelOutput = getCurrentModelOutput();
    if (modelOutput && modelOutput.experiments) {
        var expId = modelOutput.experiments[0];
        if (expId) {
            exp = Experiments.findOne({_id:expId});
            if (exp)
                return exp.name;
        }
    }

  },
  expOptions: function() {
    var currentWorkspaceId = getCurrentWorkspaceId();
    var exps;
    var expOptions = [];
    if (currentWorkspaceId) {
      exps = Experiments.find({recordType: 'instance', workspace: currentWorkspaceId}).fetch();
      if (exps) {
          exps.forEach(function(exp) {
              expOptions.push({label: exp.name, value: exp._id});
          });
      }
    }
    return expOptions;
  },
  // returns the list of possible experiments for selection on the create/update
  // pages after searching for all experiments in all workspaces available to the user.
  expList: function() {
      var userId = Meteor.userId();
      var workspaces = getAvailableWorkspaceIds(userId);
      var selector = {workspace: {$in:workspaces}, recordType: 'instance'};
      return Experiments.find(selector,{sort:{created:-1}}).fetch();

  },
  // returns the list of models to be displayed in the model dropdown menu field
  // on the create and update pages. For admin users, all models will be displayed.
  // For regular registered users, only their own models will be displayed.
  myModels: function() {
    var userId = Meteor.userId();
    var myModels = Models.find({owner:userId},{sort:{name:1}}).fetch();
    var modelOptions = [];
    if (myModels && myModels.length > 0) {
        myModels.forEach(function(model) {
            modelOptions.push({label: model.name, value: model._id});
        });
    }
    return modelOptions;
  },
  modelName: function() {
    var modelOutput = getCurrentModelOutput();
    if (modelOutput) {
        var modelId = modelOutput.model;
        if (modelId) {
            model = Models.findOne({_id:modelId});
            if (model)
                return model.name;
        }
    }
  },
  analyses: function() {
    var modelOutputId = getCurrentObjectId();
    if( modelOutputId ) {
      var an = Analyses.find({'modelOutput':modelOutputId}).fetch()
      return an;
    }
    else return;
    },
  tempAnalyses: function() {
    var analysisIds = Session.get('tempAnalyses');
    if (analysisIds)
        return getDocsFromIds(analysisIds, Analyses);
  }
});
