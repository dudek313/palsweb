Template.main.onCreated(function() {
  if (!Session.get('experiments.workspace'))
    Session.set('experiments.workspace', 'All');

  if (!Session.get('experiments.anywhere'))
    Session.set('experiments.anywhere', 'All');

  if (!Session.get('dataSets.workspace'))
    Session.set('dataSets.workspace', 'All');

  if (!Session.get('dataSets.anywhere'))
    Session.set('dataSets.anywhere', 'All');

});

UI._allowJavascriptUrls();
