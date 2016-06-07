var fs = require('fs-extra');
var uuid = require('node-uuid')


//exports.migrateModelOutputs = function(oldDataDir, newDataDir, users,mongoInstance,workspaces,pgInstance,publicWorkspace) {

exports.migrateModelOutputs = function(oldDataDir, newDataDir, users,mongoInstance,workspaces,pgInstance) {
    console.log("Processing model outputs");

    var loadModelOutputsQuery =

    "SELECT DISTINCT\
    mo.accesslevel as mo_accesslevel, \
    mo.modelid as mo_modelid, \
    mo.parameterselection as mo_parameterselection, \
    mo.stateselection as mo_stateselection, \
    mo.uploaddate as mo_uploaddate, \
    mo.username as mo_username, \
    mo.id as mo_id, \
    mo.usercomments as mo_usercomments, \
    dsv.id as dsv_id, \
    e.experiment_id AS e_id, \
    a.name AS a_name,\
    a2.name AS exp_name, \
    a.status AS a_status,\
    a.owner_username AS a_owner, \
    ds.id as ds_id, \
    a3.id as our_exp_id \
    FROM modeloutput as mo, datasetversion as dsv, datasetversion as dsv2, \
    dataset as ds, analysable as a, analysable as a2, analysable as a3, \
    experimentable as e, experimentable as e2 \
    WHERE ds.id IS NOT NULL AND dsv.id = mo.datasetversionid AND dsv.datasetid = ds.id \
    AND a.id = mo.id AND e.id = mo.id  AND a2.id = ds.id \
    AND (e2.experiment_id IS NULL OR e2.experiment_id = 35209) \
    AND dsv.id = ds.latestversion_id \
    AND a3.name = a2.name AND a3.id = e2.id AND a3.id=dsv2.datasetid \
    AND dsv2.datasetid=e2.id AND e.experiment_id IS NOT NULL\
    ORDER BY a.name ASC;";

/*    "SELECT \
    mo.accesslevel as mo_accesslevel, \
    mo.modelid as mo_modelid, \
    mo.parameterselection as mo_parameterselection, \
    mo.stateselection as mo_stateselection, \
    mo.uploaddate as mo_uploaddate, \
    mo.username as mo_username, \
    mo.id as mo_id, \
    mo.usercomments as mo_usercomments, \
    dsv.id as dsv_id, \
    e.experiment_id AS e_id, \
    a.name AS a_name,\
    a.status AS a_status,\
    a.owner_username AS a_owner, \
    ds.id as ds_id \
    FROM modeloutput as mo \
    INNER JOIN datasetversion as dsv \
    ON dsv.id = mo.datasetversionid \
    INNER JOIN dataset as ds \
    ON ds.id = dsv.datasetid \
    INNER JOIN analysable as a \
    ON a.id = mo.id \
    INNER JOIN experimentable as e \
    ON e.id = mo.id \
    WHERE e.experiment_id IS NOT NULL;";
*/
    pgInstance.sql(loadModelOutputsQuery,function(result,client){
        result.rows.forEach(function(row){
            var filename = oldDataDir + '/' + row.mo_username + '/' + 'mo' + row.mo_id + '.nc';

            console.log('Working on file: ' + filename)

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
                                filename : 'mo' + row.mo_id + '.nc',
                                size : stats['size'],
                                key : newFilename,
                                created : row.mo_uploaddate
                            }
                            console.log(fileData);
                            user = users[row.mo_username];
                            if( user ) {
				//console.log('Copying : ' + filename + ', ' + fileData)
                                copyModelOutput(filename,fileData,row,user,mongoInstance,workspaces);
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



numberOfCopies = 0;
maxCopies = 100;

function copyModelOutput(filename,fileData,row,user,mongoInstance,workspaces) {
    console.log('Copying model output: ' + row.a_name);
    copyFile(filename,fileData.path,function(err){
        if( err ) console.log(err);
        else {
            var modelOutput = {
                _id : uuid.v4(),
                comments : row.mo_usercomments,
                created : row.mo_uploaddate,
                model : row.mo_modelid.toString(),
                name : row.a_name,
                owner : user._id,
                parameterSelection : row.mo_parameterselection,
                stateSelection : row.mo_stateselection,
                accessLevel : row.mo_accesslevel,
                status : row.a_status,
                versions : [fileData],
                experiment : row.our_exp_id.toString()
            }
            if( row.e_id ) {
                modelOutput.workspaces = [row.e_id.toString()];
            }
            else {
                modelOutput.workspaces = [];
            }
//            console.log(modelOutput);
            mongoInstance.insert('modelOutputs',modelOutput,function(err){
                if(err) {
                    console.log(err);
                    console.log('Trying with different name');
                    modelOutput.name = modelOutput.name + '.1';
                    mongoInstance.insert('modelOutputs',modelOutput,function(err){
                        if( err ) console.log(err);
                    });
                }
            });

        }
    });
}


function copyFile(source, target, cb) {
    fs.copySync(source,target);
    cb();
}

