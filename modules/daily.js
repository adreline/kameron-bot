const request = require('request');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const inspire=require('./inspire-me.js')
const fs = require('fs');

//this returns astronomy picture of the day from nasa
exports.getAstroPicture = function(callback){
  console.log('[Daily.js] getAstroPicture() function called');
  console.log('[Daily.js] making GET request');
  request({uri:'https://apod.nasa.gov/apod/astropix.html',timeout: 5000}, function (error, response, body) {
    if (error) {
      console.log('[Daily.js] Request failed, error is:');
      console.log(error);
      callback('error');
    }else {
      const $ = cheerio.load(body);
      //data being pulled
      var picture_small = 'https://apod.nasa.gov/apod/'+$( "img" )[ 0 ].attribs.src;
      var picture_big = 'https://apod.nasa.gov/apod/'+$( "img" )[ 0 ].parent.attribs.href;
      var explanation = '';
      var title=''
      var credits=''
      //heavy lifting
        $( "p" )[ 2 ].children.forEach(function(item){
          if (item.type=='text') {
            explanation+=item.data.trim()+' ';
          }else {
            if (item.type=='tag'&&item.name=='a') {
              explanation+=item.children[0].data.trim()+' ';
            }
          }
        });
        explanation=explanation.replace(/(?:\n\n|\n)/g, ' ');
          $("center")[1].children.forEach(function(item){
            if (item.name=='b'&&title=='') {
              title=item.children[0].data.trim();
            }
            if (item.name=='a') {
              credits+=item.children[0].data.trim()+' ';
            }
          });
          console.log('[Daily.js] Data collected, returning');
            callback({
              'title':title,
              'explanation':explanation.substring(0, 500),
              'picture_small':picture_small,
              'picture_big':picture_big,
              'credits':credits,
              'url':'https://apod.nasa.gov/apod/astropix.html'
            });
    }

  });
}
//get news from sciencex rss feed
exports.getSciencex = function(callback){
	console.log('[Daily.js] Loading delimiter');
	fs.readFile('/home/pi/Downloads/bot-kameron/temp/sciencex.br', 'utf8', function(err, data) {
  if (err){
  	console.log('[Daily.js] Error reading delimiter\n'+err);
  }else{
  	console.log('[Daily.js] Delimiter loaded');
  var breakpoint=data.trim();
  var parser = new Parser({
  customFields: {
    item: ['media:thumbnail'],
  }
});
 var adress="https://sciencex.com/rss-feed/my-news/cb6f9a19ea7e7af2c4f9aa0de53bfb07a0ca93d5/";
console.log('[Daily.js] Requesting rss feed');
parser.parseURL( adress, function(err, feed) {
	if(err){
		callback('error');
		}
  console.log(feed.title);
  var agregate=[];
  for(var i in feed.items){
  	var entry = feed.items[i];
  	console.log('[Daily.js] Reading entry');
  if(entry.title==breakpoint){
  console.log('[Daily.js] Breakpoint reached, ignoring entry');
  break;
  }else{
  	console.log('[Daily.js] Pushing new entry');
  var thumb="https://imgur.com/8vd6Qkp.jpg";
  if(entry['media:thumbnail']!=void(0)){
  	thumb=entry['media:thumbnail'].$.url;
  }
    agregate.push({
    	title: entry.title,
        url: entry.link,
        body: entry.content.substring(0,400),
        picture: thumb
});

}
  }
    	if(agregate.length==0){
  	console.log('[Daily.js] No new articles found');
  callback('error');

  }else{
  var br = agregate[0].title;
fs.writeFile("/home/pi/Downloads/bot-kameron/temp/sciencex.br", br, function(err) {
    if(err) {
        console.log('[Daily.js] Error saving delimiter');
        callback('error');
    }else{
    console.log('[Daily.js] Delimiter saved');
    }
});
  console.log('[Daily.js] Articles read, returning');
 callback(agregate);
 }
});
  }
});
}
//I want him to tell me every Friday how much more suffering i have left till holidays 2020
exports.tillVacations = function(callback){
  /*
  niedziela - 0
  pon 1
  wtorek 2
  sroda 3
  czw 4
  piat 5
  sob 6
  */
  fs.readFile('/home/pi/Downloads/bot-kameron/temp/till_vacations.br', 'utf8', function(err, data) {
    if(err) {
        console.log('[Daily.js] Error reading till_vacations');
        callback('error');
    }else{
    console.log('[Daily.js] till_vacations read');
    //if weekend day dont substract
    var till_vacations = parseInt(data);
    var week_day=new Date().getDay();
    if (week_day!=6&&week_day!=0) {
      till_vacations-=1;
    }
  //save number of days
    fs.writeFile("/home/pi/Downloads/bot-kameron/temp/till_vacations.br", till_vacations, function(err) {
        if(err) {
            console.log('[Daily.js] Error saving till_vacations');
            callback('error');
        }else{
            console.log('[Daily.js] till_vacations saved, returning data');
            inspire.inspireMe((link)=>{
              //make cute progress bar
              var total=260;
              var progress=total-till_vacations;
              var pc=Math.round((progress/total)*100);
              var filled_bars=Math.round(pc/(100/10));
              var unfilled_bars=10-filled_bars;
              var bar='';
              while (filled_bars!=0) {
                bar+='💙';
                filled_bars--;
              }
              while (unfilled_bars!=0) {
                bar+='🖤';
                unfilled_bars--;
              }
              //post only at Friday
              if (week_day==5) {
                callback({num:till_vacations,image:link,bar:bar,pc:pc});
              }else {
                callback('not today');
              }
            });
        }
    });
    }
  });



}
