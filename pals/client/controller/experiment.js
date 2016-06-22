Template.experiment.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
    Session.set('uploadButtonClicked', false);
    SimpleSchema.debug = true;
};

AutoForm.hooks({
    createExperimentForm: {
        /* this will only be used for creating experiment templates */
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            event.preventDefault();
            insertDoc._version = 1;
            insertDoc.owner = Meteor.user()._id;
            insertDoc.scripts = Session.get('tempScripts');
            insertDoc.recordType = 'template';
            var currentDataSets = Session.get('tempDataSets');
            insertDoc.dataSets = [];
            currentDataSets.forEach(function(dataSet) {
                var dataSetDetails = {
                    _id : dataSet._id,
                    _version : null
                };
                insertDoc.dataSets.push(dataSetDetails);
            })

            Meteor.call('insertExperiment', insertDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to create the data set. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    Session.set('tempScripts', []);
                    Session.set('tempDataSets', []);
                    Router.go('/experiment/display/' + docId);
                }
            });

            this.done();
            return false;
        },
        before: {
            normal: function(doc) {
                doc._id = Session.get(currentExperiment);
            }
        },
    },
    updateExperimentForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            var recordType = getRecordType();
            updateDoc.$set.scripts = Session.get('tempScripts');
            var currentDataSets = Session.get('tempDataSets');
            updateDoc.$set.dataSets = [];
            currentDataSets.forEach(function(dataSet) {
                if (recordType == 'template') {
                    version = null;
                }
                else if (recordType == 'instance') {
                    version = dataSet._version;
                }
                else {
                  $('.error').html('Failed to update the data set. Please try again.');
                  $('.error').show();
                }

                var dataSetDetails = {
                    _id : dataSet._id,
                    _version : version
                };
                updateDoc.$set.dataSets.push(dataSetDetails);
            })
            Meteor.call('updateExperiment', currentDoc, updateDoc, function(error, docId){
                if(error) {
                    $('.error').html('Failed to update the data set. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
                else {
                    Session.set('tempScripts', []);
                    Session.set('tempDataSets', []);
                    Session.set('screenMode', 'display');
//                        var currentExperimentId = Session.get('currentExperiment');
//                        Router.go('/experiment/display/' + currentExperimentId);
                }
            });

            this.done();
            return false;
        }
    }
})

