
const Discord = require('discord.js');
var request = require('request');
/*
const fs = require('fs');
const http = require('http');
const https = require('https');
var request = require("request");
const ytdl = require('ytdl-core');
var mysql = require('mysql');
const child_process = require("child_process");
const util = require('util');
const shell = require('shelljs');
*/
const client = new Discord.Client();
const token='NjA2NjE0NzY4OTAzNjUxMzYz.XUNoxA.N87VqVo9vWFnuG3R4iPypX9a--E';
var guild;
var channel;
var channelid='606570727667269750'; //bot-dev
var guildid='596691844205903874'; //adios

var post_data = {
  context:[
    "what are you doing ?",
    "say something interesting",
    "cool"
  ],
  "from_cakechat":true,
  "emotion":"joy"
};

function talk (mess,callback){
  post_data.context.shift();
  post_data.context.push(mess);
  console.log('context:'+post_data.context.toString());
  request({
        url: 'https://cakechat.replika.ai/cakechat_api/v1/actions/get_response',
        method: "POST",
        json: true,   // <--Very important!!!
        body: post_data
      },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              callback(response.body.response);
          }else {
              console.log('response');
              console.log(response.body.message);
              callback('ERROR');
          }
      }
  );
}
function includes(string,needle){
  if (string.indexOf(needle) > -1) {
    return true;
  }else {
    return false;
  }
}


client.on('message', message => {
  if (!message.guild) return;
  if (message.channel.id!=channelid) return;
  if (message.author.username!='kameron') return;
  talk(message.content,function(res){
    setTimeout(function() {
    channel.send('kameron, '+res);
  }, 1000);

  });
});
client.on('ready', () => {
   guild = client.guilds.get(guildid);
   channel = guild.channels.get(channelid);
   channel.send('kameron, who are you ?');
  console.log('R');
});

client.login(token);
