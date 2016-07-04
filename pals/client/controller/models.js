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

getModelOutputsInWorkspace = function(workspace) {
    var user = Meteor.user();
    if (workspace)
        var modelOutputs = ModelOutputs.find({'workspaces':user.profile.currentWorkspace._id}).fetch();
    else {
        // get model outputs from all public workspaces
        var publicWorkspaces = Workspaces.find({'public':true}).fetch();
        var publicWorkspaceIds = [];
        publicWorkspaces.forEach(function(publicWorkspace) {
            publicWorkspaceIds.push(publicWorkspace._id);
        });
        var modelOutputs = ModelOutputs.find({'workspaces': {$in: publicWorkspaceIds}}).fetch();
    }
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
        var selector = Session.get('selector');
        if (selector == 'mine')
            return "My Model Profiles";
        else if (selector == 'workspace')
            return "Model Profiles in the Current Workspace";
        else if (selector == 'public')
            return "Model Profiles in Public Workspaces";
        else {
          $('.error').html('An error occurred in displaying the page. Please try again.');
          $('.error').show();
        }
    },
    models: function() {
        var user = Meteor.user();
        if( user ) {
            var selector = Session.get('selector');
            if (selector == 'mine')
                var models = Models.find({'owner':user._id}).fetch();
            else if (selector == 'workspace' || selector == 'public') {
               // select relevant modelOutputs and associated models
                var workspace = null;
                if (selector == 'workspace') {
                    workspace = user.profile.currentWorkspace._id;
                }
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
    }
})
