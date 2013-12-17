Template.analysis.analysis = function() {
    var currentAnalysisId = Session.get('currentAnalysisId');
    var currentAnalysis = Analyses.findOne({'_id':currentAnalysisId});
    return currentAnalysis;
}

/*
Template.analysis.helpers({
  stripes: function(array, fn, elseFn) {
  if (array && array.length > 0) {
    var buffer = "";
    for (var i = 0, j = array.length; i < j; i++) {
      var item = array[i];
 
      item.first = ( i == 0 ? true : false );
      item.third = (i % 3 == 0 ? true : false);
      item.last = ( i == j - 1 ? true : false);

      buffer += fn(item);
    }
 
    // return the finished buffer
    return buffer;
  }
  else {
    return elseFn();
  }
}
});
*/