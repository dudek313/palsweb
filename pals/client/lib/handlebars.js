Handlebars.registerHelper('selected', function(foo, bar) {
    return foo == bar ? 'selected' : '';
});