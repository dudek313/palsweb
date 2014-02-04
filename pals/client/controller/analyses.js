Session.set('analyses.1.type','model');
Session.set('analyses.2.type','experiment');

Template.analyses.currentType = function(typeIndex) {
    return Session.get('analyses.'+typeIndex+'.type');
}


Template.analyses.selectOptions = function(selectIndex) {

    var type = Session.get('analyses.'+selectIndex+'.type');
    var previousIndex = selectIndex - 1;
    var previousType = Session.get('analyses.'+previousIndex+'.type');
    
    if( type == 'model' ) {
        if( previousType && previousType == 'experiment') {
            var experimentId = Session.get('analyses.experiment');
            var modelOutputs = ModelOutputs.find( {experiment:experimentId}, {fields: {model:1}} ).fetch();
            var modelIdArray = [];
            for( var i=0; i < modelOutputs.length; ++i ) {
                var modelOutput = modelOutputs[i];
                modelIdArray.push(modelOutput.model);
            }
            var models = Models.find({_id : {$in : modelIdArray}});
            return models;
        }
        else {
            return Models.find();
        }
    }
    else if( type == 'experiment' ) {
        if( previousType && previousType == 'model') {
            var modelId = Session.get('analyses.model');
            var modelOutputs = ModelOutputs.find({'model':modelId},{fields: {experiment:1}}).fetch();
            var experimentIdArray = [];
            for( var i=0; i < modelOutputs.length; ++i ) {
                var modelOutput = modelOutputs[i];
                experimentIdArray.push(modelOutput.experiment);
            }
            var experiments = Experiments.find({_id : {$in : experimentIdArray}});
            return experiments;
        }
        else {
            return Experiments.find();
        }
    }
}

Template.analyses.events({
    'change select':function(event) {
        var key = $(event.target).attr('name');
        var type = Session.get('analyses.'+key+'.type');
        var value = $(event.target).val();
        Session.set('analyses.'+type,value);
    },
    'dragstart .form-group':function(event) {
        event.dataTransfer.setData("id",event.target.id);
    },
    'dragover .form-group':function(event) {
        event.preventDefault();
    },
    'drop .form-group':function(event) {
        var id = event.dataTransfer.getData("id");
        var from = $('#'+id);
        var to = $(event.target);
        for( var i=0; i < 5 && !to.hasClass("form-group"); ++i ) {
            to = to.parent();
        }
        if( to ) {
            var toKey = to.data('key');
            var fromKey = from.data('key');
            var toValue = Session.get('analyses.'+toKey+'.type');
            var fromValue = Session.get('analyses.'+fromKey+'.type');
            Session.set('analyses.'+toKey+'.type',fromValue);
            Session.set('analyses.'+fromKey+'.type',toValue);
        }
    }
});