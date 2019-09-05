var mysql = require('mysql');

exports.logMessage = function (author, content){
  var connection = mysql.createConnection({
 host : 'localhost',
 user : 'kameron_bot',
 password : 'fGjTVq0T',
 database : 'kameron_bot'
 });
 connection.connect();
 var post  = {id: null, author: author, content: content, created_at: mysql.raw('NOW()'), updated_at: mysql.raw('NOW()')};
 var query = connection.query('INSERT INTO messages_history SET ?', post, function (error, results, fields) {
   if (error) throw error;
   // Neat!
 });
 //console.log(query.sql);
 connection.end();
}
exports.getRandom = function(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.includes = function (string,needle){
  if (string.indexOf(needle) > -1) {
    return true;
  }else {
    return false;
  }
}
exports.decide = function(string){
  var clean = string.replace('kameron decide','').split("or");
  var index=Math.floor(Math.random() * clean.length);
  console.log("clean["+index+"]= "+clean[index]);
  return clean[index];
}

exports.clearAll = function(arr,hay){
  console.log('hay='+hay);
  if (hay !== void(0)) {
    var res=hay;
    arr.forEach(function(item){
      res=res.replace(item,'');
    });
    return res;
  }else {
    return 'undefined';
  }

}
