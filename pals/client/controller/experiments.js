Template.experiments.experiments = function() {
    var user = Meteor.user();
    if( user ) {
        var selector = {'workspace':user.profile.currentWorkspace._id};
        console.log('workspace id: ' + user.profile.currentWorkspace._id);
        var resolution = Template.experiments.currentSpatialResolution();
        if( resolution ) {
            selector.spatialLevel = resolution;
        }
        console.log(Experiments.find(selector,{sort:{created:-1}}));
        return Experiments.find(selector,{sort:{created:-1}});
    }
}

Template.experiments.currentSpatialResolution = function() {
    return Session.get('currentSpatialResolution');
}

Template.experiments.events({
    'click .delete' : function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        if( confirm("Are you sure?")) {
            var id = $(event.target).attr('id');
            if( id ) {
                console.log(id);
                Experiments.remove({'_id':id},function(error){
                    if(error) {
                        $('.error').html('Failed to delete the experiment, please try again');
                        $('.error').show();
                    }
                });
            }
        }
    },
    'click tr' : function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        var id = $(event.target).parent().attr('id');
        Router.go('/experiments/'+id);
    }
});

Template.experiments.helpers({
   areEqual: function(firstString,secondString) {
       if( firstString === secondString ) {
           return true;
       }
   }
});
