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
			var message = JSON.parse(value);
			if (message.status)
				console.log('Received message: ' + message.status);
			else
				console.log('Received analysis results');
    	handleMessage(JSON.parse(value));
    }
		setTimeout(processNext, 1000);
	});
}

function handleMessage(message) {
	var change = {};
  if( message.error ) {
      change.error = message.error;
      change.status = 'error';
  }
	else if (message.status) {
			change.status = message.status;
	}
  else {
     change.results = message.files;
     change.status = 'complete';
  }
	var selector = {'_id':message._id};
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
