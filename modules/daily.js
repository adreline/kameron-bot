const request = require('request');
const cheerio = require('cheerio');

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
              'explanation':explanation,
              'picture_small':picture_small,
              'picture_big':picture_big,
              'credits':credits
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
