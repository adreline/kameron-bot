
const { Client, RichEmbed } = require('discord.js');
var mysql = require('mysql');
const ytdl = require('ytdl-core');
const fs = require('fs');
const http = require('http');
const child_process = require("child_process");
var request = require("request");
var shell = require('shelljs');
const astropix = require("./modules/astronomy_picture_daily.js");
const client = new Client();
const token="NTk2NzI5NDkyMTk0NzIxODEz.XR9xug.jXvAdZvG8h8X9xwrHt-qmtDwEPM";
var channelid='596691844205903878'; //methanos
var guildid='596691844205903874'; //adios

var message_id=parseInt(process.argv[2]);

if (isNaN(message_id)) {
  switch (process.argv[2]) {
    case 'astropix':
      astropix.getPicture(function(res){
        var block = new RichEmbed();
        block.setTitle('Astronomy Picture of the Day');
        block.setURL(res.picture_big);
        block.setImage(res.picture_small);
        block.addField('**'+res.title+'**\n',res.explanation,true);
        block.setColor('RANDOM');
        block.setFooter('Image Credits: '+res.credits);
        send_message(block);
      });
    break;

    default:
      console.log("id is not a number, so i will just send it");
      send_message(process.argv[2]);
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
      send_message(result.message);
      if (result.onetime==1) {
        var comm = "(crontab -l|grep -v '/home/pi/Downloads/bot-kameron/kameron-cron-message.js "+result.id+"') | crontab -";
        shell.exec(comm);
      }
    });
    connection.end();

}

function send_message(message){
  if ( typeof message !== 'undefined' && message && message!='' ) {
    client.login(token).then(() => {
        console.log("kameron sends message");
        var guild = client.guilds.get(guildid);
        if(guild && guild.channels.get(channelid)){
            guild.channels.get(channelid).send(message).then(() => client.destroy());
        } else {
            console.log("channel not found");
        }
    });
  }else {
    console.log("message is empty");
  }
}
