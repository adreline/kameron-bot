const http = require('http');
const https = require('https');

exports.inspireMe = function (callback){
  console.log('[inspire-me.js] inspireMe() function called');
  var options = {
    host: 'www.inspirobot.me',
    path: '/api?generate=true'
  };
  console.log('[inspire-me.js] sending GET request');
  var req = http.get(options, function(res) {
    console.log('[inspire-me.js] status: '+res.statusCode);
    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      var inspire_link=body.toString('utf8');
      console.log('[inspire-me.js] data collected, returning');
      callback(inspire_link);
    })
  });

  req.on('error', function(e) {
    console.log('[inspire-me.js] Request failed, error is:');
    console.log(e.message);
    callback('error');
  });
}
