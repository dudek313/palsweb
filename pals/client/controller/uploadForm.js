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
      clientLog.info('Uploading file', currentFile, userId);
      var fileExtension = getFileExtension(currentFile);
      console.log('filetype: ', template.data);
      console.log('fileExtension', fileExtension);
      if (template.data.fileType == 'experiment script' && fileExtension != "R") {
        clientLog.error('Error: Only R files allowed', currentFile, userId);
        alert('Error: Only R files allowed');
      } else if(template.data != 'experiment script' && fileExtension != "nc") {
        clientLog.error('Error: Only NetCDF files allowed', currentFile, userId);
        alert('Error: Only NetCDF files allowed');
      } else {
        var userId = Meteor.userId();
        var upload = StoredFiles.insert({
          file: currentFile,
          streams: 'dynamic',
          chunkSize: 'dynamic'
        }, false);

        upload.on('start', function () {
          template.currentUpload.set(this);
        });

        upload.on('end', function (error, fileObj) {
          if (error) {
            clientLog.error('Error during upload', currentFile, userId);
            alert('Error during upload: ' + error);
          } else {
            clientLog.info('File "' + fileObj.name + '" successfully uploaded', fileObj , userId);
            alert('File "' + fileObj.name + '" successfully uploaded');

            var nameWithExtension = fileObj._id + '.' + fileObj.extension;

            if (template.data == 'dataSet') {
              var isDownloadable = document.getElementById('downloadable').checked;
              var fileType = $("input[type='radio'][name='fileType']:checked").val();
              var fileRecord = {
                path: fileObj.path,
                name: fileObj.name,
                downloadable: isDownloadable,
                size: fileObj.size,
                key: nameWithExtension,
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
                key: nameWithExtension,
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

    }
  }
});
