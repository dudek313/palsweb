Workspaces = new Meteor.Collection("workspaces");
DataSets = new Meteor.Collection("dataSets").vermongo({timestamps: true, userId: 'modifierId'});
DraftDataSets = new Meteor.Collection("draftDataSets");
Reference = new Meteor.Collection("reference");
Experiments = new Meteor.Collection("experiments").vermongo({timestamps: true, userId: 'modifierId'});
DraftExperiments = new Meteor.Collection("draftExperiments")
ModelOutputs = new Meteor.Collection("modelOutputs").vermongo({timestamps: true, userId: 'modifierId'});
Analyses = new Meteor.Collection("analyses");
Models = new Meteor.Collection("models");
Variables = new Meteor.Collection("variables");

AdminConfig = {
  name: 'My App',
  adminEmails: ['gabsun@gmail.com'],
  collections: {
    Workspaces: {},
    DataSets:{},
    DraftDataSets:{},
    Experiments:{},
    ModelOutputs:{},
    Analyses:{},
    Models:{},
  }
};

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

Docs = new Meteor.Collection("docs");

Docs.attachSchema(new SimpleSchema({
  name: {
    type: String
  },
  fileId: {
    type: String
/*
  }
  path: {
    type: String,
    optional: true
  },
  size: {
    type: Number,
    optional: true
  },
  key: {
    type: String,
    optional: true
  },
  date: {
    type: Date,
    optional: true
  },
  downloadable: {
    label: "Downloadable",
    type: Boolean,
    optional: true
  },
  type: {
    label: "Type",
    type: String,
    optional: true
*/
  }


}));

Files = new FS.Collection("files", {
  stores: [new FS.Store.FileSystem("files", {path: "/pals/data"})]
});

var reference = Reference.findOne();
if( !reference ) {
    Reference.insert({
        'dataSetType' : ['flux tower','reanalysis', 'remotely sensed', 'empirical', 'observational synthesis','other'],
        'country' : ['Andorra','United Arab Emirates','Afghanistan','Antigua and Barbuda','Anguilla','Albania','Armenia','Netherlands Antilles','Angola','Antarctica','Argentina','American Samoa','Austria','Australia','Aruba','Aland Islands','Azerbaijan','Bosnia and Herzegovina','Barbados','Bangladesh','Belgium','Burkina Faso','Bulgaria','Bahrain','Burundi','Benin','Saint Barthélemy','Bermuda','Brunei','Bolivia','Brazil','Bahamas','Bhutan','Bouvet Island','Botswana','Belarus','Belize','Canada','Cocos Islands','Democratic Republic of the Congo','Central African Republic','Republic of the Congo','Switzerland','Ivory Coast','Cook Islands','Chile','Cameroon','China','Colombia','Costa Rica','Cuba','Cape Verde','Christmas Island','Cyprus','Czech Republic','Germany','Djibouti','Denmark','Dominica','Dominican Republic','Algeria','Ecuador','Estonia','Egypt','Western Sahara','Eritrea','Spain','Ethiopia','Finland','Fiji','Falkland Islands','Micronesia','Faroe Islands','France','Gabon','United Kingdom','Grenada','Georgia','French Guiana','Guernsey','Ghana','Gibraltar','Greenland','Gambia','Guinea','Guadeloupe','Equatorial Guinea','Greece','South Georgia and the South Sandwich Islands','Guatemala','Guam','Guinea-Bissau','Guyana','Hong Kong','Heard Island and McDonald Islands','Honduras','Croatia','Haiti','Hungary','Indonesia','Ireland','Israel','Isle of Man','India','British Indian Ocean Territory','Iraq','Iran','Iceland','Italy','Jersey','Jamaica','Jordan','Japan','Kenya','Kyrgyzstan','Cambodia','Kiribati','Comoros','Saint Kitts and Nevis','North Korea','South Korea','Kuwait','Cayman Islands','Kazakhstan','Laos','Lebanon','Saint Lucia','Liechtenstein','Sri Lanka','Liberia','Lesotho','Lithuania','Luxembourg','Latvia','Libya','Morocco','Monaco','Moldova','Montenegro','Saint Martin','Madagascar','Marshall Islands','Macedonia','Mali','Myanmar','Mongolia','Macao','Northern Mariana Islands','Martinique','Mauritania','Montserrat','Malta','Mauritius','Maldives','Malawi','Mexico','Malaysia','Mozambique','Namibia','New Caledonia','Niger','Norfolk Island','Nigeria','Nicaragua','Netherlands','Norway','Nepal','Nauru','Niue','New Zealand','Oman','Panama','Peru','French Polynesia','Papua New Guinea','Philippines','Pakistan','Poland','Saint Pierre and Miquelon','Pitcairn','Puerto Rico','Palestinian Territory','Portugal','Palau','Paraguay','Qatar','Reunion','Romania','Serbia','Russia','Rwanda','Saudi Arabia','Solomon Islands','Seychelles','Sudan','Sweden','Singapore','Saint Helena','Slovenia','Svalbard and Jan Mayen','Slovakia','Sierra Leone','San Marino','Senegal','Somalia','Suriname','Sao Tome and Principe','El Salvador','Syria','Swaziland','Turks and Caicos Islands','Chad','French Southern Territories','Togo','Thailand','Tajikistan','Tokelau','East Timor','Turkmenistan','Tunisia','Tonga','Turkey','Trinidad and Tobago','Tuvalu','Taiwan','Tanzania','Ukraine','Uganda','United States Minor Outlying Islands','United States','Uruguay','Uzbekistan','Vatican','Saint Vincent and the Grenadines','Venezuela','British Virgin Islands','U.S. Virgin Islands','Vietnam','Vanuatu','Wallis and Futuna','Samoa','Yemen','Mayotte','South Africa','Zambia','Zimbabwe','Serbia and Montenegro'],
        'vegType' : ['Evergreen broadleaf','Deciduous needleleaf','Deciduous broadleaf','Mixed forest','Closed shrubland','Open shrubland','Woody savanna','Savanna','Grassland','Permanent wetland','Cropland','Urban','Cropland / natural vegetation mosaic','Snow / ice landscape','Barren / sparsely vegetated','Water bodies','Eucalypt Forest','Evergreen needleleaf','Other'],
        'filePickerAPIKey' : 'AeyxZFgbpSHS6xZ5AfPJkz',
        'spatialLevel' : ['SingleSite', 'MultipleSite', 'Catchment', 'Regional', 'Global'],
        'timeStepSize' : ['single value','half-hourly','hourly','daily','monthly','annual'],
        'stateSelection' :['values measured at site','model spin-up on site data','default model initialisation','other'],
        'parameterSelection' : ['automated calibration','manual calibration','no calibration (model default values)','other'],
        'resolution' : ['0.01 deg','0.5 deg','1 deg','2 deg','Other']
    });
}

