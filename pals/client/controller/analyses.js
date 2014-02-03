Template.analyses.models = function() {
    return Models.find();
}

Template.analyses.experiments = function() {
    var modelId = Session.get('analyses.model');
    var modelOutputs = ModelOutputs.find({'model':modelId},{fields: {experiment:1}}).fetch();
    var experimentIdArray = [];
    for( var i=0; i < modelOutputs.length; ++i ) {
        var modelOutput = modelOutputs[i];
        experimentIdArray.push(modelOutput.experiment);
    }
    var experiments = Experiments.find({_id : {$in : experimentIdArray}});
    console.log(experiments);
    return experiments;
}

Template.analyses.events({
    'change select':function(event) {
        var key = $(event.target).attr('id');
        var fieldName = $(event.target).attr('name');
        var value = $(event.target).val();
        Session.set('analyses.'+fieldName,value);
    }
});