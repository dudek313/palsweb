Template.modelOutput.rendered = function() {
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
/*
    'click .display':function(event) {
        if( Template.modelOutput.owner() ) {
            $(event.target).next('.modifier').show();
            $(event.target).hide();
        }
    },
*/
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
