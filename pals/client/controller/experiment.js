Template.experiment.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
//    Session.set('uploadButtonClicked', false);
    SimpleSchema.debug = true;
};

AutoForm.hooks({
    createExperimentForm: {
/*      this will only be called when creating experiment templates,
        not active experiments.
        insertDoc contains the values of the fields filled in on the form.
        This function also adds extra fields not included in the form,
        e.g. _version, owner and recordType.

        tempScripts and tempDataSets contain the data about the sets of
        scripts and data sets that have been selected, and these need
        to be added to the experiment document at submission time.
*/

        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            event.preventDefault();
            insertDoc._version = 1;
            insertDoc.owner = Meteor.user()._id;
            insertDoc.scripts = Session.get('tempScripts');
//            insertDoc.modelOutputs = Session.get('tempModelOutputs');
            insertDoc.recordType = 'template';
            var currentDataSets = Session.get('tempDataSets');
            // for each data set added, need to format as id and version number
            insertDoc.dataSets = [];
            currentDataSets.forEach(function(dataSet) {
                var dataSetDetails = {
                    _id : dataSet._id,
                    _version : null //  experiment templates don't need data set version
                                    //  numbers, as the most recent version will be used when cloned.
                };
                insertDoc.dataSets.push(dataSetDetails);
            })
            // insert experiment document to the mongodb collection
            Meteor.call('insertExperiment', insertDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to create the experiment. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    // if successful, display the created experiment
                    Router.go('/experiment/display/' + docId);
                }
            });

            this.done();
            return false;
        }
    },
    updateExperimentForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            updateDoc.$set.scripts = Session.get('tempScripts');
//            updateDoc.$set.modelOutputs = Session.get('tempModelOutputs');
            var currentDataSets = Session.get('tempDataSets');
            updateDoc.$set.dataSets = [];
            var recordType = getRecordType();
            if (recordType != 'template' && recordType != 'instance') {
              $('.error').html('Failed to update the data set. Please try again.');
              $('.error').show();
            }
            else {
                // add version number to the data set details, if relevant.
                // Templates don't need data set version numbers,
                // but active experiments ("instances") do.
                currentDataSets.forEach(function(dataSet) {
                    var dataSetDetails = {
                        _id : dataSet._id,
                        _version : (recordType == 'template') ? null : dataSet._version
                    };
                    updateDoc.$set.dataSets.push(dataSetDetails);
                });
            }
            // update experiment collection
            Meteor.call('updateExperiment', currentDoc, updateDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to update the data set. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    // if successful, display the updated experiment document
                    Router.go('/experiment/display/' + currentDoc._id);
                }
            });

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
        Router.go('/home')
    },
    // when user clicks on delete script button,
    //removes script from the tempScripts session variable
    'click .delete-script':function(event) {
        event.preventDefault();
        if( Meteor.user().admin ) {
            var key = $(event.target).attr('id');
            var tempScripts = Session.get('tempScripts');
            var newScripts = [];
            tempScripts.forEach(function(script) {
                if (script.key != key)
                    newScripts.push(script);
            });
            Session.set('tempScripts', newScripts);

        }
    },
    // when user clicks on update experiment button,
    // changes from display mode to update mode
    'click .enable-update':function(event){
        // store current experiment scripts and data sets in session variables
        // to be updated without making the changes permanent
        var currentExperiment = getCurrentExperiment();
        Session.set('tempScripts', currentExperiment.scripts);
        Session.set('tempDataSets', currentExperiment.dataSets);
//        Session.set('tempModelOutputs', currentExperiment.modelOutputs);
        Router.go('/experiment/update/' + currentExperiment._id);
    },
    // uploads script files after selection
    'change .file-select':function(event, template){
//        var CurrentExperimentId = getCurrentExperiment()._id;
        FS.Utility.eachFile(event, function(file) {
            Files.insert(file, function (err, fileObj) {
                if(err) console.log(err);
                else {
                    var originalFilename = fileObj.name();
                    var name = 'files-' + fileObj._id + '-' + originalFilename;
                    var fileRecord = {
                        path: FILE_BUCKET+'/'+name,
                        filename: originalFilename,
                        key: name,
                    };
                    var tempScripts = Session.get('tempScripts');
                    tempScripts.push(fileRecord);
                    Session.set('tempScripts', tempScripts);
                }
            });
        });
    },
