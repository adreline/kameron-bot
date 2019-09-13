
const { Client, RichEmbed } = require('discord.js');
var mysql = require('mysql');
const ytdl = require('ytdl-core');
const fs = require('fs');
const http = require('http');
const child_process = require("child_process");
var request = require("request");
var shell = require('shelljs');
const daily = require("./modules/daily.js");
const utilities = require("./modules/utilities.js");
const client = new Client();
const token="NTk2NzI5NDkyMTk0NzIxODEz.XR9xug.jXvAdZvG8h8X9xwrHt-qmtDwEPM";
var default_room='596691844205903878'; //methanos
var guildid='596691844205903874'; //adios
var news_room='619610482277482498';
var bot_dev_room='613163028254425089';
var message_id=parseInt(process.argv[2]);

/*
This is console app that executes one command and exits
possible input is number which looks up it as id in database and sends content (reminder command)
if its not number, the app takes command and sends output of corresponding function from dialy.js module
*/
//verify command is not null
if (process.argv[2]===void(0)) {
  console.log("[kameron-cron.js] no arguments, exiting");
  process.exit(0);
}
//follow the logic
if (isNaN(message_id)) {
  select();
    }else{
      //Is a number, look up the database
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

function send_message(message,channelid,){
  if ( typeof message !== 'undefined' && message && message!='' ) {
    client.login(token).then(() => {
        console.log("[kameron-cron.js] send_message() sending message");
        var guild = client.guilds.get(guildid);
        if(guild && guild.channels.get(channelid)){
            guild.channels.get(channelid).send(message).then(() => client.destroy()).catch(console.error);
        } else {
            console.log("[kameron-cron.js] send_message() channel not found");
        }
    });
  }else {
    console.log("[kameron-cron.js] send_message() message is empty");
  }
}
function batchSend(i,collection,channel,color){
  if (collection[i]!=void(0)) {
    console.log('[kameron-cron.js] Sending msg #'+i);
    res=collection[i]
    var block = new RichEmbed();
    block.setTitle(res.title+'\n');
    block.setURL(res.url);
    block.setImage(res.picture);
    block.setDescription(res.body+' (...)');
    block.setThumbnail('https://imgur.com/FKfpwO7.jpg');
    block.setColor(color);
    block.setFooter('Article nr. '+i+' https://sciencex.com/');
    channel.send(block).then(()=>{
      var n_i=i+1;
      batchSend(n_i,collection,channel,color);
    }).catch(()=>{
      console.log('[kameron-cron.js] Error occured while sending msg: ');
      console.log('--BEGIN--');
      console.log(res.title);
      console.log(res.url);
      console.log(res.picture);
      console.log(res.body);
      console.log('--END--');
      var n_i=i+1;
      batchSend(n_i,collection,channel,color);
    });
  }else {
    console.log('[kameron-cron.js] Batch sent');
      var block = new RichEmbed();
      block.setTitle('**Daily News and Headlines Update**\n');
      block.setDescription('```html\n<There are '+collection.length+' new articles today>\n```\n\nRead them in #kameron-news-room');
      block.setThumbnail('https://imgur.com/FKfpwO7.jpg');
      block.setColor(color);
      block.setFooter('Source: https://sciencex.com/');
      client.destroy();
      console.log('[kameron-cron.js] Sending Table of Content to main channel');
      send_message(block,default_room);
      console.log('[kameron-cron.js] Exiting');
  }
}
function readLogs(callback){
  fs.readFile('/home/pi/Downloads/bot-kameron/logs/cron.log', 'utf8', function(err, data) {
  if (err){
    callback('`unable to read log file`\n'+err);
  }else {
    var stacktrace = '```\n'+data.substring((data.length-400),data.length)+'\n```\n';
    callback(stacktrace);
  }
});
}
function select(){
  console.log('[kameron-cron.js] argument -> '+process.argv[2]);
  switch (process.argv[2]) {
    case 'tillvac':
      daily.tillVacations((res)=>{
        if (res!='error'&&res!='not today') {
          var block = new RichEmbed();
          block.setTitle('*\"Time is relative\"* ~ Albert Einstein');
          block.addField('You made it through '+res.pc+'% of school year',res.bar,true);
          block.addField('There is '+res.num+' days left of you misery <:kekr:621847326239096833>','Anyway here is motivation for ya to go to school tommorow <:pepelaugh:621847424163381261>',true);
          block.setImage(res.image);
          block.setColor('#e6004c');
          send_message(block,bot_dev_room);
        }else {
          if (res=='error') {
            console.log('[kameron-cron.js] tillvac reported error');
            readLogs((stacktrace)=>{
              send_message('**Error occured during:**\n` Time is relative `\nStacktrace:\n'+stacktrace,bot_dev_room);
            });
          }
        }
      });
    break;
    case 'sciencex':
    daily.getSciencex(function(res){
      if (res!='error') {
        console.log('[kameron-cron.js] no errors');
          client.login(token).then(() => {
              console.log("[kameron-cron.js] Client online");
              var guild = client.guilds.get(guildid);
              var channel = guild.channels.get(news_room);
              if(guild && guild.channels.get(news_room)){
                console.log("[kameron-cron.js] Channel selected correctly");
                var color=utilities.getRandomColor();//select unique color for this batch
                batchSend(0,res,channel,color);
              } else {
                console.log("[kameron-cron.js] Channel not found");
              }
          });
      }else{
        console.log('[kameron-cron.js] sciencex reported error');
        readLogs((stacktrace)=>{
          send_message('**Error occured during:**\n`Daily News and Headlines`\nStacktrace:\n'+stacktrace,bot_dev_room);
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
        block.setColor('#00a5ff');
        block.setFooter('Image Credits: '+res.credits+'\nRead all on: '+res.url);
        send_message(block,default_room);
      }else {
        console.log('[kameron-cron.js] astropix reported error');
        readLogs((stacktrace)=>{
          send_message('**Error occured during:**`\nAstronomy Picture of the Day`\nStacktrace:\n'+stacktrace,bot_dev_room);
        });
      }
      });
    break;

    default:
      console.log("[kameron-cron.js] argument is neither number nor command");
      console.log("[kameron-cron.js] assuming message, sending");
      var msg='';
      for (var i = 2; i < process.argv.length; i++) {
        if (process.argv.hasOwnProperty(i)) {
          msg+=process.argv[i]+' ';
      }
      }
      send_message(msg.replace(/\\n/g, '\n'),bot_dev_room);
    break;
    }
}
