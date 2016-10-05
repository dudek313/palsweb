


var Fiber  = require('fibers')
var Future = require('fibers/future');

//var fs = require('fs-extra');
var fs = Future.wrap(require('fs-extra'));
var uuid = require('node-uuid')
var mooHelpers = require('./modelOutputs-migration.js')

//exports.migrateDataSets = function(oldDataDir, newDataDir, users,mongoInstance,workspaces,pgInstance,publicWorkspace) {
exports.migrateDataSets = function(oldDataDir, newDataDir, users,mongoInstance,workspaces,pgInstance) {

    console.log("Processing data sets");

    var loadDataSetsQuery =

    "SELECT \
        distinct e.id AS ds_id, \
        ds.comments AS ds_comments,\
        ds.datasettype AS ds_datasettype,\
        ds.downloadcount AS ds_downloadcount,\
        ds.elevation AS ds_elevation,\
        ds.latitude AS ds_latitude,\
        ds.longitude AS ds_longitude,\
        ds.maxvegheight AS ds_maxvegheight,\
        ds.measurementaggregation AS ds_measurementaggregation,\
        ds.refs AS ds_refs,\
        ds.timezoneoffsethours AS ds_timezoneoffsethours,\
        ds.towerheight AS ds_towerheight,\
        ds.url AS ds_url,\
        ds.username AS ds_username,\
        c.name AS country_name,\
        ds.vegtype_vegetationtype AS ds_vegtype,\
        ds.soiltype AS ds_soiltype,\
        ds.sitecontact AS ds_sitecontact,\
        ds.latestversion_id as latestversion_id,\
        dsv.id as dsv_id, \
        dsv.description AS dsv_description,\
        dsv.ispublic AS dsv_ispublic,\
        dsv.originalfilename AS dsv_originalfilename,\
        dsv.uploaddate AS dsv_uploaddate,\
        dsv.startdate AS dsv_startdate,\
        dsv.enddate AS dsv_enddate,\
        a.name as a_name,\
        a.status AS a_status,\
        a.owner_username AS a_owner, \
        dsv.ispublic AS dsv_ispublic,\
        e.experiment_id as e_id\
        FROM experimentable as e, datasetversion as dsv, dataset as ds, analysable as a, country as c\
        WHERE dsv.datasetid = e.id AND dsv.datasetid=ds.id AND\
        a.id=dsv.datasetid AND c.id = ds.country_id AND dsv.id = ds.latestversion_id AND\
        ((e.experiment_id = 35209 OR e.experiment_id = 19106) OR\
        (e.experiment_id IS NULL AND e.id IN (995,1004,997,4353,871,4113,5660,3993,6802,5630,7032,7002,6772,1003,994,4233,1005,4203,4083,4053,4143,4173)))\
        ORDER BY a.name;"

/*    mongoInstance.dropIndexes('dataSets',function(err){
        if(err) console.log(err)
        else {
          mongoInstance.dropIndexes('experiments', function(err){
            if(err) console.log(err)
            else {
*/
              pgInstance.sql(loadDataSetsQuery,function(result,client){
                  result.rows.forEach(function(row){
                      //console.log(row);
                      var filenameHead = row.dsv_originalfilename.substr(0, row.dsv_originalfilename.length - 4);

                      var metFilename = oldDataDir + '/' + row.ds_username + '/' + 'ds' + row.ds_id + '.' + row.dsv_id + '_met.nc';
                      var fluxFilename = oldDataDir + '/' + row.ds_username + '/' + 'ds' + row.ds_id + '.' + row.dsv_id + '_flux.nc';

                      var future = new Future;
                      processDataFile(metFilename, 'driving', true, newDataDir, filenameHead, row, users, workspaces, function(metFileData){
                          processDataFile(fluxFilename, 'evaluation', false, newDataDir, filenameHead, row, users, workspaces, function(fluxFileData) {
                              copyDataSet(row, users, metFileData, fluxFileData, mongoInstance, workspaces);
                          });
                      });
                  });

                  client.end();
              });
/*
            }
          });
        }

    });
*/
}


function processDataFile(filename, filetype, forDownload, newDataDir, filenameHead, row, users, workspaces, callback) {
  fs.exists(filename, function (exists) {
      if( exists ) {
          console.log('File exists: ' + filename);
          // copy the file
          var newFilename = uuid.v4();
          fs.stat(filename,function(err,stats){
              if( err ) {
                  console.log('could not stat ' + filename)
              }
              else {
                  var fileData = {
                      path : newDataDir + '/' + newFilename,
                      name : filenameHead + '_' + filetype + '.nc',
                      oldName: filename,
                      size : stats['size'],
                      key : newFilename,
                      createdAt : row.dsv_uploaddate,
                      type : filetype,
                      downloadable : forDownload,
                      _version : 1
                  }
                  console.log(fileData);
                  user = users[row.ds_username];
                  if( user ) {
                      copyDataFile(filename,fileData);
                      callback(fileData);

                  }
                  else console.log('Could not locate username ' + row.ds_username);
              }
          });
      }
      else {
        console.log('File does not exist: ' + filename);
      }
  });

}

