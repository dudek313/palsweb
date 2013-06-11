Template.datasets.rendered = function() {
    window['directives']();
};

Template.datasets.dataSets = function() {
    var user = Meteor.user();
    return  DataSets.find({'workspaces':user.profile.currentWorkspace._id});
}

Template.datasets.userEmail = function(userId) {
    var user = Meteor.users.findOne({'_id':userId});
    if( user && user.emails && user.emails.length > 0 ) {
        return Meteor.users.findOne({'_id':userId}).emails[0].address;
    }
    else return '';
}

Template.datasets.events({
    'click .delete' : function(event) {
        var id = $(event.target).attr('id');
        if( id ) {
            console.log(id);
            DataSets.remove({'_id':id},function(error){
                if(error) {
                    $('.error').html('Failed to delete the data set, please try again');
                    $('.error').show();
                }
            });
        }
    }
});