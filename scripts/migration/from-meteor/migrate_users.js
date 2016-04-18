var Fiber = Npm.require('fibers');

var postgres = function () {

    that = {};
    
    that.pg = Npm.require('pg');
    that.connectionString = "pg://docker:docker@192.168.56.101:32772/docker"
    //DF: that.connectionString = "pg://postgres:password@localhost:5432/pals"

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

var pgInstance = postgres();
pgInstance.sql("SELECT * FROM palsuser,institution where palsuser.institution_id = institution.id",function(result,client){
    result.rows.forEach(function(row){
        Fiber(function(){
            // var user = Meteor.users.findOne({username:row.username},Meteor.bindEnvironment(function(error,result) {
//                 if( error ) {
//                     console.log(error);
//                 }
//             },function(e){console.log(e)}));
//            if( !user ) {
                // user doesn't exist, we create the user
                console.log('creating user ' + row.username);
                if( row.username != 'axel' ) {
                    try
                    {
                        var newUser = Accounts.createUser({
			    username: row.username,
                            email: row.email,
                            password: 'password',
                            profile: {
				fullname: row.fullname,
                                shortname: row.shortname,
                                institution: row.name,
                                researchinterest: row.researchinterest,
                                showemail: row.showemail,
                                isadmin: row.isadmin
                            }
                        });
                    }
                    catch(ex) {
                        console.log(ex);
                        console.log('duplcate user: ' + row.email + ' ' + row.username);
/*			var new_email = row.email + '1';
			var new_fullname = 
			console.log('will try to store as: ' + new_email + ' ' + row.username);
			try
			{
	                    var newUser = Accounts.createUser({
                                email: new_email,
                                password: 'password',
                                profile: {
				    username: row.username,
                                    fullname: row.fullname,
                                    shortname: row.shortname,
                                    institution: row.name,
                                    researchinterest: row.researchinterest,
                                    showemail: row.showemail,
                                    isadmin: row.isadmin
                                }
                           });
			}
			catch(ex) {
				console.log(ex);
				console.log('unable to store user: ' + row.username);
			}
*/  
   		   }
               }
            // }
            // else {
            //     console.log('user already exists ' + row.username);
            // }
        }).run();
    })
    client.end();
});
