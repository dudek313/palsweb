var fs = require('fs-extra');
var uuid = require('node-uuid')



exports.migrateDataSets = function(oldDataDir, newDataDir, users,mongoInstance,workspaces,pgInstance,publicWorkspace) {

    console.log("Processing data sets");

    var loadDataSetsQuery =

    "SELECT \
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
    ds.id AS ds_id,\
    c.name AS country_name,\
    ds.vegtype_vegetationtype AS ds_vegtype,\
    ds.soiltype AS ds_soiltype,\
    ds.sitecontact AS ds_sitecontact,\
    dsv.id as dsv_id, \
    dsv.description AS dsv_description,\
    dsv.ispublic AS dsv_ispublic,\
    dsv.originalfilename AS dsv_originalfilename,\
    dsv.uploaddate AS dsv_uploaddate,\
    dsv.startdate AS dsv_startdate,\
    dsv.enddate AS dsv_enddate,\
    a.name AS a_name,\
    a.status AS a_status,\
    a.owner_username AS a_owner, \
    e.experiment_id AS e_id \
    FROM dataset as ds, datasetversion as dsv, analysable as a, country as c, experimentable as e \
    WHERE dsv.id = ds.latestversion_id AND a.id = ds.id AND c.id = ds.country_id AND e.id = ds.id;";

    pgInstance.sql(loadDataSetsQuery,function(result,client){
        result.rows.forEach(function(row){
            //console.log(row);
            var filename = oldDataDir + '/' + row.ds_username + '/' + 'ds' + row.ds_id + '.' + row.dsv_id + '_flux.nc';
            fs.exists(filename, function (exists) {
                if( exists ) {
                    //console.log('File exsits: ' + filename);
                    // copy the file
                    var newFilename = uuid.v4();
                    fs.stat(filename,function(err,stats){
                        if( err ) {
                            console.log('could not stat ' + filename)
                        }
                        else {
                            var fileData = {
                                path : newDataDir + '/' + newFilename,
                                filename : row.dsv_originalfilename,
                                size : stats['size'],
                                key : newFilename,
                                created : row.dsv_uploaddate
                            }
                            //console.log(fileData);
                            user = users[row.ds_username];
                            if( user ) {
                                copyDataSet(filename,fileData,row,user,mongoInstance,workspaces,publicWorkspace);
                            }
                            else console.log('Could not locate username ' + row.ds_username);
                        }
                    });
                }
            });
        })
        client.end();
    });
}

function copyDataSet(filename,fileData,row,user,mongoInstance,workspaces,publicWorkspace) {
    console.log('Copying data set: ' + row.a_name);
    copyFile(filename,fileData.path,function(err){
        if( err ) console.log(err);
        else {
            var dataSet = {
                _id : row.ds_id.toString(),
                created : row.dsv_uploaddate,
                name : row.a_name,
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
                versions : [fileData]
            }
            if( row.e_id ) {
                dataSet.workspaces = [row.e_id.toString()];
            }
            else {
                dataSet.workspaces = [publicWorkspace._id.toString()];
            }
            mongoInstance.insert('dataSets',dataSet,function(err){
                if(err) {
                    console.log(err);
                    console.log('Trying with different name');
                    dataSet.name = dataSet.name + '.1';
                    mongoInstance.insert('dataSets',dataSet,function(err){
                        if( err ) console.log(err);
                        else insertDefaultExperiment(dataSet,mongoInstance,publicWorkspace);
                    });
                }
                else insertDefaultExperiment(dataSet,mongoInstance,publicWorkspace);
            });

        }
    });
}

function insertDefaultExperiment(dataSet,mongoInstance,publicWorkspace) {
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
    if( dataSet.workspaces && dataSet.workspaces.length > 0 && dataSet.workspaces[0] == publicWorkspace._id) {
        experiment.workspaces = dataSet.workspaces;
        mongoInstance.insert('experiments',experiment,function(err){
            if(err) console.log(err);
        });
    }

}

function copyFile(source, target, cb) {
    fs.copySync(source,target);
    cb();
}
