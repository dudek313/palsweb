var maxIndex = 3;

Session.set('analyses.clearIndex',maxIndex);

Session.set('analyses.1.type','model');
Session.set('analyses.2.type','experiment');
Session.set('analyses.3.type','modelOutput');

Template.analyses.currentType = function(typeIndex) {
    return Session.get('analyses.'+typeIndex+'.type');
}

Template.analyses.findTypeIndex = function(type) {
    for( var i=1; i <= maxIndex; ++i ) {
        if( Session.get('analyses.'+i+'.type') == type ) return i;
    }
    return undefined;
}

/*
Template.analyses.getFirstChoice = function(type) {
    return $('#'+Template.analyses.findTypeIndex(type)).children(":first").attr('value');
}
*/


Template.analyses.selectOptions = function(selectIndex) {

    if( selectIndex > Session.get('analyses.clearIndex') ) return undefined;

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
        else if( previousType && previousType == 'modelOutput' ) {
            var modelOutputId = Session.get('analyses.modelOutput');
            if( modelOutputId ) {
                var modelOutput = ModelOutputs.findOne({_id:modelOutputId},{fields: {model:1}});
                if( modelOutput ) {
                    return Models.find({_id:modelOutput.model});
                }
            }
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
        else if( previousType && previousType == 'modelOutput') {
            var modelOutputId = Session.get('analyses.modelOutput');
            if( modelOutputId ) {
                var modelOutput = ModelOutputs.findOne({_id:modelOutputId},{fields: {experiment:1}});
                if( modelOutput ) {
                    return Experiments.find({_id:modelOutput.experiment});
                }
            }
        }
        else {
            return Experiments.find();
        }
    }
    else if( type == 'modelOutput' ) {
        if( previousType && previousType == 'experiment') {
            var experimentId = Session.get('analyses.experiment');
            if( experimentId ) return ModelOutputs.find({experiment:experimentId});
        }
        else if( previousType && previousType == 'model') {
            var modelId = Session.get('analyses.model');
            if( modelId ) return ModelOutputs.find({model:modelId});
        }
        else {
            return ModelOutputs.find();
        }
    }
}

Template.analyses.events({
    'change select':function(event) {
        var key = $(event.target).attr('name');
        var type = Session.get('analyses.'+key+'.type');
        var value = $(event.target).val();
        Session.set('analyses.'+type,value);
        
        if( Session.get('analyses.clearIndex') <= key ) {
            Session.set('analyses.clearIndex',parseInt(key)+1)
        }
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
            
            Session.set('analyses.clearIndex',Math.min(toKey,fromKey));
        }
    }
});