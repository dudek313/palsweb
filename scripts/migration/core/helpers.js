//var exports = module.exports = {};

var fs = require('fs-extra');
var uuid = require('node-uuid')

exports.postgres = function () {

    that = {};
    
    that.pg = require('pg');
    that.connectionString = "pg://postgres:postgres@172.17.0.15:5432/pals"

    function sql(query,callback) {
        that.client.query(query,null,function(err,result){
            if( err ) console.log(err);
            else callback(result,that.client);
        });
    }
    that.sql = sql;
    
    function connect(callback) {
        console.log('connecting to postgres');
        that.pg.connect(that.connectionString,function(err,client){
            that.client = client;
            console.log('connected to postgres');
            if(err) console.log(err);
            callback(err);
        });
    }
    that.connect = connect;
    
    function end() {
        if( that.pg ) {
            that.pg.end();
        }
    }
    that.end = end;

    return that;
}

exports.mongo = function() {

    var that = {};
    that.mongo = require('mongodb');
    that.host = '192.168.100.151';
    //DF: that.host = 'localhost';
    that.port = 27017;
    //DF: that.port = 81;
    that.db = new that.mongo.Db('meteor',new that.mongo.Server(that.host,that.port,[]),{fsync:true,journal : true});
    
    function connect(callback) {
        console.log('connecting to mongo');
        that.db.open(function(err,db){
            console.log('connected to mongo');
            if( err ) console.log(err);
            callback(err); 
        });
    };
    that.connect = connect;

    function find(table,query,callback) {
       that.db.collection(table,function(err,collection){
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
    };
    that.find = find;
   
    //function find2(table,query,callback
 
    function findOne(table,query,callback) {
       that.db.collection(table,function(err,collection){
          if(err) console.log(err);
          else {
              collection.findOne(query,function(err,doc){
                 if(err) console.log(err);
                 else {
                     callback(err,doc);
                 }
              });
          }
       });
    };
    that.findOne = findOne;
    
    function insert(table,doc,callback) {
       that.db.collection(table,function(err,collection){
          if(err) console.log(err);
          else {
              collection.insert(doc,{w:1},function(err,result){
                 callback(err);
              });
          }
       });
    };
    that.insert = insert;

    return that;
};


function copyFile(source, target, cb) {
    fs.copySync(source,target,cb);
    cb();
}


exports.loadUsers = function(mongoI,callback) {
    console.log('Loading Users');
    
    mongoI.find('users',{},function(docs,db){
        var users = {};
        docs.nextObject(function(err, doc){
            processUser(docs,err,doc,callback,users,db); 
        });
    })
}


function processUser(docs,err,doc,callback,users,db) {
    //console.log(doc);
    if( err ) {
        console.log(err);
        callback(err, users);
    }
    else if( !doc ) {
        callback(err, users);
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



exports.loadPgWorkspaces = function(pgInstance,callback) {

    var loadWorkspacesQuery = "SELECT id, name, owner_username from experiment";

    pgInstance.sql(loadWorkspacesQuery,function(result,client){
        var workspaces = [];
        result.rows.forEach(function(row){
            workspaces.push(row);
        });
        callback(false, workspaces);
    });
}



exports.loadPublicWorkspace = function(mongoInstance,callback) {
    mongoInstance.findOne('workspaces',{name:'public'},function(err,result){
       callback(err,result); 
    });
}