/*
    'click .download-file':function(event, template){
        event.preventDefault();
    },*/
    // when a user selects a data set to add (in update mode), this function
    // adds the id and latest version number of the data set to the
    // tempDataSets session variable, causing it to display on the update screen
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
              $('.error').html('Error adding data set, please try again');
              $('.error').show();
            }

        }
    },
    // removes a selected dataset from the tempDataSets session variable,
    // thereby removing it from display on the update page
    'click .remove-dataset':function(event) {
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
            $('.error').html('Error removing data set, please try again');
            $('.error').show();
        }
    },
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
    var currentDataSetIds = [];
    if (currentDataSets) {
      currentDataSets.forEach(function(dataSet){
        currentDataSetIds.push(dataSet._id);
      });
    }
    selector = {_id:{$nin:currentDataSetIds}};

    return DataSets.find(selector,{sort:{name:1}});
  },
  // identifies model outputs not yet associated with this experiment
  // that can now be associated with it
/*  otherModelOutputs: function() {
    var currentModelOutputs = Session.get('tempModelOutputs');
    if (currentModelOutputs) {
      var currentModelOutputIds = [];
      currentModelOutputs.forEach(function(modelOutput){
        currentModelOutputIds.push(modelOutput._id);
      });
      selector = {_id:{$nin:currentModelOutputIds}};

      return ModelOutputs.find(selector,{sort:{name:1}});
    }
  },*/
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
  // returns an array with the names of the model outputs currently
  // associated with the current experiment in create or update mode
/*  tempModelOutputs: function() {
    var tempModelOutputs = Session.get('tempModelOutputs');
    if( tempModelOutputs && tempModelOutputs.length > 0) {
      tempModelOutputs.forEach(function(modelOutput){
        modelOutput.name = ModelOutputs.findOne({_id: modelOutput._id}).name;
      });
      return tempModelOutputs;
    }
    else return [];
  },*/
  // returns the model outputs associated with the current experiment
  modelOutputs: function() {
      return getModelOutputs();
  }
});

// returns the model outputs associated with the current experiment
function getModelOutputs() {
    currentExperimentId = getCurrentExperiment()._id;
    if( currentExperimentId ) {
        var selector = {'experiments':currentExperimentId};
        return  ModelOutputs.find(selector,{sort:{created:-1}}).fetch();
    }
}


/* old events
/*    'click .upload-btn':function(event){
        event.preventDefault();
        Session.set('uploadButtonClicked', true);
    },


old helpers
// returns the current experiment document from the mongodb
experiment: function() {
    return getCurrentExperiment();
},

userEmail: function(userId) {
    var user = Meteor.users.findOne({'_id':userId});
    if( user && user.emails && user.emails.length > 0 ) {
        return Meteor.users.findOne({'_id':userId}).emails[0].address;
    }
    else return '';
},

reference: function() {
    var reference = Reference.findOne();
    return reference;
},
isPublic: function() {
    var dataSet = getCurrentExperiment();
    if( dataSet ) {
        if( !dataSet.public ) return 'checked'
        if( dataSet.public === 'true') return 'checked'
        else return undefined
    }
    else return 'checked';
},
isPublicOrOwner: function() {
  var dataSet = getCurrentExperiment();
  if( dataSet ) {
      if( !dataSet.public ) return true
      if( dataSet.public === 'true') return true
      else {
          var user = Meteor.user();
          if( user._id === dataSet.owner ) return true;
          else return false;
      }
  }
  else return true;
},
latestVersion: function() {
  var currentExperiment = getCurrentExperiment();
  if(currentExperiment)
      return currentExperiment.latest
  else {
      return false;
  }
},
/*  inEditMode: function() {
      var screenMode = getScreenMode();
      return (screenMode =='update' || screenMode =='create');
  },
  inUpdateMode: function() {
      return (getScreenMode()=='update');
  },
  inDisplayMode: function() {
      return (getScreenMode()=='display');
  },
files: function() {
    var experiment = getCurrentExperiment();
    return getFiles(dataSet);
},
  inUpdateMode: function() {
      return (getScreenMode()=='update');
  },
  inDisplayMode: function() {
      return (getScreenMode()=='display');

isDownloadable: function() {
    if (this.downloadable)
        return "Yes"
    else {
        return "No"
    }
  },
  variables: function() {
      return Variables.find();
  },
  updateBtnDisabled: function() {
      var toDisable = Session.get(disableUpdateBtn);
      if ( toDisable ) return true
      else return '';
  },
  uploadButtonClicked: function() {
    return Session.get('uploadButtonClicked');
  },*/

