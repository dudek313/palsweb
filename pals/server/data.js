var rootWorkspace = Workspaces.findOne({"name":"public"});
if( !rootWorkspace ) {
    Workspaces.insert({"name": "public"});
}
else {
    Workspaces.update(rootWorkspace,{"name":"public"});
}

/* Already included in both/collections.js
var reference = Reference.findOne();
if( !reference ) {
    Reference.insert({
        'dataSetType' : ['flux tower','reanalysis', 'remotely sensed', 'empirical', 'observational synthesis','other'],
        'country' : ['Andorra','United Arab Emirates','Afghanistan','Antigua and Barbuda','Anguilla','Albania','Armenia','Netherlands Antilles','Angola','Antarctica','Argentina','American Samoa','Austria','Australia','Aruba','Aland Islands','Azerbaijan','Bosnia and Herzegovina','Barbados','Bangladesh','Belgium','Burkina Faso','Bulgaria','Bahrain','Burundi','Benin','Saint Barthélemy','Bermuda','Brunei','Bolivia','Brazil','Bahamas','Bhutan','Bouvet Island','Botswana','Belarus','Belize','Canada','Cocos Islands','Democratic Republic of the Congo','Central African Republic','Republic of the Congo','Switzerland','Ivory Coast','Cook Islands','Chile','Cameroon','China','Colombia','Costa Rica','Cuba','Cape Verde','Christmas Island','Cyprus','Czech Republic','Germany','Djibouti','Denmark','Dominica','Dominican Republic','Algeria','Ecuador','Estonia','Egypt','Western Sahara','Eritrea','Spain','Ethiopia','Finland','Fiji','Falkland Islands','Micronesia','Faroe Islands','France','Gabon','United Kingdom','Grenada','Georgia','French Guiana','Guernsey','Ghana','Gibraltar','Greenland','Gambia','Guinea','Guadeloupe','Equatorial Guinea','Greece','South Georgia and the South Sandwich Islands','Guatemala','Guam','Guinea-Bissau','Guyana','Hong Kong','Heard Island and McDonald Islands','Honduras','Croatia','Haiti','Hungary','Indonesia','Ireland','Israel','Isle of Man','India','British Indian Ocean Territory','Iraq','Iran','Iceland','Italy','Jersey','Jamaica','Jordan','Japan','Kenya','Kyrgyzstan','Cambodia','Kiribati','Comoros','Saint Kitts and Nevis','North Korea','South Korea','Kuwait','Cayman Islands','Kazakhstan','Laos','Lebanon','Saint Lucia','Liechtenstein','Sri Lanka','Liberia','Lesotho','Lithuania','Luxembourg','Latvia','Libya','Morocco','Monaco','Moldova','Montenegro','Saint Martin','Madagascar','Marshall Islands','Macedonia','Mali','Myanmar','Mongolia','Macao','Northern Mariana Islands','Martinique','Mauritania','Montserrat','Malta','Mauritius','Maldives','Malawi','Mexico','Malaysia','Mozambique','Namibia','New Caledonia','Niger','Norfolk Island','Nigeria','Nicaragua','Netherlands','Norway','Nepal','Nauru','Niue','New Zealand','Oman','Panama','Peru','French Polynesia','Papua New Guinea','Philippines','Pakistan','Poland','Saint Pierre and Miquelon','Pitcairn','Puerto Rico','Palestinian Territory','Portugal','Palau','Paraguay','Qatar','Reunion','Romania','Serbia','Russia','Rwanda','Saudi Arabia','Solomon Islands','Seychelles','Sudan','Sweden','Singapore','Saint Helena','Slovenia','Svalbard and Jan Mayen','Slovakia','Sierra Leone','San Marino','Senegal','Somalia','Suriname','Sao Tome and Principe','El Salvador','Syria','Swaziland','Turks and Caicos Islands','Chad','French Southern Territories','Togo','Thailand','Tajikistan','Tokelau','East Timor','Turkmenistan','Tunisia','Tonga','Turkey','Trinidad and Tobago','Tuvalu','Taiwan','Tanzania','Ukraine','Uganda','United States Minor Outlying Islands','United States','Uruguay','Uzbekistan','Vatican','Saint Vincent and the Grenadines','Venezuela','British Virgin Islands','U.S. Virgin Islands','Vietnam','Vanuatu','Wallis and Futuna','Samoa','Yemen','Mayotte','South Africa','Zambia','Zimbabwe','Serbia and Montenegro'],
        'vegType' : ['Evergreen broadleaf','Deciduous needleleaf','Deciduous broadleaf','Mixed forest','Closed shrubland','Open shrubland','Woody savanna','Savanna','Grassland','Permanent wetland','Cropland','Urban','Cropland / natural vegetation mosaic','Snow / ice landscape','Barren / sparsely vegetated','Water bodies','Eucalypt Forest','Evergreen needleleaf'],
        'filePickerAPIKey' : 'AeyxZFgbpSHS6xZ5AfPJkz',
        'spatialLevel' : ['SingleSite', 'MultipleSite', 'Catchment', 'Regional', 'Global'],
        'timeStepSize' : ['single value','half-hourly','hourly','daily','monthly','annual'],
        'stateSelection' :['values measured at site','model spin-up on site data','default model initialisation','other'],
        'parameterSelection' : ['automated calibration','manual calibration','no calibration (model default values)','other'],
        'resolution' : ['0.01 deg','0.5 deg','1 deg','2 deg','Other']
    });
}
*/

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
