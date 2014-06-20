var baseDir = '/vagrant/data/webappdata'
var palsDataDir = '/pals/data'

var fs = require('fs');
var uuid = require('node-uuid')

var postgres = function () {

    that = {};
    
    that.pg = require('pg');
    that.connectionString = "pg://postgres:password@localhost:5432/pals"

    function sql(query,callback) {
        that.pg.connect(that.connectionString,function(err,client){
            that.client = client;
            if(err) callback(err);
            else {
                var sqlStmt = "SELECT * FROM palsuser";
                client.query(query,null,function(err,result){
                    if( err ) console.log(err);
                    else callback(result,client);
                });
            }
        });
    }
    
    that.sql = sql;

    return that;
}

var mongo = function() {

    var that = {};
    that.mongo = require('mongodb');
    that.host = 'localhost';
    that.port = 81;
    that.db = new that.mongo.Db('meteor',new that.mongo.Server(that.host,that.port,[]),{fsync:true});

    function find(table,query,callback) {
        that.db.open(function(err,db){
           if(err) console.log(err);
           else {
               db.collection(table,function(err,collection){
                  if(err) console.log(err);
                  else {
                      collection.find(query,function(err,docs){
                         if(err) console.log(err);
                         else {
                             callback(docs,that.db);
                         }
                      });
                  }
               });
           }
        });
    };
    that.find = find;
    
    function findOne(table,query,callback) {
        that.db.open(function(err,db){
           if(err) console.log(err);
           else {
               db.collection(table,function(err,collection){
                  if(err) console.log(err);
                  else {
                      collection.findOne(query,function(err,doc){
                         if(err) console.log(err);
                         else {
                             that.db.close();
                             callback(doc,that.db);
                         }
                      });
                  }
               });
           }
        });
    };
    that.findOne = findOne;
    
    function insert(table,doc,callback) {
        that.db.open(function(err,db){
           if(err) console.log(err);
           else {
               db.collection(table,function(err,collection){
                  if(err) console.log(err);
                  else {
                      collection.insert(doc,function(err,result){
                         if(err) console.log(err);
                         else {
                             that.db.close();
                             callback();
                         }
                      });
                  }
               });
           }
        });
    };
    that.insert = insert;

    return that;
};

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", done);

  var wr = fs.createWriteStream(target);
  wr.on("error", done);
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

var pgInstance = postgres();

function loadUsers(mongoI,callback) {
    console.log('Loading Users');
    
    mongoI.find('users',{},function(docs,db){
        var users = {};
        docs.nextObject(function(err, doc){
            processUser(docs,err,doc,callback,users,db); 
        });
    })
}

function processUser(docs,err,doc,callback,users,db) {
    if( err ) {
        console.log(err);
        db.close();
        callback(users);
    }
    else if( !doc ) {
        db.close();
        callback(users);
    }
    else if( doc.username ) {
        users[doc.username] = doc;
    }
    if( doc ) {
        docs.nextObject(function(err,doc){
            processUser(docs,err,doc,callback,users,db);
        })
    }
}

function processDataSets(users,mongoInstance) {
    
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
    a.owner_username AS a_owner \
    FROM dataset as ds, datasetversion as dsv, analysable as a, country as c \
    WHERE dsv.id = ds.latestversion_id AND a.id = ds.id AND c.id = ds.country_id;";

    pgInstance.sql(loadDataSetsQuery,function(result,client){
        result.rows.forEach(function(row){
            //console.log(row);
            var filename = baseDir + '/' + row.ds_username + '/' + 'ds' + row.ds_id + '.' + row.dsv_id + '_flux.nc';
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
                                path : palsDataDir + '/' + newFilename,
                                filename : row.dsv_originalfilename,
                                size : stats['size'],
                                key : newFilename,
                                created : row.dsv_uploaddate
                            }
                            //console.log(fileData);
                            user = users[row.ds_username];
                            if( user ) {
                                copyDataSet(filename,fileData,row,user,mongoInstance);
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

function copyDataSet(filename,fileData,row,user,mongoInstance) {
    console.log('Copying data set: ' + row.a_name);
    copyFile(filename,fileData.path,function(err){
        if( err ) console.log(err);
        else {
            var dataSet = {
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
            //mongoInstance.insert('dataSet',dataSet);
        }
    });
}

// var mongoInstance = mongo();
// mongoInstance.find('users',{},function(docs,db){
//     docs.each(function(err,doc){
//        console.log(JSON.stringify(doc));
//     });
// })

function process() {
    
    var mongoInstance = mongo();
    loadUsers(mongoInstance,function(users) {
        processDataSets(users,mongoInstance);
    });
}

process();
