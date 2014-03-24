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
        'timeStepSize' : ['single value','half-hourly','hourly','daily','monthly','annual'],
        'stateSelection' :['values measured at site','model spin-up on site data','default model initialisation','other'],
        'parameterSelection' : ['automated calibration','manual calibration','no calibration (model default values)','other'],
        'resolution' : ['0.01 deg','0.5 deg','1 deg','2 deg','Other']
    });
}

var variablesCursor = Variables.find();
if( variablesCursor ) {
    var numberOfVariables = variablesCursor.count();
    if( numberOfVariables <= 0 ) {
        Variables.insert({"name":"NEE"});
        Variables.insert({"name":"Qg"});
        Variables.insert({"name":"Qh"});
        Variables.insert({"name":"Qle"});
        Variables.insert({"name":"Rnet"});
        Variables.insert({"name":"SWnet"});
    }
}

Meteor.users.update({"_id": "LFFr5uEgNAog6XDYL"}, {$set: {admin: 'true'}})