ModelOutputs.attachSchema(new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  _version: {
    type: Number,
    optional: true
  },
  name: {
    type: String,
    label: "Name",
    optional: true
  },
  owner: {
    type: String,
    label: "Owner",
    optional: true
  },
  'experiments': {
    type: [String],
    optional: true
  },
  model: {
    type: String,
    label: "Model",
    optional: true
  },
  created: {
    type: Date,
    label: "Created",
    optional: true
  },
  parameterSelection: {
    type: String,
    label: "Parameter Selection",
    allowedValues: Reference.findOne().parameterSelection,
    optional: true
  },
  stateSelection: {
    type: String,
    label: "State Selection",
    allowedValues: Reference.findOne().stateSelection,
    optional: true
  },
  accessLevel: {
    type: String,
    label: "Access Level",
    optional: true
  },
  'files.$.path': {
    type: String,
    optional: true
  },
  'file.filename': {
    type: String,
    optional: true
  },
  'file.size': {
    type: Number,
    optional: true
  },
  'file.key': {
    type: String,
    optional: true
  },
  'file.created': {
    type: String,
    optional: true
  },
  comments: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    optional: true
  },
  benchmarks: {
    type: [String],
    optional: true
  }
}));

Models.attachSchema(new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    label: "Name"
  },
  owner: {
    type: String,
    label: "Owner",
    optional: true
  },
  created: {
    type: Date,
    label: "Created",
    optional: true
  },
  modified: {
    type: Date,
    label: "Last Modified",
    optional: true
  },
  url: {
    type: SimpleSchema.RegEx.Url,
    label: "URL",
    optional: true
  },
  references: {
    type: String,
    label: "References",
    optional: true
  },
  comments: {
    type: String,
    label: "Comments",
    optional: true
  }
}));

