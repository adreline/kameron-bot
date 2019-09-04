const request = require('request');
const cheerio = require('cheerio');

exports.getPicture = function(callback){
  request('https://apod.nasa.gov/apod/astropix.html', function (error, response, body) {
    //console.error('error:', error); // Print the error if one occurred
    //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //console.log('body:', body); // Print the HTML for the Google homepage.
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
  });
}
