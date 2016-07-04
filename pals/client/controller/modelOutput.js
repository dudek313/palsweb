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
            event.preventDefault();
            insertDoc._version = 1;
            insertDoc.owner = Meteor.user()._id;
            // tempFile contains the data about the uploaded file which needs
            // to be added to the model output document at submission time.
            insertDoc.file = Session.get('tempFile');
            insertDoc.experiments = [getExperimentId()];

            // insert model output document to the mongodb collection
            Meteor.call('insertModelOutput', insertDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to upload the model output. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    // if successful, display the created experiment
                    Router.go('/modelOutput/display/' + docId);
                }
            });

            this.done();
            return false;
        }
    },
    updateModelOutput: {
        // this will be called upon submitting the form in update mode.
        // updateDoc contains the selector which will be used to update
        // fields in the document in the ModelOutputs collection
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
          // tempFile contains the data about the uploaded file which needs
          // to be added to the model output document at submission time.
            updateDoc.$set.owner = Meteor.user()._id;
            tempFile = Session.get('tempFile');
            if (tempFile)
                updateDoc.$set.file = Session.get('tempFile');
            updateDoc.$set.experiments = [getExperimentId()];
            // update Model Outputs collection
            Meteor.call('updateModelOutput', currentDoc, updateDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to update the data set. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    // if successful, display the updated model output document
                    Router.go('/modelOutput/display/' + currentDoc._id);
                }
            });

            this.done();
            return false;
        }
    }
})

Template.modelOutput.events = {
    // returns to display mode if user pressed cancel during updating
    'click .cancel-update':function(event){
        event.preventDefault();
        Router.go('/modelOutput/display/' + getCurrentModelOutput()._id)
    },
    // returns to home page if user pressed cancel while creating model output
    'click .cancel-create':function(event){
        event.preventDefault();
        Router.go('/home')
    },
    // if user clicks update button while in display mode, moves to update mode
    'click .enable-update':function(event){
        var currentModelOutput = getCurrentModelOutput();
        if (currentModelOutput) {
            Session.set('tempFile', currentModelOutput.file);
            Router.go('/modelOutput/update/' + currentModelOutput._id);
        }
    },
    // if user selects a new model output file to upload
    // Uses collection-fs package, which has been deprecated, but is still widely used
    'change .file-select':function(event, template){
        FS.Utility.eachFile(event, function(file) {
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
    }
};

// returns the current experiment record from the mongodb collection
function getCurrentModelOutput() {
    return Router.current().data();
}

function getExperimentId() {
    expElement = document.getElementById("experimentId");
    if (expElement) {
        return expElement.options[expElement.selectedIndex].value;
    }
}


Template.modelOutput.helpers({
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
        console.log(modelOutput.file);
        return modelOutput.file;
    }
  },
  tempFile: function() {
    var tempFile = Session.get('tempFile');
    return tempFile;
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
      var workspaces = getAvailableWorkspaceIds();
      var selector = {workspace: {$in:workspaces}, recordType: 'instance'};
      return Experiments.find(selector,{sort:{created:-1}}).fetch();

/*    var selector = {recordType : 'instance'};
    if (getSource() == 'workspace') {
        var currentWorkspaceId = getCurrentWorkspaceId();
        if (currentWorkspaceId)
            selector.workspace = currentWorkspaceId;
        else {
            console.log('Error: Not currently in a workspace.');
            return;
        }
    }
    else // source is 'mine'
        selector.owner = Meteor.userId();

    return Experiments.find(selector).fetch();*/
  },
  // returns the list of models to be displayed in the model dropdown menu field
  // on the create and update pages. For admin users, all models will be displayed.
  // For regular registered users, only their own models will be displayed.
  myModels: function() {
    var user = Meteor.user();
    if (user && user.admin)
        var selector = {}
    else // regular registered user
        selector = {owner:Meteor.userId()};

    var myModels = Models.find(selector,{sort:{name:1}}).fetch();
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
  }
});



