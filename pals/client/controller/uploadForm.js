Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
});

Template.uploadForm.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  }
});

function getFileExtension(file) {
  if (file && file.name) {
    return file.name.substr(file.name.lastIndexOf('.')+1);
  } else {
    return null;
  }
}

Template.uploadForm.events({
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected

      var currentFile = e.currentTarget.files[0];
      serverLog.info('Uploading file', e.currentTarget.files[0], userId);
      var fileExtension = getFileExtension(currentFile);
      if (template.data == 'experiment script' || template.data == 'dataSet' || template.data == 'modelOutput' ) {
        if (template.data == 'experiment script' && fileExtension != "R") {
          serverLog.error('Error: Only R files allowed', currentFile, userId);
          alert('Error: Only R files allowed');
        } else if(template.data != 'experiment script' && fileExtension != "nc") {
          serverLog.error('Error: Only NetCDF files allowed', currentFile, userId);
          alert('Error: Only NetCDF files allowed');
        } else {
          var userId = Meteor.userId();
          var dirtyValue = (template.data != 'experiment script') ? true : false; // experiment scripts won't use dirty flag

          if (template.data == 'dataSet')
          var fileCollection = DataSetFiles;
          else if (template.data == 'modelOutput')
          var fileCollection = ModelOutputFiles;
          else if (template.data == 'experiment script')
          var fileCollection = ScriptFiles;
          var upload = fileCollection.insert({
            file: currentFile,
            streams: 'dynamic',
            chunkSize: 'dynamic',
            meta: {
              dirty: dirtyValue
            }
          }, false);

          upload.on('start', function () {
            template.currentUpload.set(this);
          });

          upload.on('end', function (error, fileObj) {
            if (error) {
              serverLog.error('Error during upload', currentFile, userId);
              alert('Error during upload: ' + error);
            } else {
              serverLog.info('File "' + fileObj.name + '" successfully uploaded', getDetails(fileObj) , userId);
              alert('File "' + fileObj.name + '" successfully uploaded');

              //            var nameWithExtension = fileObj._id + '.' + fileObj.extension;

              if (template.data == 'dataSet') {
                var isDownloadable = document.getElementById('downloadable').checked;
                var fileType = $("input[type='radio'][name='fileType']:checked").val();
                var fileRecord = {
                  path: fileObj.path,
                  name: fileObj.name,
                  downloadable: isDownloadable,
                  size: fileObj.size,
                  key: fileObj._id,
                  created: new Date(),
                  type: fileType
                };
                var tempFiles = Session.get('tempFiles');
                tempFiles.push(fileRecord);
                Session.set('tempFiles', tempFiles);
                Session.set('uploadButtonClicked', false);
              }
              else {
                var fileRecord = {
                  path: fileObj.path,
                  filename: fileObj.name,
                  size: fileObj.size,
                  key: fileObj._id,
                  created: new Date(),
                };

                switch(template.data) {
                  case 'experiment script':
                  var tempScripts = Session.get('tempScripts');
                  tempScripts.push(fileRecord);
                  Session.set('tempScripts', tempScripts);
                  break;

                  case 'modelOutput':
                  Session.set('tempFile', fileRecord);
                  break;
                }
              }
            }
            template.currentUpload.set(false);
          });

          upload.start();

        }

      } else {
        alert("System Error: No file type specified for upload");
        serverLog.info('Error: No file type specified for upload', currentFile, userId);
      }


    }
  }
});
