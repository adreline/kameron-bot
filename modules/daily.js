const request = require('request');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const fs = require('fs');
const sci_journal = require('./libs/science_journal_parser.js');

//this returns astronomy picture of the day from nasa
exports.getAstroPicture = function(callback){
  request({uri:'https://apod.nasa.gov/apod/astropix.html',timeout: 5000}, function (error, response, body) {
    if (error) {
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
//this returns pictures of the day from nat geo
exports.getNatgeoPictures = function(callback){
  request({uri:'https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.json',timeout: 5000}, function (error, response, body) {
    if (error) {
      callback('error')
    }else {
      var gallery = JSON.parse(body);
      var pic=gallery.items[0];
      var caption = pic.caption.replace('<p>','').replace('</p>','').trim();
      callback({
        'title':pic.title,
        'caption':caption,
        'credit':pic.credit,
        'picture':pic.originalUrl,
        'url':pic['full-path-url']
      });
    }
  });
}
//this get news from email newsletter
exports.getScienceJournal = function(callback){
  console.log('[Daily.js] Requesting articles');
  sci_journal.scienceJournal(function(res){
    console.log('[Daily.js] Received');
    console.log('[Daily.js] Veryfing');
    if (res!=void(0)) {
      console.log('[Daily.js] Looks ok, returning');
      callback(res);
    }else {
      console.log('[Daily.js] articles are undefined');
      callback('error');
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
    agregate.push({
    	title: entry.title,
        url: entry.link,
        body: entry.content.substring(0,400),
        picture: entry['media:thumbnail'].$.url
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
