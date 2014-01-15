Handlebars.registerHelper('breaklines',
    function(text) {
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        return text;
    }
);