Workspaces = new Meteor.Collection("workspaces");
DataSets = new Meteor.Collection("dataSets").vermongo({timestamps: true, userId: 'modifierId'});
Experiments = new Meteor.Collection("experiments").vermongo({timestamps: true, userId: 'modifierId'});
ModelOutputs = new Meteor.Collection("modelOutputs").vermongo({timestamps: true, userId: 'modifierId'});
Analyses = new Meteor.Collection("analyses");
Models = new Meteor.Collection("models");
Variables = new Meteor.Collection("variables");

// Global Variables
DataSetType = ['flux tower','reanalysis', 'remotely sensed', 'empirical', 'observational synthesis','other'];
CountryNames = ['Afghanistan','Andorra','Antigua and Barbuda','Anguilla','Albania','Armenia','Angola','Antarctica','Argentina','American Samoa','Austria','Australia','Aruba','Aland Islands','Azerbaijan','Bosnia and Herzegovina','Barbados','Bangladesh','Belgium','Burkina Faso','Bulgaria','Bahrain','Burundi','Benin','Saint Barthélemy','Bermuda','Brunei','Bolivia','Brazil','Bahamas','Bhutan','Bouvet Island','Botswana','Belarus','Belize','Canada','Cocos Islands','Democratic Republic of the Congo','Central African Republic','Republic of the Congo','Switzerland','Ivory Coast','Cook Islands','Chile','Cameroon','China','Colombia','Costa Rica','Cuba','Cape Verde','Christmas Island','Cyprus','Czech Republic','Germany','Djibouti','Denmark','Dominica','Dominican Republic','Algeria','Ecuador','Estonia','Egypt','Western Sahara','Eritrea','Spain','Ethiopia','Finland','Fiji','Falkland Islands','Micronesia','Faroe Islands','France','Gabon','United Kingdom','Grenada','Georgia','French Guiana','Guernsey','Ghana','Gibraltar','Greenland','Gambia','Guinea','Guadeloupe','Equatorial Guinea','Greece','South Georgia and the South Sandwich Islands','Guatemala','Guam','Guinea-Bissau','Guyana','Hong Kong','Heard Island and McDonald Islands','Honduras','Croatia','Haiti','Hungary','Indonesia','Ireland','Israel','Isle of Man','India','British Indian Ocean Territory','Iraq','Iran','Iceland','Italy','Jersey','Jamaica','Jordan','Japan','Kenya','Kyrgyzstan','Cambodia','Kiribati','Comoros','Saint Kitts and Nevis','North Korea','South Korea','Kuwait','Cayman Islands','Kazakhstan','Laos','Lebanon','Saint Lucia','Liechtenstein','Sri Lanka','Liberia','Lesotho','Lithuania','Luxembourg','Latvia','Libya','Morocco','Monaco','Moldova','Montenegro','Saint Martin','Madagascar','Marshall Islands','Macedonia','Mali','Myanmar','Mongolia','Macao','Northern Mariana Islands','Martinique','Mauritania','Montserrat','Malta','Mauritius','Maldives','Malawi','Mexico','Malaysia','Mozambique','Namibia','New Caledonia','Niger','Norfolk Island','Nigeria','Nicaragua','Netherlands','Netherlands Antilles','Norway','Nepal','Nauru','Niue','New Zealand','Oman','Panama','Peru','French Polynesia','Papua New Guinea','Philippines','Pakistan','Poland','Saint Pierre and Miquelon','Pitcairn','Puerto Rico','Palestinian Territory','Portugal','Palau','Paraguay','Qatar','Reunion','Romania','Serbia','Russia','Rwanda','Saudi Arabia','Solomon Islands','Seychelles','Sudan','Sweden','Singapore','Saint Helena','Slovenia','Svalbard and Jan Mayen','Slovakia','Sierra Leone','San Marino','Senegal','Somalia','Suriname','Sao Tome and Principe','El Salvador','Syria','Swaziland','Turks and Caicos Islands','Chad','French Southern Territories','Togo','Thailand','Tajikistan','Tokelau','East Timor','Turkmenistan','Tunisia','Tonga','Turkey','Trinidad and Tobago','Tuvalu','Taiwan','Tanzania','Ukraine','Uganda','United Arab Emirates','United States Minor Outlying Islands','United States','Uruguay','Uzbekistan','Vatican','Saint Vincent and the Grenadines','Venezuela','British Virgin Islands','U.S. Virgin Islands','Vietnam','Vanuatu','Wallis and Futuna','Samoa','Yemen','Mayotte','South Africa','Zambia','Zimbabwe','Serbia and Montenegro'];
VegType = ['Evergreen broadleaf','Deciduous needleleaf','Deciduous broadleaf','Mixed forest','Closed shrubland','Open shrubland','Woody savanna','Savanna','Grassland','Permanent wetland','Cropland','Urban','Cropland / natural vegetation mosaic','Snow / ice landscape','Barren / sparsely vegetated','Water bodies','Eucalypt Forest','Evergreen needleleaf','Other'];
FilePickerAPIKey = 'AeyxZFgbpSHS6xZ5AfPJkz';
SpatialLevel = ['SingleSite', 'MultipleSite', 'Catchment', 'Regional', 'Global'];
TimeStepSize = ['single value','half-hourly','hourly','daily','monthly','annual'];
StateSelection = ['values measured at site','model spin-up on site data','default model initialisation','other'];
ParameterSelection = ['automated calibration','manual calibration','no calibration (model default values)','other'];
Resolution = ['0.01 deg','0.5 deg','1 deg','2 deg','Other'];

