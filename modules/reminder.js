var mysql = require('mysql');
var shell = require('shelljs');

function validateCron(timing){
        var arr = timing.split(" ");
        if (arr.length!=5) {
          return false;
        }else {
          if ((parseInt(arr[0])<0||parseInt(arr[0])>59)&&arr[0]!='*') {
            //minutes <0,59> range
            return false;
          }
          if ((parseInt(arr[1])<0||parseInt(arr[1])>23)&&arr[1]!='*') {
            //hours <0,23> range
            return false;
          }
          if ((parseInt(arr[2])<1||parseInt(arr[2])>31)&&arr[2]!='*') {
            //day <1,31> range
            return false;
          }
          if ((parseInt(arr[3])<1||parseInt(arr[3])>12)&&arr[3]!='*') {
            //month <1,12> range
            return false;
          }
          if ((parseInt(arr[4])<0||parseInt(arr[4])>6)&&arr[4]!='*') {
            //day <0,6> range
            return false;
          }
          return true;
        }
}
function setEvent(message,onetime,time){
    var connection = mysql.createConnection({
   host : 'localhost',
   user : 'kameron_bot',
   password : 'fGjTVq0T',
   database : 'kameron_bot'
   });
   connection.connect();
   var post  = {id: null, message: message, onetime: onetime, created_at: mysql.raw('NOW()'), updated_at: mysql.raw('NOW()')};
   var query = connection.query('INSERT INTO cron_messages SET ?', post, function (error, results, fields) {
     if (error) throw error;
        var comm = "(crontab -l ; echo '"+time+" /usr/local/sbin/node /home/pi/Downloads/bot-kameron/kameron-cron-message.js "+results.insertId+"') | crontab -";
        shell.exec(comm);
   });
   //console.log(query.sql);
   connection.end();
}

exports.remind = function(message,callback){
  //just  pattern for cron timing
  var patt = /(\d|[*]|\d\d)\s(\d|[*]|\d\d)\s(\d|[*]|\d\d)\s(\d|[*]|\d\d)\s(\d|[*]|\d\d)/g;
  var timing = patt.exec(message.content);
  if (timing) {
    var remind_me_of = message.content.replace('kameron remind','').replace(timing[0],'').trim();
    remind_me_of=remind_me_of.replace('me of','').trim();
    remind_me_of=remind_me_of.replace('once','').trim();
    console.log('found something resembling cron timing: '+timing[0]);
    console.log('that means the message is this: '+remind_me_of);
    //validate cron timing
    if (validateCron(timing[0])) {
      //valid
      console.log('timing is valid');
        if (remind_me_of&&remind_me_of!='') {
          setEvent(remind_me_of,message.content.endsWith("once"),timing[0]);
          callback('Ok, i will remind you about "'+remind_me_of+'"');
        }else {
          callback('What should i remind of ?');
        }
    }else {
      //invalid
      console.log('timing is invalid');
      callback('invalid timing');
    }

  }else {
    console.log('timing not found');
    callback('timing not found');
  }

}
