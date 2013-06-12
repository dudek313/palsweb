var rootWorkspace = Workspaces.findOne({"name":"root"});
if( !rootWorkspace ) Workspaces.insert({"name": "root"});

var reference = Reference.findOne();
if( !reference ) {
    Reference.insert({
        'dataSetType' : ['flux tower','other'],
        'country' : ['Australia','World'],
        'vegType' : ['Evergreen broadleaf','urban'],
        'filePickerAPIKey' : 'AeyxZFgbpSHS6xZ5AfPJkz'
    });
}