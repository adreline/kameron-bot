
const { Client, RichEmbed } = require('discord.js');
const http = require('http');
const https = require('https');
var request = require("request");



const modules = require('./modules/modules.js');
/*
const ytdl = require('ytdl-core');
var mysql = require('mysql');
const fs = require('fs');
const child_process = require("child_process");
const util = require('util');
*/
const client = new Client();
const token='NTk2NzI5NDkyMTk0NzIxODEz.XR9xug.jXvAdZvG8h8X9xwrHt-qmtDwEPM';
var channelid='596691844205903878'; //methanos
var guildid='596691844205903874'; //adios
var writting=false; //flag if bot is waiting for markov text to be generated
var memegen=false; //flag if bot is waiting for meme to be generated
const manual = new Map();
manual.set('remind', 'kameron remind me of <enter your message> <enter time>\nif you wish to be reminded once, add "once" at the end\nuse https://crontab.guru to create timing and just paste it anywhere in the command \n example command:\nkameron remind me of something 14 20 * * * once');
manual.set('inspire','Type in kameron inspire to receive inspiring image\nexample:\nkameron inspire me');
manual.set('X','Responds with "D"');
manual.set('help','List all avaiable commands');
manual.set('decide','kameron decide <option> or <option> or ...\nlet kameron decide important life choices for you.\ntype in a many options as you like\nexample:\nkameron decide play ow or not play ow');
manual.set('bitbucket','Wish to see source code and contribute ? type in kameron bitbucket to receive link + credentials');
manual.set('poll','Creates simple poll with reactions to vote.\nexample:\nkameron poll should i jump off building');
manual.set('clean','kameron clean <number>\nDelete many messages to clean chat.\nexample:\nkameron clean 4');
manual.set('talk','kameron talk <type anything>\n__or__\nkameron, <type anything>\nYou can literally talk with kameron now, isn\'t that coolest thing ever ?\n*It uses **AI** from https://cakechat.replika.ai to generate responses*\nexample:\nkameron talk how are you doing ?\n__or__\nkameron, how are you doing ?');
manual.set('markov','kameron markov <source> <state> <length>\ngenerates text using markov chains algorithm\n**sources** -> __text to use__\n lotr - entire lord of the rings\n lovecraft - entire lovecraft bibliography\n combined - all above\n**state** -> __complexity of a chain, the higher the more refined sentences are__\navaiable states:\n1 2 3\ndefault is 3\n**length**\n story\n quoute\n**example**\nkameron markov lotr 3 story');
manual.set('avatar','kameron avatar <user>\nSends link to user avatar. Specify user by pinging\nexample:\nkameron avatar @debaleba');
manual.set('memegen','kameron memegen <caption>\ncreates meme using appended image and provided caption\ntype in command and caption then add image to your message and send it');

client.on('message', message => {
var args = message.content.split(" ");
if (args[0]=='X') {message.channel.send('D');return;}
if (args[0]=='kameron,') {args[1]='talk';args[0]='kameron';}
if (args[0]!='kameron') {return;}

switch (args[1]) {

  case 'remind':
    modules.reminder.remind(message,function(result){
      message.channel.send(result);
    });
  break;

  case 'inspire':
    modules.inspire.inspireMe(function(link){
      message.channel.send(link);
    });
  break;

  case 'decide':
    message.channel.send('```'+modules.utilities.decide(message.content)+'```');
  break;

  case 'poll':
      message.channel.send(modules.poll.createPoll(message.author,message.content)).then(function(message){
        message.react('👎');
        message.react('👍');
      });
  break;

  case 'bitbucket':
      var block = new RichEmbed();
      block.setColor('RANDOM');
      block.setTitle('Bitbucket information');
      block.setDescription('Use this account **or** create your own\n*but if you create own, dm me it pls*\nemail:||yiu14833@bcaoo.com||\npassword:||xkXVOuS00Igj||\nregister here: https://bitbucket.org\n__Link to repository:__ https://bitbucket.org/not_ravi/bot-kameron/src/master');
      block.setThumbnail(client.user.avatarURL);
      message.channel.send(block);
  break;

  case 'clean':
        var size = parseInt(args[2]);
        if (!isNaN(size)&&size<50) {
          message.channel.bulkDelete(size);
        }else {
          message.channel.send('But how many messages to delete 🤔');
        }
  break;

  case 'talk':
    modules.cake_chat.talk(message.content.replace('kameron talk ','').replace('kameron, ',''),function(res){
      if (res!='ERROR') {
        message.channel.send(res);
      }else {
        message.channel.send('Sorry, i don\'t know how to respond');
      }
    });
  break;

  case 'help':
      var block = new RichEmbed();
        if ((args.length==3)&&(manual.get(args[2])!=='undefined')) {
          block.setTitle(args[2]);
          block.setDescription(manual.get(args[2]));
          block.setColor('RANDOM');
        }else {
          block.setTitle('List of commands');
          var commands = '';
          for (var [key, value] of manual) {
            commands+=key+'\n';
          }
          block.setDescription(commands+"__**commands start with 'kameron'**__");
          block.setColor('RANDOM');
          block.setAuthor(client.user.username,client.user.avatarURL,client.user.avatarURL);
          block.setThumbnail(client.guilds.get(guildid).iconURL);
          block.setFooter('For more info type kameron help <command name>');
        }
        message.channel.send(block);
  break;

  case 'markov':
    //source state length
    //<source> <state> <length>
  if (!writting) {
    writting=true;
    modules.markov_chain.chain(args[2],args[3],args[4],function(res){
      message.channel.send(res);
      writting=false;
    });
    message.react('🆗');
  }else {
    message.channel.send('wait, im still writting');
  }


  break;

  case 'avatar':
    var userr = client.users.get(modules.utilities.clearAll(['<','>','@'],args[2]));
    if (userr !== void(0)) {
      var block = new RichEmbed();
      //block.setDescription("");
      block.setColor('RANDOM');
      block.setAuthor(userr.username,userr.avatarURL,userr.avatarURL);
      block.setImage(userr.avatarURL);
      message.channel.send(block);
    }else {
      message.channel.send('invalid user');
    }
  break;
  case 'memegen':

    //catch any errors and lacking variables
      if (memegen) {
        message.channel.send('im still editing previous image');
        break;
      }
      if (message.attachments.first() === void(0)) {
        message.channel.send('No attachement found');
        break;
      }
      if (message.attachments.first().height === void(0)) {
          message.channel.send('Attachement is not an image');
          break;
      }
      if (message.content.replace('kameron memegen','').length<1) {
        message.channel.send('Caption not found');
        break;
      }
    //execute command
    var caption = message.content.replace('kameron memegen ','');
    var filename = message.attachments.first().filename;
    var url = message.attachments.first().url;
    memegen=true;
    modules.memegen.makememe(caption,filename,url,function(res){
    memegen=false;
      message.channel.send("meme",{
        files: [
        '/home/pi/Downloads/bot-kameron/modules/memegen/conv-final.jpg'
        ]
      });
    });
  break;

  default:
  break;
}

});


client.on('ready', () => {
  client.user.setActivity("type 'kameron help'", { type: 'WATCHING' })
  console.log('R');
});

client.login(token);
