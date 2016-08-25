if( typeof templateSharedObjects === 'undefined' ) templateSharedObjects = {};

templateSharedObjects.progress = function(spec) {
    var that = {};
    
    var progressClass = '.progress';
    var progressBarClass = '.progress-bar';
    var progressAttribute = 'aria-valuenow';
    
    function readerProgress(pr) {
        if(pr.lengthComputable) {
            var max = pr.total;
            var value = pr.loaded;
            var percentage = (value/max)*100;
            setProgress(percentage); 
        }
    }
    that.readerProgress = readerProgress;

    function showProgress() {
        setProgress(0);
         $(progressClass).show();
    };
    that.showProgress = showProgress;

    function setProgress(percentage) {
        var progressBar = $(progressBarClass);
        progressBar.attr(progressAttribute,percentage);
        var width = percentage+'%';
        progressBar.css('width',width);
    }
    that.setProgress = setProgress;
    
    function hide() {
        $(progressClass).hide();
    }
    that.hide = hide;
    
    return that;
};