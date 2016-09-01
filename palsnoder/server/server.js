var redis = require("redis");
var server = require('./module/server.js');
var fs = require('fs');

var REDIS_HOST = process.env.REDIS_HOST;
if( !REDIS_HOST ) REDIS_HOST = '127.0.0.1';
var REDIS_PORT = process.env.REDIS_PORT;
if( !REDIS_PORT ) REDIS_PORT = 6379;
var client = redis.createClient(REDIS_PORT,REDIS_HOST);

console.log('Listening for messages on queue pals.input');

var workers = 0;
var hangSeconds = 0;
var maxWorkers = 4;
var maxHangSeconds = 10000;

processNext();

/*function processNext() {
	client.lpop('pals.input',function(err,value){
		setTimeout(processNext,1000);
		if( value ) {
			var message = JSON.parse(value);
			var palsStatus = {}
			palsStatus._id = message._id;
			console.log('Received message');
			console.log('Total number of workers requested: ' + (workers + 1));

			if (workers >= maxWorkers) {
				console.log('waiting in queue');
			}

			waitUntil()
					.interval(1000)
					.times(Infinity)
					.condition(function() {
							return (workers <= maxWorkers);
					})
					.done(function(result) {

						palsStatus.status = 'running';
						client.rpush('pals.output', JSON.stringify(palsStatus));
						console.log(palsStatus.status);
						++workers;
					  server.handleMessage(message, sendMessage);

					});

		}
  });
}*/

function processNext() {
	if( workers < maxWorkers ) {
	    client.lpop('pals.input',function(err,value){
	        if( value ) {
						var message = JSON.parse(value);
				    console.log('Received message, number of workers: ' + workers);

						var palsStatus = {}
						palsStatus._id = message._id;
						palsStatus.status = 'running';
						client.rpush('pals.output', JSON.stringify(palsStatus));
						console.log(palsStatus.status);
						++workers;
		    	  server.handleMessage(message, sendMessage);
	        }
		    setTimeout(processNext,100);
	    });
    }
	else {
		++hangSeconds;
//		console.log('all workers busy');
		if( hangSeconds > maxHangSeconds ) {
			hangSeconds = 0;
			workers = 0;
		}
		setTimeout(processNext,1000);
	}
}

function sendMessage(output) {
	console.log('sending reply to client');
	console.log(); console.log(output); 
	--workers;
	client.rpush('pals.output',JSON.stringify(output));
}

process.setMaxListeners(0);
