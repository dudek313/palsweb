Template.analysis.analysis = function() {
    var currentAnalysisId = Session.get('currentAnalysisId');
    var currentAnalysis = Analyses.findOne({'_id':currentAnalysisId});
    return currentAnalysis;
}