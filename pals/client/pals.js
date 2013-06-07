Meteor.startup(function(){

    var currentView = 'home';

    var views = {};
    views['home'] = Meteor.render(function(){ return Template.home() });
    views['workspaces'] = Meteor.render(function(){ return Template.workspaces() });
    
    window['changeView'] = function(viewName) {
        currentView = viewName;
        console.log(views[currentView]);
        $('#main').html(views[currentView]);
    };
    
    window['changeView']('home');
});