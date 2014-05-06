Workspaces = new Meteor.Collection("workspaces");
DataSets = new Meteor.Collection("dataSets");
Reference = new Meteor.Collection("reference");
Experiments = new Meteor.Collection("experiments");
ModelOutputs = new Meteor.Collection("modelOutputs");
Analyses = new Meteor.Collection("analyses");
Models = new Meteor.Collection("models");
Variables = new Meteor.Collection("variables");

GetCollectionByName = function(name) {
    switch(name) {
        case 'DataSets':
            return DataSets;
            break;
        case 'Models':
            return Models;
            break;
    }
}