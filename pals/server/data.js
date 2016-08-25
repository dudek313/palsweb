var browseWorkspace = Workspaces.findOne({"name":"browsing"});
if( !browseWorkspace ) {
    Workspaces.insert({"name": "browsing", public: false});
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
