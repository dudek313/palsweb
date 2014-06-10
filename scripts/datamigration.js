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

// var pgInstance = postgres();
// pgInstance.sql("SELECT * FROM palsuser",function(result,client){
//     console.log(result);
//     client.end();
// });

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
    
    return that;
};

var mongoInstance = mongo();
mongoInstance.find('experiments',{},function(docs,db){
    docs.each(function(err,doc){
       console.log(JSON.stringify(doc)); 
    });
})
