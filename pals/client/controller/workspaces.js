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
            if (!Roles.userIsInRole(userId, 'access', 'all workspaces'))
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
          Workspaces.insert({"owner":user._id,"name":name},function(error,id){
              if( error ) alert(error);
              else {
                  var workspace = Workspaces.findOne({'_id':id});
                  user.profile.currentWorkspace = workspace._id;
                  Meteor.users.update({'_id':user._id},
                      {'$set' : {'profile.currentWorkspace':user.profile.currentWorkspace}});
                  Router.go('/workspace/'+id);
              }
          });
      }
  },
  'click .open-workspace':function (event) {
      var id = $(event.target).attr('id');
      if( id ) {
          var user = Meteor.user();
          var workspace = Workspaces.findOne({'_id':id});
          Meteor.users.update({'_id':user._id},
            {'$set' : {'profile.currentWorkspace':workspace._id}});
          Router.go('/workspace/'+id);
      }
  },
  'click .leave-workspace':function (event) {
      event.preventDefault();
      var userId = Meteor.userId();
      browsingWS = Workspaces.findOne({name:'browsing'})
      if (browsingWS)
          var browsingId = browsingWS._id;
      Meteor.users.update({_id:userId}, {$set:{'profile.currentWorkspace': browsingId}});
  },
  'click .delete-workspace':function (event) {
      var id = $(event.target).attr('id');
      var user = Meteor.user();
      if( id ) {
          if (confirm('Are you sure?')) {
            Workspaces.remove({'_id':id},function(error){
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
              Meteor.users.update({'_id':user._id},
                {'$set' : {'profile.currentWorkspace':workspace._id}});
          }
      }
      else {
          window.scrollTo(0,0);
          $('.error').html('To enter a workspace, please login or create an account.');
          $('.error').show();
      }
  }
});
