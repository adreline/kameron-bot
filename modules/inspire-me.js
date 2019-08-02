const http = require('http');
const https = require('https');

exports.inspireMe = function (callback){
  var options = {
    host: 'www.inspirobot.me',
    path: '/api?generate=true'
  };
  var req = http.get(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));

    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      var inspire_link=body.toString('utf8');
      callback(inspire_link);
    })
  });

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });
}
