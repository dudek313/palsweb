var postgres = function () {

    that = {};
    
    that.pg = require('pg');
    that.connectionString = "pg://postgres:password@localhost:5432/pals"

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

var pgInstance = postgres();
pgInstance.connect(function(err){
    query = "select vegetationtype from vegetationtype";
    pgInstance.sql(query,function(result,client){
        output = '';
        result.rows.forEach(function(row){
            output += "'" + row.vegetationtype + "',";
        });
        console.log(output);
    });   
});