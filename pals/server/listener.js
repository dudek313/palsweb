var Fiber = Npm.require('fibers');

if (Meteor.isServer) { Meteor.startup(function () {

var redis = Npm.require('redis');
var queue = 'pals.output';
var client = redis.createClient();

process.setMaxListeners(0);

function processNext() {
	client.lpop(queue,function(err,value){
	    if( value ) {
			console.log('Received message');
	    	handleMessage(JSON.parse(value));
	    }	
		setTimeout(processNext, 1000);
	});
}

function handleMessage(message) {
    console.log(JSON.stringify(message));
    var selector = {'_id':message._id};
    var change = {};
    if( message.error ) {
        change.error = message.error;
        change.status = 'error';
    }
    else {
       change.results = message.files;
       change.status = 'complete';
    }
    var modifier = {'$set':change};
    Fiber(function(){
    Analyses.update(selector,modifier,Meteor.bindEnvironment(function(error) { 
        if( error ) {
            console.log('There was an error setting the value: ' + JSON.stringify(change));
            console.log(error);
        }
    },function(e){console.log(e)}));
    }).run();
}

});}
