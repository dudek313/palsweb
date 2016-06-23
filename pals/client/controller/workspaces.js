Template.workspaces.helpers({
    myWorkspaces: function() {
        var user = Meteor.user();
        if( user ) {
            var workspaces =  Workspaces.find({'owner':user._id});
            return workspaces;
        }
    },
    sharedWorkspaces: function() {
        var user = Meteor.user();
        var selector = {'public':true};
        if( user ) {
            if (!user.admin)
                selector = {$or: [selector, {'guests':user._id}]};
            else selector = {};
        }

        return Workspaces.find(selector).fetch();
    },
    rootWorkspace: function() {
        return Workspaces.findOne({'name':'public'});
    }
    /*
    greyIfLoggedOut: function() {
        if (Meteor.user()) return ""
        else {
          console.log("grey");
          return "color:gray";
        }
    }
    */
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
                  user.profile.currentWorkspace = workspace;
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
            {'$set' : {'profile.currentWorkspace':workspace}});
          Router.go('/workspace/'+id);
      }
  },
  'click .delete-workspace':function (event) {
      var id = $(event.target).attr('id');
      var user = Meteor.user();
      if( id ) {
          Workspaces.remove({'_id':id},function(error){
              if( error ) alert(error);
          });
      }
  },
  'click .open-workspace-shared':function (event) {
      var user = Meteor.user();
      if(user){
          var id = $(event.target).attr('id');
          if( id ) {
              var workspace = Workspaces.findOne({'_id':id});
              Meteor.users.update({'_id':user._id},
                {'$set' : {'profile.currentWorkspace':workspace}});
          }
      }
      else {
          $('.error').html('To enter a workspace, please login or create an account.');
          $('.error').show();
      }
  }
});
