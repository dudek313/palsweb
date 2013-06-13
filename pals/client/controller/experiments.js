Template.experiments.experiments = function() {
    return Experiments.find();
}

Template.experiments.events({
    'click .delete' : function(event) {
        var id = $(event.target).attr('id');
        if( id ) {
            console.log(id);
            Experiments.remove({'_id':id},function(error){
                if(error) {
                    $('.error').html('Failed to delete the experiment, please try again');
                    $('.error').show();
                }
            });
        }
    }
});