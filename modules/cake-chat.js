var request = require('request');
var post_data = {
  context:[
    "what are you doing ?",
    "say something interesting",
    "cool"
  ],
  "from_cakechat":true
};
exports.talk = function(mess,callback){
  console.log('[cake-chat.js] talk() function called');
  post_data.context.shift();
  post_data.context.push(mess);
  console.log('[cake-chat.js] context:'+post_data.context.toString());
  console.log('[cake-chat.js] Making POST request');
  request({
        url: 'https://cakechat.replika.ai/cakechat_api/v1/actions/get_response',
        method: "POST",
        json: true,   // <--Very important!!!
        body: post_data
      },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              callback(response.body.response);
          }else {
              console.log('[cake-chat.js] Error occured, response is:');
              console.log(response.body.message);
              callback('error');
          }
      }
  );
}

//https://cakechat.replika.ai/cakechat_api/v1/actions/get_response
