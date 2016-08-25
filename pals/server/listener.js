var Fiber = Npm.require('fibers');

if (Meteor.isServer) { Meteor.startup(function () {

var queue = 'pals.output';
var redis = require("redis");

var REDIS_HOST = process.env.REDIS_HOST;
if( !REDIS_HOST ) REDIS_HOST = '127.0.0.1';
var REDIS_PORT = process.env.REDIS_PORT;
if( !REDIS_PORT ) REDIS_PORT = 6379;
var client = redis.createClient(REDIS_PORT,REDIS_HOST);

process.setMaxListeners(0);

processNext();

function processNext() {
	client.lpop(queue,function(err,value){
	    if( value ) {
			console.log('Received message');
//	    	handleMessage(JSON.parse(value));
	    	handleMessage(value);
	    }
		setTimeout(processNext, 1000);
	});
}

function handleMessage(value) {

	var change = {};

	if (value == "ping") {
		console.log ("ping received");
		change.status = 'starting';
	}
	else {
		var message = JSON.parse(value);
		console.log(message);
		var selector = {'_id':message._id};
		if( message.error ) {
			change.error = message.error;
			change.status = 'error';
		}
		else {
			change.results = message.files;
			change.status = 'complete';
		}
		var modifier = {'$set':change};
	}

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