/* Code for yogiben:admin package - package currently not being used
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
};*/

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


Files = new FS.Collection("files", {
  stores: [new FS.Store.FileSystem("files", {path: "/pals/data"})]
});

this.NcdfFiles = new FilesCollection({
  collectionName: 'NcdfFiles',
  storagePath: '/pals/data',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    // Allow upload of nc and r files only
    if (/nc/i.test(file.extension)) {
      return true;
    } else {
      return 'Only NetCDF files allowed';
    }
  }
});

this.RFiles = new FilesCollection({
  collectionName: 'RFiles',
  storagePath: '/pals/data',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    // Allow upload of nc and r files only
    if (/R/i.test(file.extension)) {
      return true;
    } else {
      return 'Only R files allowed';
    }
  }
});

if (Meteor.isClient) {
  Meteor.subscribe('files.ncdfFiles.all');
}

if (Meteor.isServer) {
  Meteor.publish('files.ncdfFiles.all', function() {
    return NcdfFiles.collection.find().cursor;
  });
}

if (Meteor.isClient) {
  Meteor.subscribe('files.rFiles.all');
}

if (Meteor.isServer) {
  Meteor.publish('files.rFiles.all', function() {
    return RFiles.collection.find().cursor;
  });
}

ModelOutputs.attachSchema(new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if (this.isInsert) {
        return Random.id()
      }
    }
  },
  _version: {
    type: Number,
    label: "Version",
    autoValue: function() {
      if (this.isInsert) {
        return 1
      }
    }
  },
  name: {type: String, label: "Name", optional: true},
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "Created By",
    autoValue: function() {
      if (this.isInsert) {
        return Meteor.userId()
      }
    }
  },
  'experiments':    {type: [String], optional: true},
  model:            {type: String, label: "Model", optional: true},
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date()
      }
    }
  },
  modifiedAt: {
    type: Date,
    optional: true,
    label: "Last modified"
/*    autoValue: function() {
      if (this.isUpdate) {
        return new Date()
      }
    }*/
  },
  modifierId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "Modified By",
    optional: true
  },
  parameterSelection: {type: String, label: "Parameter Selection",
                    allowedValues: ParameterSelection, optional: true},
  stateSelection:   {type: String, label: "State Selection",
                    allowedValues: StateSelection, optional: true},
  accessLevel:      {type: String, label: "Access Level", optional: true},
  'file.path':      {type: String, optional: true},
  'file.filename':  {type: String, optional: true},
  'file.size':      {type: Number, optional: true},
  'file.key':       {type: String, optional: true},
  'file.created':   {type: String, optional: true},
  comments:         {type: String, optional: true},
  status:           {type: String, optional: true},
  benchmarks:       {type: [String], optional: true}
}));

modelSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if (this.isInsert) {
        return Random.id()
      }
    }
  },
  name:       {type: String, label: "Name"},
  _version: {
    type: Number,
    label: "Version",
    autoValue: function() {
      if (this.isInsert) {
        return 1
      }
    }
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "Created By",
    autoValue: function() {
      if (this.isInsert) {
        return Meteor.userId()
      }
    }
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date()
      }
    }
  },
  modifiedAt: {
    type: Date,
    optional: true,
    label: "Last modified"
  },
  modifierId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "Modified By",
    optional: true
/*    autoValue: function() {
      if (this.isUpdate) {
        return Meteor.userId()
      }
    }*/
  },
  url:        {type: String, regEx: SimpleSchema.RegEx.Url, label: "URL", optional: true},
  references: {type: String, label: "References", optional: true},
  comments:   {type: String, label: "Comments", optional: true}
});

Models.attachSchema(modelSchema);

