Template.analyses.onCreated(function() {
  Meteor.subscribe('analyses');
});

var maxIndex = 4;

Session.set('analyses.clearIndex',maxIndex);

Session.set('analyses.1.type','model');
Session.set('analyses.2.type','experiment');
Session.set('analyses.3.type','modelOutput');
Session.set('analyses.4.type','analysis');

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

function columnType(columnNum) {
  var colType = Session.get('analyses.' + columnNum + '.type');
  return colType;
}

function columnValue(columnNum) {
  var colType = columnType(columnNum);
  return Session.get('analyses.' + colType);
}

function columnNumber(field) {
  for (i = 1; i < 4; ++i) {
    if (columnType(i) == field)
      return i;
  }
}

Template.analyses.helpers({
  selectOptions: function(selectIndex) {
    var results;
    var selector = {};
    var type = Session.get('analyses.'+selectIndex+'.type');

    // The first column always displays all of its type, so the selector value is blank
    // The second column values are filtered based on the first column value
    if (selectIndex == 2) {

      if (type == 'model') {
        // experiment is the only valid option for column 1
        if (columnType(1) == 'experiment') {
          var experimentId = Session.get('analyses.experiment');
          var modelOutputs = ModelOutputs.find( {experiments:experimentId}, {fields: {model:1}} ).fetch();
  //        console.log(modelOutputs[0]);
          var modelIdArray = [];
          for( var i=0; i < modelOutputs.length; ++i ) {
            var modelOutput = modelOutputs[i];
            modelIdArray.push(modelOutput.model);
          }
          var selector = {_id : {$in : modelIdArray}};
        } else {
          console.log('Error: Invalid field in column 1');
          results = "blank";
        }
      }

      else if (type == 'experiment') {
        // model is the only valid option for column 1
        if (columnType(1) == 'model') {
          var modelId = Session.get('analyses.model');
          var modelOutputs = ModelOutputs.find({'model':modelId},{fields: {experiments:1}}).fetch();
          var experimentIdArray = [];
          for( var i=0; i < modelOutputs.length; ++i ) {
            var modelOutput = modelOutputs[i];
            experimentIdArray.push(modelOutput.experiments[0]);
          }
          var selector = {_id : {$in : experimentIdArray}};
        } else {
          console.log('Error: Invalid field in column 1');
          results = "blank";
        }
      }

      else if (type == 'modelOutput') {
        if (columnType(1) == 'model') {
          var modelId = Session.get('analyses.model');
          if( modelId )
            selector = {model: modelId};
        } else if (columnType(1) == 'experiment') {
          var experimentId = Session.get('analyses.experiment');
          if( experimentId )
            selector = {experiments:experimentId};
        }

      }
    }

    else if (selectIndex == 3) {
      if (type == 'modelOutput') {
        selector.model = Session.get('analyses.model');
        selector.experiments = Session.get('analyses.experiment')
      } else {
        // any other field in this position is redundant and doesn't need to be populated
        results = "blank";
      }
    }

    // assuming for now that the 4th column must contain analysis
    else if (selectIndex == 4) {
      var modelOutputId = Session.get('analyses.modelOutput');
      if( modelOutputId ) {
        var analysis = Analyses.findOne({modelOutput:modelOutputId},{sort:{created:-1}});
        if( analysis && analysis.results ) {
          var results = analysis.results;
          for( var i=0; i < results.length; ++i ) {
            var result = results[i];
            result.name = result.type;
            result._id = result.type;
            if (result.type == Session.get('analyses.analysis'))
              result.ifSelected = function() { return { selected: "selected"}};
          }
//            return results;
        }
      }
    }

    Session.set('valuesExist' + selectIndex, null);

    if (results != "blank") {
      if (type == 'model') {
        var models = Models.find(selector, {sort: {name: 1}}).fetch();
        Session.set('valuesExist' + selectIndex, models.length);
        return models;
      } else if (type == 'experiment') {
        selector.recordType = 'instance';
        var exps = Experiments.find(selector, {sort: {name: 1}}).fetch();
        Session.set('valuesExist' + selectIndex, exps.length);
        return exps;
      } else if (type == 'modelOutput') {
        var mos = ModelOutputs.find(selector, {sort: {name: 1}}).fetch();
        Session.set('valuesExist' + selectIndex, mos.length);
        return mos;
      } else if (type == 'analysis') {
        if (results && results.length)
          Session.set('valuesExist' + selectIndex, results.length);
        else
          Session.set('valuesExist' + selectIndex, 0);
        return results;
      } else return null;
    }
    else return null;


/*

    if( selectIndex > Session.get('analyses.clearIndex') ) var results = undefined;

    var type = Session.get('analyses.'+selectIndex+'.type');
    var previousIndex = selectIndex - 1;
    var previousType = Session.get('analyses.'+previousIndex+'.type');

    if( type == 'model' ) {
      if( previousType && previousType == 'experiment') {
        var experimentId = Session.get('analyses.experiment');
        var modelOutputs = ModelOutputs.find( {experiments:experimentId}, {fields: {model:1}} ).fetch();
//        console.log(modelOutputs[0]);
        var modelIdArray = [];
        for( var i=0; i < modelOutputs.length; ++i ) {
          var modelOutput = modelOutputs[i];
          modelIdArray.push(modelOutput.model);
        }
        var selector = {_id : {$in : modelIdArray}};
//        var models = Models.find({_id : {$in : modelIdArray}}, {sort: {name: 1}});
//        return models;
      }
      else if( previousType && previousType == 'modelOutput' ) {
        var modelOutputId = Session.get('analyses.modelOutput');
        if( modelOutputId ) {
          var modelOutput = ModelOutputs.findOne({_id:modelOutputId},{fields: {model:1}});
          if( modelOutput ) {
              var selector = {_id:modelOutput.model};
//            return Models.find({_id:modelOutput.model}, {sort: {name: 1}});
          }
        }
      }
      else if( previousType && previousType == 'analysis' ) {
        var analysisType = Session.get('analyses.analysis');
        var analysesWithType = Analyses.find({'results.type':analysisType}).fetch();
        var uniqueModelIds = new Array();
        var haveModelId;
        for( var i = 0; i < analysesWithType.length; ++i ) {
          var modelOutput = ModelOutputs.findOne({_id:analysesWithType[i].modelOutput});
          if( modelOutput && modelOutput.model ) {
            haveModelId = true;
            uniqueModelIds[modelOutput.model]=modelOutput.model;
          }
        }

        var modelIds = new Array();
        if( haveModelId ) {
          for( var key in uniqueModelIds ) {
            modelIds.push(key);
          }
          var selector = {_id : {$in : modelIds}};
//          var models = Models.find({_id : {$in : modelIds}});
//          return models;
        }
        else {
          var selector = {_id: null};
//          return new Array();
        }
      }
      else {
        var selector = {};
//        return Models.find();
      }
      var results = Models.find(selector, {sort: {name: 1}});
    }
    else if( type == 'experiment' ) {
      if( previousType && previousType == 'model') {
        var modelId = Session.get('analyses.model');
        var modelOutputs = ModelOutputs.find({'model':modelId},{fields: {experiments:1}}).fetch();
        var experimentIdArray = [];
        for( var i=0; i < modelOutputs.length; ++i ) {
          var modelOutput = modelOutputs[i];
          experimentIdArray.push(modelOutput.experiments[0]);
        }
        var selector = {_id : {$in : experimentIdArray}};
//        var experiments = Experiments.find({_id : {$in : experimentIdArray}});
//        return experiments;
      }
      else if( previousType && previousType == 'modelOutput') {
        var modelOutputId = Session.get('analyses.modelOutput');
        if( modelOutputId ) {
          var modelOutput = ModelOutputs.findOne({_id:modelOutputId},{fields: {experiment:1}});
          if( modelOutput ) {
            var selector = {_id:modelOutput.experiments[0]};
//            return Experiments.find({_id:modelOutput.experiments[0]});
          }
        }
      }
      else if( previousType && previousType == 'analysis' ) {
        var analysisType = Session.get('analyses.analysis');
        var analysesWithType = Analyses.find({'results.type':analysisType}).fetch();
        var uniqueExperiments = new Array();
        var haveExperiment;
        for( var i = 0; i < analysesWithType.length; ++i ) {
          var experiment = Experiments.findOne({_id:analysesWithType[i].experiment}, {sort: {name: 1}});
          if( experiment ) {
            haveExperiment = true;
            uniqueExperiments[experiment.id]=experiment;
          }
        }
        var experiments = new Array();
        if( haveExperiment ) {
          for( var key in uniqueExperiments ) {
            experiments.push(uniqueExperiments[key]);
          }
        }
        var selector = "na";
        var results = experiments;

      }
      else {
        var selector = {};
//        return Experiments.find();
      }
      if (selector != "na")
        var results = Experiments.find(selector, {sort: {name: 1}});
    }
    else if( type == 'modelOutput' ) {
      if( previousType && previousType == 'experiment') {
        var experimentId = Session.get('analyses.experiment');
        if( experimentId )
          var selector = {experiments:experimentId};
//         return ModelOutputs.find({experiments:experimentId});
      }
      else if( previousType && previousType == 'model') {
        var modelId = Session.get('analyses.model');
        if( modelId )
          var selector = {model: modelId};
//          return ModelOutputs.find({model:modelId});
      }
      else if( previousType && previousType == 'analysis' ) {
        var analysisType = Session.get('analyses.analysis');
        var analysesWithType = Analyses.find({'results.type':analysisType}).fetch();
        var uniqueModelOutputs = new Array();
        var haveModelOutput;
        for( var i = 0; i < analysesWithType.length; ++i ) {
          var modelOutput = ModelOutputs.findOne({_id:analysesWithType[i].modelOutput}, {sort: {name: 1}});
          if( modelOutput ) {
            haveModelOutput = true;
            uniqueModelOutputs[modelOutput.id]=modelOutput
          }
        }
        var modelOutputs = new Array();
        if( haveModelOutput ) {
          for( var key in uniqueModelOutputs ) {
            modelOutputs.push(uniqueModelOutputs[key]);
          }
        }
        var selector = "na";
        var results = modelOutputs;
      }
      else {
        var selector = {};
//        return ModelOutputs.find();
      }
      if (selector != "na")
        var results = ModelOutputs.find(selector);
    }
    else if( type == 'analysis' ) {
      if( previousType && previousType == 'modelOutput' ) {
        var modelOutputId = Session.get('analyses.modelOutput');
        if( modelOutputId ) {
          var analysis = Analyses.findOne({modelOutput:modelOutputId},{sort:{created:-1}});
          if( analysis && analysis.results ) {
            var results = analysis.results;
            for( var i=0; i < results.length; ++i ) {
              var result = results[i];
              result.name = result.type;
              result._id = result.type;
            }
//            return results;
          }
        }
      }
      else if( previousType && previousType == 'experiment' ) {
        var experimentId = Session.get('analyses.experiment');
        var modelOutputs = ModelOutputs.find({experiments:experimentId}).fetch();
        var results = Template.analyses.loadUniqueAnalysesFromModelOutputs(modelOutputs);
      }
      else if( previousType && previousType == 'model' ) {
        var modelId = Session.get('analyses.model');
        var modelOutputs = ModelOutputs.find({model:modelId}).fetch();
        var results = Template.analyses.loadUniqueAnalysesFromModelOutputs(modelOutputs);
      }
      else {
        var modelOutputs = ModelOutputs.find().fetch();
        var results = Template.analyses.loadUniqueAnalysesFromModelOutputs(modelOutputs);
      }
    }

//    console.log('SelectIndex: ', selectIndex)
//    console.log('Results: ', results);
    return results;
*/
/*    var justDragged = Session.get('justDragged');
    if (justDragged) {
      for (var i=toKey; i < 5; ++i) {
        $('#'+i.toString())[0].selectedIndex = -1;
      }
      Session.set('justDragged', null);
    }
*/
  },

  ifSelected: function(selectionId) {
    if (selectionId == Session.get('analyses.analysis')) {
      return {
        selected: "selected"
      }
    }
    else return null;
  },

  image: function() {
    var modelOutputId = Session.get('analyses.modelOutput');
    var analysisType = Session.get('analyses.analysis');
    var experimentId = Session.get('analyses.experiment');

//    if( modelOutputId && analysisType && experimentId ) {
    if( modelOutputId && analysisType ) {
      var selector = {modelOutput:modelOutputId, results: {'$exists': true}};
      if (experimentId)
        selector.experiment = experimentId;
    	var analysis = Analyses.findOne(selector);
//      console.log(analysis);
    	if( analysis && analysis.results ) {
		    for( var j=0; j < analysis.results.length; ++j ) {
			    var result = analysis.results[j];
                if( result.type === analysisType ) return result;
		    }
      }
    }
  },

  valuesExist: function(columnNum) {
    return Session.get('valuesExist' + columnNum);
  }

});