/*Template.experiment.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
};


function getCurrentDataSetIds() {
    var exp = getCurrentExperiment()
    if (exp)
        return exp.dataSets;
    else return [];
}



Template.experiment.helpers({
    experiment: function() {
        return getCurrentExperiment();
    },
    modelOutputs: function() {
        return getModelOutputs();
    },
    reference: function() {
        return getReference();
    }

});

getCurrentExperiment = function() {
    currentExperimentId = Session.get('currentExperiment');
    if( currentExperimentId ) {
        var experiment = Experiments.findOne({'_id':currentExperimentId});
        if( experiment && experiment.scripts ) {
            experiment.scripts.sort(function(a,b){
                if(a.created >= b.created) return -1
                else return 1
            });
        }
        return experiment;
    }
}

getModelOutputs = function() {
    currentExperimentId = Session.get('currentExperiment');
    var user = Meteor.user();
    var selector = {'experiment':currentExperimentId};
    if( user && user.profile.currentWorkspace ) {
        selector.workspaces = user.profile.currentWorkspace._id;
    }
    if( currentExperimentId ) {
        return  ModelOutputs.find(selector,{sort:{created:-1}});
    }
}

getReference = function() {
    return Reference.findOne();
};

Template.experiment.update = function(event) {
    var fieldName = $(event.target).attr('name');
    var value = $(event.target).val();
    Template.experiment.performUpdate(fieldName,value);
};

Template.experiment.performUpdate = function(fieldName,value) {

    if( value ) {

        var user = Meteor.user();
        currentExperimentId = Session.get('currentExperiment');
        var reference = Template.experiment.reference();

        if( currentExperimentId ) {

            if( value == "n/a" ) value = null;

            var selector = {'_id':currentExperimentId};
            var fieldModifier = {};
            fieldModifier[fieldName] = value;
            var modifier = {'$set':fieldModifier};
            Experiments.update(selector,modifier,function(error){
                if( error ) {
                    $('.error').html('There was an error saving the field, please try again');
                    $('.error').show();
                }
            });
        }
        else {
            currentExperiment = {
                'owner' : user._id,
                'created' : new Date(),
                'workspaces' : [user.profile.currentWorkspace._id]
            };
            //if( fieldName != 'type' ) currentExperiment.type = reference.dataSetType[0];
            //if( fieldName != 'country' ) currentExperiment.country = reference.country[0];
            //if( fieldName != 'vegType' ) currentExperiment.vegType = reference.vegType[0];
            if( fieldName != 'spatialLevel' ) currentExperiment.spatialLevel = reference.spatialLevel[0];
            if( fieldName != 'timeStepSize' ) currentExperiment.timeStepSize = reference.timeStepSize[0];
            currentExperiment[fieldName] = value;
            Experiments.insert(currentExperiment,function(error,id) {
                if( error ) {
                    if( error.error == 409 ) $('.error').html('An experiment with that name already exists');
                    else $('.error').html('There was an error saving your value, please try again');
                    $('.error').show();
                }
                else {
                    currentExperiment._id = id;
                    Session.set('currentExperiment',id);
                }
            });
        }
    }
};

Template.experiment.events({
    'blur input': function (event) {
        Template.experiment.update(event);
    },
    'blur textarea': function (event) {
        Template.experiment.update(event);
    },
    'change select':function(event) {
        Template.experiment.update(event);
    },
    'click #driving-data-set':function(event) {
        event.preventDefault();
        var selected = $('select[name="drivingDataSet"]').val();
        if( selected ) {
            var experimentId = Session.get('currentExperiment');
            if( !experimentId ) alert('Please enter an experiment name before adding data sets');
            else {
                Experiments.update({'_id':experimentId},
                    {'$push':{'dataSets':selected}},function(error){
                    if( error ) {
                         $('.error').html('Error adding data set, please try again');
                         $('.error').show();
                    }
                });
            }
        }
    },
    'click .remove-driving-dataset':function(event) {
        console.log('here');
        var dataSetId = $(event.target).attr('id');
        var experimentId = Session.get('currentExperiment');
        if( dataSetId && experimentId ) {
            Experiments.update({_id:experimentId},
                {$pull:{'dataSets':dataSetId}},function(error){
                if(error) {
                    $('.error').html('Sorry, there was an error removing the data set, try again');
                    $('.error').show();
                }
            });
        }
    },
    'click .delete-script':function(event) {
        if( Meteor.user().admin ) {
            var key = $(event.target).attr('id');

            var currentExperiment = Template.experiment.experiment();
            if( currentExperiment.scripts ) {
                var currentScript = undefined;
                currentExperiment.scripts.forEach(function(script) {
                    if( script.key == key ) {
                        currentScript = script;
                    }
                });
                if( currentScript ) {
                    Experiments.update({'_id':currentExperiment._id},
                        {$pull : {'scripts':{ 'key':key }}}, function(error) {
                            if( error ) {
                                $('.error').html('Failed to delete script, please try again');
                                $('.error').show();
                            }
                        }
                    );

                    Files.remove({_id:currentScript.fileObjId},function(err){
                       if(err) console.log(err);
                    });
                }
            }
        }
    },
    // 'change .file-select': function(event, template){
    //     var file = event.target.files[0];
    //     var reader = new FileReader();
    //     var currentExperimentId = Session.get('currentExperiment');
    //     if( !currentExperimentId ) {
    //         alert("Please enter an experiment name before uploading scripts");
    //         return;
    //     }
    //     var progress = templateSharedObjects.progress();
    //     progress.showProgress();
    //     reader.onload = function(fileLoadEvent) {
    //         Meteor.call('uploadScript', currentExperimentId, file.name, file.size, reader.result);
    //     };
    //     reader.onprogress = progress.readerProgress;
    //     reader.readAsBinaryString(file);
    // }
    'change .file-select': function(event, template){

        var currentExperimentId = Session.get('currentExperiment');
        if( !currentExperimentId ) {
            alert("Please enter an experiment name before uploading scripts");
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
                    Experiments.update({'_id':currentExperimentId},
                        {'$push':{'scripts':fileRecord}},function(error){
                            if( error ) {
                                console.log(error);
                                console.log('Failed to add uploaded script to the experiment');
                            }
                    });
                }
            });
        });
    }
});

Template.experiment.dataSets = function() {
    var publicWorkspace = Workspaces.findOne({"name":"public"});
    return  DataSets.find({'workspaces':publicWorkspace._id});
};

Template.experiment.drivingDataSets = function() {
    var exp = Template.experiment.experiment();
    if( exp && exp.dataSets && exp.dataSets.length > 0) {
        var drivingDataSets = DataSets.find({_id:{$in:exp.dataSets}});
        return drivingDataSets;
    }
};

Template.experiment.hasScripts = function() {
    var experiment = Template.experiment.experiment();
    if( experiment && experiment.scripts && experiment.scripts.length > 0 ) return true;
    else return false;
};

Template.experiment.uploadDisabled = function() {
    var currentExperiment = Template.experiment.experiment();
    if( currentExperiment ) return '';
    else return 'disabled="disabled"';
}
*/
