var rootWorkspace = Workspaces.findOne({"name":"public"});
if( !rootWorkspace ) { 
    Workspaces.insert({"name": "public"});
}
else {
    Workspaces.update(rootWorkspace,{"name":"public"});
}

var reference = Reference.findOne();
if( !reference ) {
    Reference.insert({
        'dataSetType' : ['flux tower','reanalysis', 'remotely sensed', 'empirical', 'observational synthesis','other'],
        'country' : ['Australia','World'],
        'vegType' : ['Evergreen broadleaf','urban'],
        'filePickerAPIKey' : 'AeyxZFgbpSHS6xZ5AfPJkz',
        'spatialLevel' : ['SingleSite', 'MultipleSite', 'Catchment', 'Regional', 'Global'],
        'timeStepSize' : ['hourly','daily','monthly','yearly'],
        'stateSelection' :['values measured at site','model spin-up on site data','default model initialisation','other'],
        'parameterSelection' : ['automated calibration','manual calibration','no calibration (model default values)','other']
    });
}