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

getModelOutputsInWorkspace = function(ws) {
    var user = Meteor.user();
    if (ws)
        var expSelector = {workspace:ws};
    else {
        // get model outputs from all available workspaces
        var availableWorkspaceIds = getAvailableWorkspaceIds();
        var expSelector = {workspace:{$in:availableWorkspaceIds}};
    }
    var exps = Experiments.find(expSelector).fetch();
    var expIds = getIdsFromObjects(exps);
    var modelOutputs = ModelOutputs.find({experiments: {$in: expIds}}).fetch();
    console.log(modelOutputs);
    return modelOutputs;
}

getModelsFromModelOutputs = function(modelOutputs) {
    var models = [];
    var model_ids = [];

    if (modelOutputs) {
        modelOutputs.forEach(function(modelOutput){
            var modelId = modelOutput.model;
            if (modelId) {
                if (model_ids.indexOf(modelId) == -1) {
                    var model = Models.findOne({_id:modelId});
                    models.push(model);
                    model_ids.push(modelId);
                }
            }
        });
    }
    return models;
}

Template.models.helpers({
    pageTitle: function() {
        var source = getSource();
        if (source == 'mine')
            return "My Model Profiles";
        else if (source == 'workspace')
            return "Model Profiles in the Current Workspace";
        else if (source == 'anywhere')
            return "Model Profiles in All Available Workspaces";
        else {
          $('.error').html('An error occurred in displaying the page. Please try again.');
          $('.error').show();
        }
    },
    models: function() {
        var userId = Meteor.userId();

        var source = getSource();
        if (source == 'mine')
            var models = Models.find({'owner':userId}).fetch();
        else if (source == 'workspace' || source == 'anywhere') {

           // select relevant modelOutputs and associated models
            var workspace = ((source == 'workspace') ? user.profile.currentWorkspace : null);
            var modelOutputs = getModelOutputsInWorkspace(workspace);
            var models = getModelsFromModelOutputs(modelOutputs);
        }
        else {
            $('.error').html('Unable to display models');
            $('.error').show();
        }
        // set model.owner to the owner's email
        if( models ) {
            models.forEach(function(model){
                if( model ) {
                    if( model.owner ) {
                        model.owner = Meteor.users.findOne({'_id':model.owner},{'_id':1,'name':1});
                        if( model.owner && model.owner.emails && model.owner.emails.length > 0) {
                            model.owner.email = model.owner.emails[0].address;
                        }
                    }
                }
            });
        }

        return models.sort(function(a,b) {
            x = a.name.toLowerCase();
            y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });


    }
})
