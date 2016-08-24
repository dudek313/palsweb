Router.configure({
    layoutTemplate: 'main',
    notFoundTemplate: 'notFound'
});

Router.plugin('dataNotFound', {notFoundTemplate: 'notFound'})

Router.map(function () {
    this.route('root',{
        path: '/',
        template: 'home'
    });
});
