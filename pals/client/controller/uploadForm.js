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
      var fileExtension = getFileExtension(currentFile);
      if (template.data.fileType == 'experiment script' && fileExtension != "R") {
        clientLog.error('Error: Only R files allowed', currentFile, userId)
        alert('Error: Only R files allowed');
      } else {
        var userId = Meteor.userId();
        var upload = StoredFiles.insert({
          file: currentFile,
          streams: 'dynamic',
          chunkSize: 'dynamic'
        }, false);

        upload.on('start', function () {
          template.currentUpload.set(this);
          clientLog.info('Uploading file', currentFile, userId);
        });

        upload.on('end', function (error, fileObj) {
          if (error) {
            clientLog.error('Error during upload', currentFile, userId);
            alert('Error during upload: ' + error);
          } else {
            clientLog.info('File "' + fileObj.name + '" successfully uploaded', fileObj , userId);
            alert('File "' + fileObj.name + '" successfully uploaded');
            var nameWithExtension = fileObj._id + '.' + fileObj.extension;

            if (template.data.fileType == 'experiment script') {
              var fileRecord = {
                path: fileObj.path,
                filename: fileObj.name,
                storedName: nameWithExtension,
                size: fileObj.size,
                key: fileObj._id,
                created: new Date()
              };
              var tempScripts = Session.get('tempScripts');
              tempScripts.push(fileRecord);
              Session.set('tempScripts', tempScripts);
            }
          }
          template.currentUpload.set(false);
        });

        upload.start();

      }

    }
  }
});