Template.experiment.events = {
    'click .upload-btn':function(event){
        event.preventDefault();
        Session.set('uploadButtonClicked', true);
    },
    'click .cancel-update':function(event){
        event.preventDefault();
        Session.set('screenMode','display');
    },
    'click .cancel-create':function(event){
        event.preventDefault();
        Router.go('/home')
    },
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
    'click .enable-update':function(event){
        var currentExperiment = getCurrentExperiment();
        Session.set('tempScripts', currentExperiment.scripts);
        Session.set('tempDataSets', currentExperiment.dataSets);
        Session.set('screenMode', 'update');
    },
    'change .file-select':function(event, template){
        var CurrentExperimentId = Session.get('currentExperiment');
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
                    Session.set('uploadButtonClicked', false);

                }
            });
        });
    },
    'click .download-file':function(event, template){
        event.preventDefault();
    },
    'click #add-data-set':function(event) {
        event.preventDefault();
        var selected = $('select[name="addDataSet"]').val();
        if( selected && selected != "(Select One)" ) {
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
    'click .remove-dataset':function(event) {
        event.preventDefault();
        var dataSetId = $(event.target).attr('id');
        var currentDataSets = Session.get('tempDataSets');
        var currentDataSetIds = [];
        currentDataSets.forEach(function(dataSet){
            currentDataSetIds.push(dataSet._id);
        });
        if (currentDataSetIds) {
            var index = currentDataSetIds.indexOf(dataSetId);
            if (index > -1) {
                currentDataSets.splice(index,1);
                Session.set('tempDataSets', currentDataSets);
            }
            else {
              $('.error').html('Error removing data set, please try again');
              $('.error').show();
            }
        }
        else {
          $('.error').html('Error removing data set, please try again');
          $('.error').show();
        }
    },

};


function getRecordType() {
    var experiment = getCurrentExperiment();
    if (experiment)
        return experiment.recordType;
    else {
        return null;
    }
}
/*function updateDataSetFields() {
    var currentExperimentId = Session.get('currentExperiment');
    var updateDoc = {$push:{'experiments':{id:currentExperimentId, workspace:null}}};
    var currentDataSetIds = Session.get('tempDataSets');
    var experiment = getCurrentExperiment();
    currentDataSetIds.forEach(function(dataSetId){
        var currentDoc = {_id:dataSetId};
        if(experiment.dataSets.indexOf(dataSetId) == -1) {
            Meteor.call('updateDataSet', currentDoc, updateDoc, function(error,docId){
                if(error) {
                    $('.error').html('Failed to update data set with id '+ dataSetId +'. Please try again.');
                    $('.error').show();
                    console.log(error.reason);
                }
            });
        }
    });
}*/

function getCurrentExperiment() {
    var currentExperimentId = Session.get('currentExperiment');
    var currentExperiment = Experiments.findOne({'_id':currentExperimentId});
    return currentExperiment;
}

/*
function getCurrentDataSetIds() {
    var exp = getCurrentExperiment()
    if (exp)
        return exp.dataSets;
    else return [];
}
*/
Template.experiment.helpers({
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
  },
  formId: function() {
    var screenMode = Session.get('screenMode');
    var formId = null;
    if(screenMode == 'create') formId = "createExperimentForm";
    else if(screenMode == 'update') formId = "updateExperimentForm";
    return formId;
  },
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
  dataIfNeeded: function() {
    var screenMode = Session.get('screenMode');
    if(screenMode == 'create') return null
    else if(screenMode == 'update') return getCurrentExperiment();
    else return null;
  },
  isDownloadable: function() {
      if (this.downloadable)
          return "Yes"
      else {
          return "No"
      }
  },
  experiment: function() {
      return getCurrentExperiment();
  },
  tempScripts: function() {
      return Session.get('tempScripts');
  },
  files: function() {
      var experiment = getCurrentExperiment();
      return getFiles(dataSet);
  },
  reference: function() {
      var reference = Reference.findOne();
      return reference;
  },
  inEditMode: function() {
      var screenMode = Session.get('screenMode');
      return (screenMode =='update' || screenMode =='create');
  },
  inUpdateMode: function() {
      return (Session.get('screenMode')=='update');
  },
  inDisplayMode: function() {
      return (Session.get('screenMode')=='display');
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
  inCreateMode: function() {
    var screenMode = Session.get('screenMode');
    return (screenMode == 'create')
  },
  latestVersion: function() {
    var currentExperiment = getCurrentExperiment();
    if(currentExperiment)
        return currentExperiment.latest
    else {
        return false;
    }
  },
  otherDataSets: function() {
    var currentDataSets = Session.get('tempDataSets');
    if (currentDataSets) {
      var currentDataSetIds = [];
      currentDataSets.forEach(function(dataSet){
        currentDataSetIds.push(dataSet._id);
      });
      selector = {_id:{$nin:currentDataSetIds}};

      return DataSets.find(selector,{sort:{name:1}});
    }
    else console.log('Error: No experiment selected');
  },
  recordType: function() {
    return getRecordType();
  },
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
  userEmail: function(userId) {
      var user = Meteor.users.findOne({'_id':userId});
      if( user && user.emails && user.emails.length > 0 ) {
          return Meteor.users.findOne({'_id':userId}).emails[0].address;
      }
      else return '';
  },
  modelOutputs: function() {
      return getModelOutputs();
  }
});

getModelOutputs = function() {
    currentExperimentId = Session.get('currentExperiment');
    var selector = {'experiment':currentExperimentId};
    if( currentExperimentId ) {
        return  ModelOutputs.find(selector,{sort:{created:-1}});
    }
}

/*Template.experiment.rendered = function() {
    window['directives']();
    templateSharedObjects.progress().hide();
};

Template.experiment.helpers({
    experiment: function() {
        return getCurrentExperiment();
    },
    modelOutpus: function() {
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