Experiments.attachSchema(new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if (this.isInsert) {
        return Random.id()
      }
    }
  },
  name:         {type: String, label: "Name"},
  recordType:   {type: String, allowedValues: ['template', 'instance'], optional: true},
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "Created By",
    autoValue: function() {
      if (this.isInsert) {
        return Meteor.userId()
      }
    }
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date()
      }
    }
  },
  modifiedAt: {
    type: Date,
    optional: true,
    label: "Last modified"
  },
  modifierId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "Modified By",
    optional: true
  },
  country:      {type: String, label: "CountryNames", allowedValues: CountryNames, optional: true},
  vegType:      {type: String, label: "IGBP Vegetation Type", allowedValues: VegType, optional: true},
  otherVegType: {type: String, label: "Other Vegetation Type", optional: true},
  spatialLevel: {type: String, label: "Spatial Level", allowedValues: SpatialLevel},
  timeStepSize: {type: String, label: "Time Step Size", allowedValues: TimeStepSize, optional: true},
  shortDescription:     {type: String, label: "Short Description", optional: true},
  longDescription:      {type: String, label: "Long Description", optional: true},
  region:       {type: String, label: "Region", optional: true},
  resolution:   {type: String, label: "Resolution", allowedValues: Resolution, optional: true},
  _version: {
    type: Number,
    label: "Version",
    autoValue: function() {
      if (this.isInsert) {
        return 1
      }
    }
  },
  versionDescription:   {type: String, optional: true},
  'scripts.$.path':     {type: String, optional: true},
  'scripts.$.filename': {type: String, optional: true},
  'scripts.$.key':      {type: String, optional: true},
  'dataSets.$._id':     {type: String, optional: true},
  'dataSets.$._version':    {type: Number, optional: true},
  templateId:   {type: String, optional: true},
  templateVersion: {type: Number, optional: true},
  workspace: {type: String, optional: true}
}));

dataSetSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if (this.isInsert) {
        return Random.id()
      }
    }
  },
  name:           {type: String, label: "Name", unique: true},
  type:           {type: String, label: "Type", allowedValues: DataSetType},
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date()
      }
    }
  },
  modifiedAt: {
    type: Date,
    optional: true,
    label: "Last modified"
  },
  spatialLevel:   {type: String, label: "Spatial Resolution", allowedValues: SpatialLevel},
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "Created By",
    autoValue: function() {
      if (this.isInsert) {
        return Meteor.userId()
      }
    }
  },
  country:        {type: String, label: "CountryNames", allowedValues: CountryNames, optional: true},
  vegType:        {type: String, label: "IGBP Vegetation Type",
                  allowedValues: VegType, optional: true},
  otherVegType:   {type: String, label: "Other Vegetation Type", optional: true},
  soilType:       {type: String, label: "Soil Type", optional: true},
  url:            {type: String, regEx: SimpleSchema.RegEx.Url, label: "Site Description URL", optional: true},
  lat:            {type: Number, label: "Latitude (decimal)", min: -90, max: 90,
                  decimal: true, optional: true},
  lon:            {type: Number, label: "Longitude (decimal)", min: -180,
                  max: 180, decimal: true, optional: true},
  elevation:      {type: Number, label: "Elevation (m)", min: 0, decimal: true, optional: true},
  maxVegHeight:   {type: Number, label: "Max Vegetation Height (m)", min: 0, decimal: true, optional: true},
  utcOffset:      {type: Number, label: "UTC Offset (hours)", min: -12, max: 12, optional: true},
  siteContact:    {type: String, label: "Site Contact", optional: true},
  references:     {type: String, label: "References", optional: true},
  comments:       {type: String, label: "Comments", optional: true},
  "variables.NEE":  {type: Boolean, label: "NEE"},
  "variables.Qg":   {type: Boolean, label: "Qg"},
  "variables.Qh":   {type: Boolean, label: "Qh"},
  "variables.Qle":  {type: Boolean, label: "Qle"},
  "variables.Rnet": {type: Boolean, label: "Rnet"},
  "variables.SWnet":    {type: Boolean, label: "Swnet"},
  region:         {type: String, label: "Region", optional: true},
  resolution:     {type: String, label: "Resolution", allowedValues: Resolution, optional: true},
  _version: {
    type: Number,
    label: "Version",
    autoValue: function() {
      if (this.isInsert) {
        return 1
      }
    }
  },
  'files.$.created':  {type: Date, optional: true},
  'files.$.path': {type: String, optional: true},
  'files.$.name': {type: String, optional: true},
  'files.$.size': {type: Number, optional: true},
  'files.$.key':  {type: String, optional: true},
  'files.$.downloadable':   {type: Boolean, optional: true},
  'files.$.type': {type: String, optional: true},
/*  'files.$.file': {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'StoredFiles'
      }
    }
  }*/
  modifierId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "Modified By",
    optional: true
  }

});

DataSets.attachSchema(dataSetSchema);
//DraftDataSets.attachSchema(dataSetSchema);

/*Schema = {};

Schema.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        optional: true
    },
    lastName: {
        type: String,
        optional: true
    },
    birthday: {
        type: Date,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    organization : {
        type: String,
        optional: true
    },
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    bio: {
        type: String,
        optional: true
    },
    country: {
        type: String,
        optional: true
    }
});

Schema.User = new SimpleSchema({
    username: {
        type: String,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    emails: {
        type: Array,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schema.UserProfile,
        optional: true
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
        type: Date,
        optional: true
    }
});

Meteor.users.attachSchema(Schema.User);
*/