/*Template.modelOutput.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
};

getCurrentModelOutput = function() {
    return Router.current().params.id;
}

Template.modelOutput.modelOutput = function() {
    var currentModelOutputId = getCurrentModelOutput();
    var currentModelOutput = ModelOutputs.findOne({'_id':currentModelOutputId});
    if( currentModelOutput && currentModelOutput.experiment ) {
        currentModelOutput.experiment = Experiments.findOne({_id:currentModelOutput.experiment});
    }
    if( currentModelOutput && currentModelOutput.model ) {
        currentModelOutput.model = Models.findOne({_id:currentModelOutput.model});
    }
    return currentModelOutput;
}

Template.modelOutput.update = function(event) {
    var fieldName = $(event.target).attr('name');
    var value = $(event.target).val();
    Template.modelOutput.performUpdate(fieldName,value);
};

Template.modelOutput.reference = function() {
    var reference = Reference.findOne();
    return reference;
};

Template.modelOutput.performUpdate = function(fieldName,value) {
    if( value ) {

        var user = Meteor.user();
        currentModelOutputId = getCurrentModelOutput();
        var reference = Template.modelOutput.reference();

        if( currentModelOutputId ) {

            if( value == 'n/a' ) value = null;

            var selector = {'_id':currentModelOutputId};
            var fieldModifier = {};
            fieldModifier[fieldName] = value;
            var modifier = {'$set':fieldModifier};
            ModelOutputs.update(selector,modifier,function(error){
                if( error ) {
                    $('.error').html('There was an error saving the field, please try again');
                    $('.error').show();
                }
            });
        }
        else {
            currentModelOutput = {
                'owner' : user._id,
                'created' : new Date(),
                'workspaces' : [user.profile.currentWorkspace._id]
            };
            if( fieldName != 'stateSelection' ) currentModelOutput.stateSelection = reference.stateSelection[0];
            if( fieldName != 'parameterSelection' ) currentModelOutput.parameterSelection = reference.parameterSelection[0];
            var experiments = Template.modelOutput.experiments();
            currentModelOutput[fieldName] = value;
            ModelOutputs.insert(currentModelOutput,function(error,id) {
                if( error ) {
                    if( error.error == 409 ) $('.error').html('A model output with that name already exists');
                    else $('.error').html('There was an error saving your value, please try again');
                    $('.error').show();
                }
                else {
                    currentModelOutput._id = id;
                    Session.set('currentModelOutput',id);
                }
            });
        }
    }
};

Template.modelOutput.events({
    'blur input': function (event) {
        Template.modelOutput.update(event);
    },
    'blur textarea': function (event) {
        Template.modelOutput.update(event);
    },
    'blur select':function(event) {
        Template.modelOutput.update(event);
    },

    'click .display':function(event) {
        if( Template.modelOutput.owner() ) {
            $(event.target).next('.modifier').show();
            $(event.target).hide();
        }
    },

    'change select':function(event) {
        Template.modelOutput.update(event);
    },
    'click .delete-version':function(event) {
        if( confirm("Are you sure?")) {
            if( Template.modelOutput.owner() ) {
                var key = $(event.target).attr('id');

                var currentModelOutput = Template.modelOutput.modelOutput();
                if( currentModelOutput.versions ) {
                    var currentVersion = undefined;
                    currentModelOutput.versions.forEach(function(version) {
                        if( version.key == key ) {
                            currentVersion = version;
                        }
                    });
                    if( currentVersion ) {
                        ModelOutputs.update({'_id':currentModelOutput._id},
                            {$pull : {'versions':{ 'key':key }}}, function(error) {
                                if( error ) {
                                    $('.error').html('Failed to delete version, please try again');
                                    $('.error').show();
                                }
                            }
                        );

                        Files.remove({_id:currentVersion.fileObjId},function(err){
                           if(err) console.log(err);
                        });
                    }
                }
            }
        }
    },
    'click .start-analysis':function(event) {
        if( Template.modelOutput.owner() ) {
            var key = $(event.target).attr('id');
            var currentModelOutputId = getCurrentModelOutput();
            Meteor.call('startAnalysis',key,currentModelOutputId,function(error,result){
                if( error ) alert(error);
                console.log(result);
            });
        }
    },
    'click .delete-analysis':function(event) {
        console.log('deleting analysis');
        if( confirm("Are you sure?")) {
            if( Template.modelOutput.owner() ) {
                var id = $(event.target).attr('id');
                Meteor.call('deleteAnalysis',id,function(error,result){
                    if( error ) alert(error);
                });
            }
        }
    },
    // 'change .file-select': function(event, template){
    //     var file = event.target.files[0];
    //     var reader = new FileReader();
    //     var currentModelOutputId = getCurrentModelOutput();
    //     if( !currentModelOutputId ) {
    //         alert("Please enter a model output name before uploading files");
    //         return;
    //     }
    //     var progress = templateSharedObjects.progress();
    //     progress.showProgress();
    //     reader.onload = function(fileLoadEvent) {
    //         Meteor.call('uploadModelOutput', currentModelOutputId, file.name, file.size, reader.result);
    //     };
    //     reader.onprogress = progress.readerProgress;
    //     reader.readAsBinaryString(file);
    // },
    'change .file-select': function(event, template){

        var currentModelOutputId = getCurrentModelOutput();
        if( !currentModelOutputId ) {
            alert("Please enter a model output name before uploading files");
            return;
        }

        FS.Utility.eachFile(event, function(file) {
            Files.insert(file, function (err, fileObj) {
                if(err) console.log(err);
                else {
                    var originalFilename = fileObj.name();
                    var name = 'files-' + fileObj._id + '-' + originalFilename;

                    var fileRecord = {
                        path: FILE_BUCKET+'/'+name,
                        filename: originalFilename,
                        size: fileObj.size(),
                        key: name,
                        fileObjId: fileObj._id,
                        created: new Date()
                    };
                    ModelOutputs.update({'_id':currentModelOutputId},
                        {'$push':{'versions':fileRecord}},function(error){
                            if( error ) {
                                console.log(error);
                                console.log('Failed to add uploaded model output version');
                            }
                    });
                }
            });
        });
    }
});

Template.modelOutput.experiments = function() {
    var user = Meteor.user();
    var experiments =  Experiments.find();
    if( experiments ) return experiments;
};

Template.modelOutput.models = function() {
    var user = Meteor.user();
    if( user ) {
        var selector = {
            'workspaces':user.profile.currentWorkspace._id,
            'owner':user._id
        }
    }
    else {
        selector = {};
    }
    return Models.find(selector);
};

Template.modelOutput.owner = function() {
    var user = Meteor.user();
    var modelOutput = Template.modelOutput.modelOutput();
    if( user && modelOutput ) {
        if( modelOutput.owner == user._id ) return true;
        else return false;
    }
    else {
        return true;
    }
};

Template.modelOutput.hasVersions = function() {
    var modelOutput = Template.modelOutput.modelOutput();
    if( modelOutput && modelOutput.versions && modelOutput.versions.length > 0 ) return true;
    else return false;
};

Template.modelOutput.analyses = function() {
   var modelOutput = Template.modelOutput.modelOutput();
   if( modelOutput && modelOutput._id ) {
       return Analyses.find({'modelOutput':modelOutput._id});
   }
   else return undefined;
};

Template.modelOutput.uploadDisabled = function() {
    var currentMO = Template.modelOutput.modelOutput();
    if( currentMO ) return '';
    else return 'disabled="disabled"';
}
*/
