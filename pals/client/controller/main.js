UI._allowJavascriptUrls();

Template.workspaceBadge.helpers({
  currentWorkspace: function() {
      return getCurrentWorkspace();
  },
  notInWorkspace: function() {
      var currentWorkspace = getCurrentWorkspace();
      if( currentWorkspace && (currentWorkspace.name == 'browsing')) {
          return true;
      }
      else {
          return false;
      }
  }

})