//function copyDataSet(filename,fileData,row,user,mongoInstance,workspaces,publicWorkspace) {
function copyDataFile(filename,fileData,row) {
    console.log('Copying data file: ' + fileData.name + ' to ' + fileData.path);
    copyFile(filename,fileData.path,function(err){
        if( err ) console.log(err);
    });
}

function copyDataSet(row, users, metFileData, fluxFileData, mongoInstance, workspaces) {
    // creates a Data Set Parent and initial Data Set version in the DataSets collection
    console.log('Copying data set: ' + row.a_name);
    var user = users[row.ds_username];

    var dataSet = {
        _id : row.ds_id.toString(),
        created : row.dsv_uploaddate,
        name : row.a_name,
        _version : 1,
        spatialLevel : 'SingleSite',
        owner : user._id,
        comments : row.ds_comments,
        country : row.country_name,
        elevation : row.ds_elevation,
        lat : row.ds_latitude,
        lon : row.ds_longitude,
        maxVegHeight : row.ds_maxvegheight,
        "public" : true,
        references : row.ds_refs,
        siteContact : row.ds_sitecontact,
        soilType : row.ds_soiltype,
        url : row.ds_url,
        vegType : row.ds_vegtype,
        type : row.ds_datasettype,
        measurementAggregation : row.ds_measurementaggregation,
        utcOffset : row.ds_timezoneoffsethours,
        towerHeight : row.ds_towerheight,
        versionDescription : row.dsv_description,
        startdate : row.dsv_startdate,
        enddate : row.dsv_enddate,
        files: [metFileData, fluxFileData]
	/*experiments : [{id : row.ds_id.toString(), workspace : null}]*/
    }
/*
    if( row.e_id ) {
	experimentInstanceId = row.ds_id + 60000;
        dataSet.experiments.push({id : experimentInstanceId.toString(), workspace : row.e_id.toString()});
    }
*/
    mongoInstance.insert('dataSets',dataSet,function(err){
        if(err) {
            console.log(err);
        }

        else {
            console.log('Inserted Data Set: ' + dataSet.name);
            insertDefaultExperiment(dataSet, row, mongoInstance);
        }
    });
}

//function insertDefaultExperiment(dataSet,mongoInstance,publicWorkspace) {
function insertDefaultExperiment(dataSet, row, mongoInstance) {
  // Creates an experiment template corresponding to the Data Set being migrated

    var experimentTemplate = {
        _id : dataSet._id.toString(),
        name : dataSet.name,
        recordType : 'template',
        _version: 1,
        created : dataSet.created,
        spatialLevel : 'SingleSite',
        scripts : [{
            path : '/pals/data/SingleSiteExperiment.R',
            filename : 'SingleSiteExperiment.R',
            key : 'SingleSiteExperiment.R',
        }],
        dataSets : [{_id: dataSet._id, _version: null}],
        owner : dataSet.owner,
        country : dataSet.country,
        vegType : dataSet.vegType,
        shortDescription : dataSet.comments,
        longDescription : dataSet.references
    }


// if this data set came from within a workspace (other than the public one) create an experiment instance to associate it with
    console.log('experiment ID: ' + row.e_id);
    if( row.e_id !== null ) {
        var instanceId = uuid.v4();
        var experimentInstance = {
            _id : instanceId,
            name : dataSet.name,
            recordType : 'instance',
            _version : 1,
            templateId : experimentTemplate._id,
            templateVersion: 1,
            latest : true,
            createdAt : dataSet.created,
            modifiedAt : dataSet.created,
            spatialLevel : 'SingleSite',
            scripts : [{
                path : '/pals/data/SingleSiteExperiment.R',
                filename : 'SingleSiteExperiment.R',
                key : 'SingleSiteExperiment.R',
            }],
            dataSets : [{_id: dataSet._id, _version:1}],
            owner : dataSet.owner,
            country : dataSet.country,
            vegType : dataSet.vegType,
            shortDescription : dataSet.comments,
            longDescription : dataSet.references,
            workspace : row.e_id.toString(),
            versionDescription : 'Imported version'
        }

//        experimentTemplate.workspaces = [row.e_id.toString()];

        mongoInstance.insert('experiments',experimentInstance,function(err){
            if(err) console.log(err)
            else {
              console.log('Created Experiment Instance: ' + experimentInstance.name);
            }
        });
    }

    mongoInstance.insert('experiments',experimentTemplate,function(err){
        if(err) console.log(err)
        else {
          console.log('Created Experiment Template Version: ' + experimentTemplate.name);
        }
    });

//    if( dataSet.workspaces && dataSet.workspaces.length > 0 && dataSet.workspaces[0] == publicWorkspace._id) {
//    console.log(dataSet.name + ' included in ' + dataSet.workspaces.length + ' workspaces');

}

function copyFile(source, target, cb) {
    fs.copySync(source,target);
    cb();
}
