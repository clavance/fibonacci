// jshint esversion: 6
// this module is the worker, it watches redis for new messages
// after receiving a message it calculates the fib function
// and then inserts the value back into redis
const keys = require("./keys"),
      redis = require('redis');

const redisClient = redis.createClient({
        host:keys.redisHost,
        port:keys.redisPort,
        // reconnect to Redis server once every second
        retry_strategy: () => 1000
      });

if (redisClient.connected) {
  console.log("Client connected");
}

// sub = redis subscription
const sub = redisClient.duplicate();

sub.monitor((err, res)=> {
  console.log("Monitoring on sub client");
});

// recursive fibonacci function
function fib(index) {
  if (index<2) return 1;
  return fib(index-1)+fib(index-2);
}

// if we get a new message to redis server, run callback function
// pass 'message' which was keyed in as the value of the fibonacci index
// insert this into a hash set called 'values'
sub.on('message', (channel, message) => {
  console.log('Calculating!' );
  num = fib(parseInt(message));
  console.log('Answer: ', num);
  redisClient.hset('values', message, num);
  console.log('Successfully added answer to Redis');
});

// we subscribe to any 'insert' event
// we are monitoring redis to see if any new values (ie. 'message') are inserted
sub.subscribe('insert');

sub.on("monitor", function(time, args, rawReply) {
  console.log(time + ": " + args); // 1458910076.446514:['set', 'foo', 'bar']
});