Template.analyses.loadUniqueAnalysesFromModelOutputs = function(modelOutputs) {
	var analyses = new Array();
  var analysesArray = new Array();
    for( var i=0; i < modelOutputs.length; ++i ) {
		var analysis = Analyses.findOne({modelOutput:modelOutputs[i]._id, results: {$exists: true}},{sort:{created:-1}});
		if( analysis && analysis.results ) {
		    var results = analysis.results;
		    for( var j=0; j < results.length; ++j ) {
			    var result = results[j];
			    result.name = result.type;
			    result._id = result.type;
			    analyses[result.name] = result;

          // need to fix this to be unique
          analysesArray.push(result);
		    }
	    }
	}
/*	var analysesArray = new Array();
	for( var key in analyses ) {
	    analysesArray.push(analyses[key]);
	}*/
	return analysesArray;
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

        // after changing the selection in one menu, blank out values in subsequent columns (but not the analysis column)
        for (var i = parseInt(key) + 1; i <= 3; ++i) {
          var colType = columnType(i);
          Session.set('analyses.' + colType, null);
//          var colObject = $('#' + i)[0];
//          colObject.selectedIndex = (colObject.length > 1) ? 0 : -1;
        }

/* this didn't work, because it tries to change the selected item before the menu is updated
        // try and set the analysis field to its current value if possible
        if (key != 4)
          $('#4')[0].value = Session.get('analyses.analysis');
*/
    },
    'dragstart .form-group':function(event) {
        event.originalEvent.dataTransfer.setData("id",event.target.id);
    },
    'dragover .form-group':function(event) {
        event.preventDefault();
    },
    'drop .form-group':function(event) {
        var id = event.originalEvent.dataTransfer.getData("id");
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

            var clearIndex = Math.min(toKey, fromKey);
            Session.set('analyses.clearIndex', clearIndex);

            for (var i = clearIndex; i <= 3; ++i) {
              var colType = columnType(i);
              Session.set('analyses.' + colType, null);
            }
//            Session.set('justDragged', Math.min(toKey,fromKey));
        }

//        for (var i=clearIndex; i < 5; ++i) {
//          $('#'+i.toString())[0].selectedIndex = -1;
//        }
    }
});