Experiments.attachSchema(new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    label: "Name"
  },
  recordType: {
    type: String,
    allowedValues: ['template', 'instance'],
    optional: true
  },
  owner: {
    type: String,
    optional: true
  },
  created: {
    type: Date,
    optional: true
  },
  modified: {
    type: Date,
    optional: true
  },
  country: {
    type: String,
    label: "Country",
    allowedValues: Reference.findOne().country,
    optional: true
  },
  vegType: {
    type: String,
    label: "IGBP Vegetation Type",
    allowedValues: Reference.findOne().vegType,
    optional: true
  },
  otherVegType: {
    type: String,
    label: "Other Vegetation Type",
    optional: true
  },
  spatialLevel: {
    type: String,
    label: "Spatial Level",
    allowedValues: Reference.findOne().spatialLevel
  },
  timeStepSize: {
    type: String,
    label: "Time Step Size",
    allowedValues: Reference.findOne().timeStepSize,
    optional: true
  },
  shortDescription: {
    type: String,
    label: "Short Description",
    optional: true
  },
  longDescription: {
    type: String,
    label: "Long Description",
    optional: true
  },
  region: {
    type: String,
    label: "Region",
    optional: true
  },
  resolution: {
    type: String,
    label: "Resolution",
    allowedValues: Reference.findOne().resolution,
    optional: true
  },
  _version: {
    type: Number,
    optional: true
  },
  versionDescription: {
    type: String,
    optional: true
  },
  'scripts.$.path': {
    type: String,
    optional: true
  },
  'scripts.$.filename': {
    type: String,
    optional: true
  },
  'scripts.$.key': {
    type: String,
    optional: true
  },
  'dataSets.$._id': {
    type: String,
    optional: true
  },
  'dataSets.$._version': {
    type: Number,
    optional: true
  },
  templateId: {
    type: String,
    optional: true
  },
  templateVersion: {
    type: Number,
    optional: true
  },
  workspace: {
    type: String,
    optional: true
  }
}));

dataSetSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    label: "Name",
    max: 50,
    index: true,
    unique: true
  },
  type: {
    type: String,
    label: "Type",
    allowedValues: Reference.findOne().dataSetType
  },
  createdAt: {
    type: Date,
    optional: true
  },
  modifiedAt: {
    type: Date,
    optional: true
  },
  spatialLevel: {
    type: String,
    label: "Spatial Resolution",
    allowedValues: Reference.findOne().spatialLevel
  },
  owner: {
    type: String,
    label: "Created By",
    optional: true
  },
  country: {
    type: String,
    label: "Country",
    allowedValues: Reference.findOne().country,
    optional: true
  },
  vegType: {
    type: String,
    label: "IGBP Vegetation Type",
    allowedValues: Reference.findOne().vegType,
    optional: true
  },
  otherVegType: {
    type: String,
    label: "Other Vegetation Type",
    optional: true
  },
  soilType: {
    type: String,
    label: "Soil Type",
    optional: true
  },
  url: {
    type: SimpleSchema.RegEx.Url,
    label: "Site Description URL",
    optional: true
  },
  lat: {
    type: Number,
    label: "Latitude (decimal)",
    min: -90,
    max: 90,
    decimal: true,
    optional: true
  },
  lon: {
    type: Number,
    label: "Longitude (decimal)",
    min: -180,
    max: 180,
    decimal: true,
    optional: true
  },
  elevation: {
    type: Number,
    label: "Elevation (m)",
    min: 0,
    decimal: true,
    optional: true
  },
  maxVegHeight: {
    type: Number,
    label: "Max Vegetation Height (m)",
    min: 0,
    decimal: true,
    optional: true
  },
  utcOffset: {
    type: Number,
    label: "UTC Offset (hours)",
    min: -12,
    max: 12,
    optional: true
  },
  siteContact: {
    type: String,
    label: "Site Contact",
    optional: true
  },
  references: {
    type: String,
    label: "References",
    optional: true
  },
  comments: {
    type: String,
    label: "Comments",
    optional: true
  },
  "variables.NEE": {
    type: Boolean,
    label: "NEE"
  },
  "variables.Qg": {
    type: Boolean,
    label: "Qg"
  },
  "variables.Qh": {
    type: Boolean,
    label: "Qh"
  },
  "variables.Qle": {
    type: Boolean,
    label: "Qle"
  },
  "variables.Rnet": {
    type: Boolean,
    label: "Rnet"
  },
  "variables.SWnet": {
    type: Boolean,
    label: "Swnet"
  },
  region: {
    type: String,
    label: "Region",
    optional: true
  },
  resolution: {
    type: String,
    label: "Resolution",
    allowedValues: Reference.findOne().resolution,
    optional: true
  },
  _version: {
    type: Number,
    optional: true
  },
  'files.$.path': {
    type: String,
    optional: true
  },
  'files.$.name': {
    type: String,
    optional: true
  },
  'files.$.size': {
    type: Number,
    optional: true
  },
  'files.$.key': {
    type: String,
    optional: true
  },
  'files.$.date': {
    type: Date,
    optional: true
  },
  'files.$.downloadable': {
    type: Boolean,
    optional: true
  },
  'files.$.type': {
    type: String,
    optional: true
  }
});

DataSets.attachSchema(dataSetSchema);
DraftDataSets.attachSchema(dataSetSchema);
