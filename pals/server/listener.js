var Fiber = Npm.require('fibers');

if (Meteor.isServer) { Meteor.startup(function () {

var amqp = Meteor.require('amqp');

var exchangeName = 'pals';
var outgoingQueue = 'pals.output';
var outgoingRoutingKey = 'pals.output';
var connection = amqp.createConnection({url: "amqp://guest:guest@localhost:5672"},{reconnect:false});
var queue = undefined;

process.setMaxListeners(0);

connection.on('ready', function () {
   queue = connection.queue(outgoingQueue, function(q){ 
       console.log('Queue ' + q.name + ' is open');  
       q.bind(exchangeName,outgoingRoutingKey);
       q.subscribe(function (message) {
            handleMessage(message);
       });
   });
});

function handleMessage(message) {
    console.log(JSON.stringify(message));
    var selector = {'_id':message._id};
    var change = {};
    if( message.error ) {
        change.error = message.error;
    }
    else {
       change.results = message.files;
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
