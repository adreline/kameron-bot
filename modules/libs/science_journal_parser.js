const cheerio = require('cheerio');
const request = require('request');
const email_utils = require('./email-utils.js');

function getArticleBody(adress,callback){
  request({uri:adress,timeout: 5000}, function (error, response, body) {
    if (error) {
      callback('error');
    }else {
      const $ = cheerio.load(body);
      var picture=$(".article__body img")[0].attribs.src;
      //console.log(picture);
      var article_dom=$(".article__body p");
      var article='';
      for(var i in article_dom){
        for(var j in article_dom[i].children){
          var temp=article_dom[i].children[j];
          if (temp.type=='text') {
            article+=temp.data+' ';
          }else {
            if (temp.name=='a') {
              article+=temp.children[0].data+' ';
            }
          }
        }
      }
      //console.log(article);
      callback({
        picture:picture.trim(),
        article:article.substring(0,400)
      });
    }

  });
}
function agregateNews(i,links,collection,callback){
  console.log('[Journal Parser] Collecting article #'+i);
  var n_c=collection;
  if (links[i]!=void(0)) {
    getArticleBody(links[i].url,function(news){
      n_c.push({
        title:links[i].title,
        picture:news.picture,
        body:news.article,
        url:links[i].url
      });
      var n_i=i+1;
      agregateNews(n_i,links,n_c,callback);
    });
  }else {
    callback(collection);
  }
}
exports.scienceJournal = function(callback){
  console.log('[Journal Parser] Reading HTML');
  email_utils.getMessages((data)=>{
        const $ = cheerio.load(data);
        console.log('[Journal Parser] Reading title');
        //select title
        var title = $( "table[bgcolor='#cc2016'] b" )[0].children[0].data;
        if (title===void(0)) {
          console.log('[Journal Parser] Email structure not recognized, unable to find title');
          process.exit(1);
        }

      if (title=='Daily News and Headlines') {
        console.log('[Journal Parser] Email structure recognized, title = '+title);
      }
      //select links;
      console.log('[Journal Parser] Reading List of article links');
      var a=$("a[style='color: #ffffff; font-size: 26px; text-decoration: none;']");
      var links=[];
      for(var i in a){
        if (a[i].attribs!=void(0)&&a[i].attribs.href!=void(0)) {
          links.push({
            title:a[i].children[0].data,
            url:a[i].attribs.href
          })
        }
      }      
      console.log('[Journal Parser] Pulling Articles');
      agregateNews(0,links,[],function(res){
        console.log('[Journal Parser] All Articles pulled, returning');
        callback(res);
      });
  });
}
