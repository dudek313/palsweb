var fs = require('fs-extra');
var uuid = require('node-uuid')



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
    (e.experiment_id = 35209 OR e.experiment_id IS NULL) AND\
    a.id=dsv.datasetid AND c.id = ds.country_id AND dsv.id = ds.latestversion_id;";

    mongoInstance.dropIndexes('dataSets',function(err){
        if(err) console.log(err)
        else {
          pgInstance.sql(loadDataSetsQuery,function(result,client){
              result.rows.forEach(function(row){
                  //console.log(row);
                  var filenameHead = row.dsv_originalfilename.substr(0, row.dsv_originalfilename.length - 4);
      
                  var metFilename = oldDataDir + '/' + row.ds_username + '/' + 'ds' + row.ds_id + '.' + row.dsv_id + '_met.nc';
                  var fluxFilename = oldDataDir + '/' + row.ds_username + '/' + 'ds' + row.ds_id + '.' + row.dsv_id + '_flux.nc';
      
                  var metFileData = processDataFile(metFilename, 'met', true, newDataDir, filenameHead, row, users, workspaces);
                  var fluxFileData = processDataFile(fluxFilename, 'flux', false, newDataDir, filenameHead, row, users, workspaces);
                  copyDataSet(row, users, metFileData, fluxFileData, mongoInstance, workspaces);
      
              });
              client.end();
          });
      }
        
    });
}
    

function processDataFile(filename, filetype, forDownload, newDataDir, filenameHead, row, users, workspaces) {
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
                      size : stats['size'],
                      key : newFilename,
                      created : row.dsv_uploaddate,
                      type : filetype,
                      downloadable : forDownload,
                      version : 1
                  }
                  //console.log(fileData);
                  user = users[row.ds_username];
                  if( user ) {
//                                copyDataSet(filename,fileData,row,user,mongoInstance,workspaces,publicWorkspace);
                      copyDataFile(filename,fileData);
                      return fileData;
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
    console.log('Copying data file: ' + fileData.name);
    copyFile(filename,fileData.path,function(err){
        if( err ) console.log(err);
    });
}

function copyDataSet(row, users, metFileData, fluxFileData, mongoInstance, workspaces) {
    // creates a Data Set Parent and initial Data Set version in the DataSets collection
    console.log('Copying data set: ' + row.a_name);
    var user = users[row.ds_username];

    var dataSetParent = {
        _id : row.ds_id.toString(),
        recordType : 'parent',
        created : row.dsv_uploaddate,
        name : row.a_name,
        latestVersion : 1,
        owner : user._id,
        experiments : [row.ds_id.toString()]
    }

    var dsversionId = row.ds_id + 60000;
    var dataSetVersion = {
        _id : dsversionId.toString(),
        recordType : 'version',
        created : row.dsv_uploaddate,
        name : row.a_name,
        version : 1,
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
    }

// HAVE TO FILL IN EXPERIMENT AND WORKSPACES DATA

/*    if( row.e_id ) {
        dataSet.workspaces = [row.e_id.toString()];
    }
    else {
//                dataSet.workspaces = [publicWorkspace._id.toString()];
        dataSet.workspaces = [];
    } */
    mongoInstance.insert('dataSets',dataSetParent,function(err){
        if(err) {
            console.log(err);
        }

        else {
            console.log('Inserted Data Set Parent: ' + dataSetParent.name);
            mongoInstance.insert('dataSets',dataSetVersion, function(err){
              if(err) {
                console.log(err);
              }
              else {
                  console.log('Inserted Data Set Version: ' + dataSetVersion.name)
//              else insertDefaultExperiment(dataSetParent,mongoInstance);
              }

            });
//			console.log('inserting experiment ' + dataSet.name);

        }
    });
}

//function insertDefaultExperiment(dataSet,mongoInstance,publicWorkspace) {
function insertDefaultExperiment(dataSet,mongoInstance) {
    var experiment = {
        _id : dataSet._id.toString(),
        name : dataSet.name,
        created : dataSet.created,
        spatialLevel : 'SingleSite',
        scripts : [{
            path : '/pals/data/SingleSiteExperiment.R',
            filename : 'SingleSiteExperiment.R',
            key : 'SingleSiteExperimnet.R',
        }],
        dataSets : [dataSet._id],
        owner : dataSet.owner,
        country : dataSet.country,
        vegType : dataSet.vegType,
        shortDescription : dataSet.comments,
        longDescription : dataSet.references
    }
//    if( dataSet.workspaces && dataSet.workspaces.length > 0 && dataSet.workspaces[0] == publicWorkspace._id) {
//    console.log(dataSet.name + ' included in ' + dataSet.workspaces.length + ' workspaces');
    if( dataSet.workspaces && dataSet.workspaces.length > 0)
        experiment.workspaces = dataSet.workspaces;
    mongoInstance.insert('experiments',experiment,function(err){
        if(err) console.log(err);
    });
    console.log('created experiment ' + dataSet.name);


}

function copyFile(source, target, cb) {
    fs.copySync(source,target);
    cb();
}

