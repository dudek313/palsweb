import '../views/workspaces.html';

Template.workspaces.onCreated(function() {
  Meteor.subscribe('workspaces');
});


Template.workspaces.helpers({
    myWorkspaces: function() {
        var user = Meteor.user();
        if( user ) {
            var workspaces =  Workspaces.find({'owner':user._id}).fetch();
            return workspaces;
        }
    },
    sharedWorkspaces: function() {
        var userId = Meteor.userId();
        var selector = {'public':true};
        if( userId ) {
            if (!Roles.userIsInRole(userId, 'workspaceAccess', Roles.GLOBAL_GROUP))
                selector = {$or: [selector, {'guests':userId}]};
            else selector = {};
        }

        return Workspaces.find(selector).fetch();
    },
    rootWorkspace: function() {
        return Workspaces.findOne({'name':'public'});
    }
});

Template.workspaces.events({
  'click #add-workspace': function (event) {
    event.preventDefault();
    var user = Meteor.user();
    var name = $('input[name="workspace.name"]').val();
    if( name && name.length > 0 ) {
      Meteor.call('insertWorkspace', name, function(error,id){
        if( error ) alert(error);
        else {
          Meteor.call('changeWorkspace', id, function(error) {
            if(error) alert(error)
            else Router.go('/workspace/'+id);
          });
        }
      });
    }
  },
  'click .open-workspace':function (event) {
      var id = $(event.target).attr('id');
      if( id ) {
          var user = Meteor.user();
          var workspace = Workspaces.findOne({'_id':id});
          if(workspace) {
            Meteor.call('changeWorkspace', id, function(error) {
              if(error) alert(error)
              else Router.go('/workspace/'+id);
            });
          }
          else {
            $('.error').html('Unable to access workspace');
            $('.error').show();
          }
      }
  },
  'click .leave-workspace':function (event) {
      event.preventDefault();
      var userId = Meteor.userId();
      enterBrowseMode();
/*      browsingWS = Workspaces.findOne({name:'browsing'})
      if (browsingWS && browsingWS._id) {
        Meteor.call('changeWorkspace', browsingWS._id, function(error) {
          if(error) alert(error)
          else Router.go('/workspace/' + browsingWS._id);
        });
      }
      else {
        $('.error').html('Unable to access browsing workspace');
        $('.error').show();
      }
      */
  },
  'click .delete-workspace':function (event) {
      var id = $(event.target).attr('id');
      var user = Meteor.user();
      if( id ) {
          if (confirm('Are you sure?')) {
            Meteor.call('removeWorkspace', {_id: id}, function(error){
              if( error ) alert(error);
            });
          }
      }
  },
  'click .open-workspace-shared':function (event) {
      var user = Meteor.user();
      if(user){
          var id = $(event.target).attr('id');
          if( id ) {
              var workspace = Workspaces.findOne({'_id':id});
              if(workspace) {
                Meteor.call('changeWorkspace', id, function(error) {
                  if(error) alert(error)
                });
              }
              else {
                $('.error').html('Unable to access workspace');
                $('.error').show();
              }
          }
      }
      else {
          window.scrollTo(0,0);
          $('.error').html('To enter a workspace, please login or create an account.');
          $('.error').show();
      }
  }
});
