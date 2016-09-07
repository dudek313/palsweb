UI._allowJavascriptUrls();

Template.workspaceBadge.helpers({
  currentWorkspaceName: function() {
      var ws = getCurrentWorkspace();
      const MaxLength = 24;
      if (ws) {
        var wsName = ws.name;
        if (wsName.length >= MaxLength) {
          var wsName = wsName.substr(0, MaxLength) + "...";
        }
        return wsName;
      }
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
