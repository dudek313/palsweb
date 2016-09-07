
Template.workspace.helpers({
  greyIfPublic: function() {
    return Session.get('isPublic') ? "color:gray" : "color:black";
  },

  disabled: function() {
    return Session.get('isPublic') ? "disabled" : "";
  },
  checkedIfTrue: function (isTrue) {
      if( isTrue ) return 'checked';
  },
  isPublic: function() {
      var currentWorkspace = getWorkspaceDetails();
      if (currentWorkspace) {
          public = currentWorkspace.public
          Session.set('isPublic', public);
          return public;
      }
  },
  isOwner: function() {
      var user = Meteor.user();
      var workspace = getWorkspaceDetails();
      if( workspace && user && workspace.owner == user._id ) return true;
      else return false;
  },


  users: function() {
      var users = Meteor.users.find().fetch();
      var workspace = getWorkspaceDetails();
      if( workspace ) {
          users.forEach(function(user){
              if( workspace.guests && workspace.guests.lastIndexOf(user._id) >= 0 ) {
                  user.invited = true;
              }
              var profile = user.profile;
              if (profile) {
                if (profile.firstName && profile.lastName) {
                  profile.fullname = profile.firstName + " " + profile.lastName;
                }
              }
          });
      }
      return users;
  }
});

getWorkspaceDetails = function() {
  if(Router.current().data && Router.current().data())
    return Router.current().data();
}

Template.workspace.events({
  'click .make-public': function (event) {
      var checked = $(event.target).is(":checked");
      wsDetails = getWorkspaceDetails();
      if( wsDetails && wsDetails._id ) {
        var workspaceId = wsDetails._id;
        selector = { '_id' : workspaceId };
        var update = { '$set' :  { 'public' : checked } };
        Meteor.call('updateWorkspace', selector, update, function(error){
  //      Workspaces.update(selector,update,function(error){
            if( error ) {
              alert(error);
            }
            else Session.set('isPublic', checked);;
        });
      }
  },
  'click .invite-user': function (event) {
    var user = Meteor.user();
    var id = $(event.target).attr('id');
    var checked = $(event.target).is(":checked");
    wsDetails = getWorkspaceDetails();
    if( wsDetails && wsDetails._id) {
      workspaceId = wsDetails._id;
      if( id && checked ) {
        selector = { '_id' : workspaceId };
        var update = { '$addToSet' :  { 'guests' : id } };
        Meteor.call('updateWorkspace', selector, update, function(error){
            if( error ) alert(error);
        });
      }

      else if( id && !checked ) {
        var selector = { '_id' : workspaceId };
        var update = { '$pull' :  { 'guests' : id } };
        Meteor.call('updateWorkspace', selector, update, function(error){
            if( error ) alert(error);
        });
      }
    }
  }
});
