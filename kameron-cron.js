
const { Client, RichEmbed } = require('discord.js');
var mysql = require('mysql');
const ytdl = require('ytdl-core');
const fs = require('fs');
const http = require('http');
const child_process = require("child_process");
var request = require("request");
var shell = require('shelljs');
const daily = require("./modules/daily.js");
const client = new Client();
const token="NTk2NzI5NDkyMTk0NzIxODEz.XR9xug.jXvAdZvG8h8X9xwrHt-qmtDwEPM";
var default_room='596691844205903878'; //methanos
var guildid='596691844205903874'; //adios
var news_room='619610482277482498';
var bot_dev_room='613163028254425089';
var message_id=parseInt(process.argv[2]);



console.log(process.argv[2]);
if (isNaN(message_id)) {
  switch (process.argv[2]) {

    case 'sciencex':
    daily.getSciencex(function(res){
      if (res!='error') {
        console.log('[Kameron] no errors');
          client.login(token).then(() => {
              console.log("[Kameron] Client online");
              var guild = client.guilds.get(guildid);
              var channel = guild.channels.get(news_room);
              if(guild && guild.channels.get(news_room)){
                console.log("[Kameron] Channel selected correctly");
                batchSend(0,res,channel);
              } else {
                console.log("[Kameron] Channel not found");
              }
          });
      }else{
        console.log('[Kameron] sciencex reported error');
        readLogs((stacktrace)=>{
          send_message('**Error occured during:**\n`Daily News and Headlines`\nStacktrace:\n'+stacktrace,bot_dev_room);
        });

      }
    });
    break;

    case 'natgeopix':
      daily.getNatgeoPictures(function(res){
        if (res!='error') {
          var block = new RichEmbed();
          block.setTitle('National Geographics Picture of the Day');
          block.setURL(res.url);
          block.setImage(res.picture);
          block.setThumbnail('https://cdn.freebiesupply.com/logos/thumbs/2x/national-geographic-channel-1-logo.png');
          block.addField('**'+res.title+'**\n',res.caption,true);
          block.setColor('RANDOM');
          block.setFooter('Image Credits: '+res.credit);
          send_message(block,default_room);
        }else {
          console.log('[Kameron] natgeopix reported error');
          readLogs((stacktrace)=>{
            send_message('**Error occured during:**\n`National Geographics Picture of the Day`\nStacktrace:\n'+stacktrace,bot_dev_room);
          });
        }
      });
    break;
    case 'astropix':
      daily.getAstroPicture(function(res){
        if (res!='error') {
        var block = new RichEmbed();
        block.setTitle('**'+res.title+'**');
        block.setURL(res.picture_big);
        block.setImage(res.picture_small);
        block.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1224px-NASA_logo.svg.png');
        block.addField('Astronomy Picture of the Day',res.explanation+' (...)',true);
        block.setColor('RANDOM');
        block.setFooter('Image Credits: '+res.credits+'\nRead all on: '+res.url);
        send_message(block,default_room);
      }else {
        console.log('[Kameron] astropix reported error');
        readLogs((stacktrace)=>{
          send_message('**Error occured during:**`\nAstronomy Picture of the Day`\nStacktrace:\n'+stacktrace,bot_dev_room);
        });
      }
      });
    break;

    default:
      console.log("id is not a number, so i will just send it");
      send_message(process.argv[2],default_room);
      console.log("message is empty");
    break;
    }

    }else{

        var connection = mysql.createConnection({
           host : 'localhost',
           user : 'kameron_bot',
           password : 'fGjTVq0T',
           database : 'kameron_bot'
       });
        connection.connect();
        var onetime,message;
        var sql = 'SELECT * FROM cron_messages WHERE id = ' + connection.escape(message_id);
        connection.query(sql, function (error, results, fields) {
          if (error) throw error;
          var result=results[0];
          send_message(result.message,default_room);
          if (result.onetime==1) {
            var comm = "(crontab -l|grep -v '/home/pi/Downloads/bot-kameron/kameron-cron-message.js "+result.id+"') | crontab -";
            shell.exec(comm);
          }
        });
        connection.end();
    }

function send_message(message,channelid){
  if ( typeof message !== 'undefined' && message && message!='' ) {
    client.login(token).then(() => {
        console.log("kameron sends message");
        var guild = client.guilds.get(guildid);
        if(guild && guild.channels.get(channelid)){
            guild.channels.get(channelid).send(message).then(() => client.destroy()).catch(console.error);
        } else {
            console.log("channel not found");
        }
    });
  }else {
    console.log("message is empty");
  }
}
function batchSend(i,collection,channel){
  if (collection[i]!=void(0)) {
    console.log('[Kameron] Sending msg #'+i);
    res=collection[i]
    var block = new RichEmbed();
    block.setTitle(res.title+'\n');
    block.setURL(res.url);
    block.setImage(res.picture);
    block.setDescription(res.body+' (...)');
    block.setThumbnail('https://imgur.com/FKfpwO7.jpg');
    block.setColor('RANDOM');
    block.setFooter('Article nr. '+i+' https://sciencex.com/');
    channel.send(block).then(()=>{
      var n_i=i+1;
      batchSend(n_i,collection,channel);
    }).catch(()=>{
      console.log('[Kameron] Error occured while sending msg: ');
      console.log('--BEGIN--');
      console.log(res.title);
      console.log(res.url);
      console.log(res.picture);
      console.log(res.body);
      console.log('--END--');
      var n_i=i+1;
      batchSend(n_i,collection,channel);
    });
  }else {
    console.log('[Kameron] Batch sent');
      var block = new RichEmbed();
      block.setTitle('**Daily News and Headlines Update**\n');
      block.setDescription('```html\n<There are '+collection.length+' new articles today>\n```\n\nRead them in #kameron-news-room');
      block.setThumbnail('https://imgur.com/FKfpwO7.jpg');
      block.setColor('RANDOM');
      block.setFooter('Source: https://sciencex.com/');
      client.destroy();
      console.log('[Kameron] Sending Table of Content to main channel');
      send_message(block,default_room);
      console.log('[Kameron] Exiting');
  }
}
function readLogs(callback){
  fs.readFile('./logs/cron.log', 'utf8', function(err, data) {
  if (err){
    callback('`unable to read log file`');
  }else {
    var stacktrace = '```\n'+data.substring((data.length-400),data.length)+'\n```\n';
    callback(stacktrace);
  }
});
}
