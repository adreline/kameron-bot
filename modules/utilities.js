var mysql = require('mysql');

 exports.getRandomColor = function() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

exports.parseTime = function(x){
	var o = '';
	if(Math.floor(x/60)==0){
		//nothing to do, x is under a minute
		o=x+'s';
		}else{
			//over a minute, calculate how many
			var mins=Math.floor(x/60);
			 //leftover is amount of seconds, it will stay
			var secs=x-(mins*60);
			o=secs+'s';
			if(mins>=60){
				//mins is over hour
				var hrs=Math.floor(mins/60);
				//leftover is amount of minutes
				mins=mins-(hrs*60);
				o=mins+'m '+o;
				if(hrs>=24){
					//hrs is over a day
					var days = Math.floor(hrs/24);
					//leftover is amount of hours
					hrs=hrs-(days*24);
					o=hrs+'h '+o;
					 if(days>=365){
						//days are over a year
						var years=Math.floor(days/365);
						//leftover is amount of days
						days=days-(years*365);
						o=years+'y '+days+'d '+o;
						}else{
							//days are under a year
							o=days+'d '+o;
							}
					}else{
						//hours is under a day
						o=hrs+'h '+o;
						}
				}else{
					//mins is under hour
					o=mins+'m '+o;
					}
			}
			return o;
	}



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
  console.log('[utilities.js] getRandom() function called');
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.includes = function (string,needle){
  console.log('[utilities.js] includes() function called');
  if (string.indexOf(needle) > -1) {
    return true;
  }else {
    return false;
  }
}
exports.decide = function(string){
  console.log('[utilities.js] decide() function called');
  var clean = string.replace('kameron decide','').split("or");
  var index=Math.floor(Math.random() * clean.length);
  console.log("clean["+index+"]= "+clean[index]);
  return clean[index];
}

exports.clearAll = function(arr,hay){
  console.log('[utilities.js] clearAll() function called');
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
