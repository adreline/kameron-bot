
const { Client, RichEmbed } = require('discord.js');
const http = require('http');
const https = require('https');
var request = require("request");
const fs = require('fs');
const epoch=1568124324009;

const modules = require('./modules/modules.js');
const manual = require('./manual.js');

const client = new Client();
const token='NTk2NzI5NDkyMTk0NzIxODEz.XR9xug.jXvAdZvG8h8X9xwrHt-qmtDwEPM';
var channelid='596691844205903878'; //methanos
var guildid='596691844205903874'; //adios
var bot_dev_room='613163028254425089';
//AccuWeather api keys
var primary_key = 'eQqfy0EaGMiJ69IGC6W3utnE3Q6Eenes';
var backup_key = 'g9HXOhAljxUD1eR2ruhZRtrG6Wubv6Lb';
var working_key = primary_key;
//flags
var writting=false; //flag if bot is waiting for markov text to be generated
var memegen=false; //flag if bot is waiting for meme to be generated
var backup_api=false; //flag if bot is using secondary weather api key
var tts=false; //if kameron is to use tts to talk to you using cake chat
var animation_type='moon'; //type of animation kameron should use in all commands


//analyze incoming message
client.on('message', message => {
//split message into array of arguments
var args = message.content.split(" ");
//silly responses
if (message.content.trim().toLowerCase()=='bruh') {message.channel.send('🏅 **__tHiS iS cErTiFiEd BrUh MoMeNt__** 🏅');message.react('🏅');}
if (args[0]=='X') {message.channel.send('D');return;}
//substitute {kameron,} for {kameron talk} so that command is correctly picked up by switch case
if (args[0]=='kameron,') {args[1]='talk';args[0]='kameron';}
//if message does not start with {kameron} go back and do nothing (obviously)
if (args[0]!='kameron') {return;}
console.log('[kameron.js] Command received -> '+message.content);
switch (args[1]) {

  case 'opgg':
  //league of legends tracker
  message.react('🆗');
    if (args[2]===void(0)) {
      //assuming live match is being requested
      modules.opgg.getMatch(message.author.id,(match)=>{
        if (match.code==200) {
          var block = new RichEmbed();
          block.setColor('#ad3');
          block.setTitle('Match of '+message.author.username+' as **'+match.summoner+'**');
          block.addField('TEAM BLUE',match.team1,true);
          block.addField('TEAM RED',match.team2,true);
          block.setThumbnail(match.icon);
          message.channel.send(block);
          message.delete();
        }else {
          var block = new RichEmbed();
          block.setColor('#ad3');
          block.setTitle('Currently not in match');
          block.addField(match.tier+' '+match.rank,'wins: '+match.win+' losses: '+match.loss+'\n**LP**: '+match.lp,true);
          block.addField('Region',match.region,true);
          block.setAuthor(message.author.username+' as '+match.summoner,match.summoner_icon);
          block.setThumbnail(match.rank_icon);
          message.channel.send(block);
          message.delete();
        }
      });
    }else {
      //assuming setting lol account details
      //order is as follows <region> <name> then pass msg.author id
      var dirt='kameron opgg '+args[2];
      var name = message.content.replace(dirt,'').trim();
      modules.opgg.setSummoner(name,args[2].toUpperCase(),message.author.id,(sig)=>{
        message.channel.send(sig);
        message.delete();
      });
    }
  break;

  case 'me':
  //just cool stats
    var data = modules.tracker.getData(message.author.id,epoch);
    var block = new RichEmbed();
    block.setColor('#bb33dd');
    block.setTitle(message.author.username+'  '+data.rank.lvl+'` lvl `'+data.rank.xp+'` xp `');
    block.addField('Rank progress',' ` '+data.rank.xp+'xp ` '+data.rank.bar+' ` '+data.rank.next+'xp ` ',true);
    block.addField('Cool Details','You have been online for ` '+data.online_score+' `\n**This traslates to:**\n'+data.p_online+'% of your life <:dank:597902016865501185>\n'+data.disprofit+' € of electricity cost <:pepethink:597901905301209098>\n'+data.carbon+' kg of CO₂ <:pepehands:597901991242498052>',true);
    block.addField('<:pogchamp:597074922652565504> Your top games:',data.games,true);
    block.setThumbnail(message.author.avatarURL);
    block.setFooter('Since: 10.09.2019');
    message.channel.send(block);
  break;

  case 'stacktrace':
  //this command allows you to view logs in case something broke
  var filepath='kameron.log';
    if (args[2]!=void(0)) {
      if (args[2]=='cron') {
        filepath='cron.log';
      }
    }
      fs.readFile('/home/pi/Downloads/bot-kameron/logs/'+filepath, 'utf8', function(err, data) {
      if (err){
        message.channel.send('`unable to read log file`\n'+err);
      }else {
        var stacktrace = '**Recent calls in** `'+filepath+'`\n```\n'+data.substring((data.length-600),data.length)+'\n```\n';
        message.channel.send(stacktrace);
      }
    });
  break;

  case 'animate':
  /*
    uses message editing to display simple animation in 1 fps (wow)
  */
    if (args[2]!=void(0)) {
      if (args[2]=='moon'||args[2]=='bar'||args[2]=='clock') {
        animation_type=args[2];
        message.react('🆗');
      }
    }else {
      message.channel.send('.').then((msg)=>{
      var pid =  modules.animate.startAnimation('',animation_type,msg);
          setTimeout(function() {
            console.log('Calling end event');
            modules.animate.endAnimation(pid);
          }, 10000);
      });
    }
  break;

  case 'rubikcube':
    modules.rubikcube.spawnCube(client,message);
  break;

  case 'play':
    /*
    play command accepts secondary arguments, we test them here
    skip, queue and song
    */
    if (args[2]=='skip') {
      modules.music.skipSong();
      break;
    }
    if (args[2]=='queue') {
      message.channel.send(modules.music.viewQueue());
      break;
    }
    if (args[2]=='song') {
      message.channel.send(modules.music.nowPlaying());
      break;
    }
    //before adding song, check if user is in voice chat
    if (message.member.voiceChannel===void(0)) {
      message.channel.send('You are not in a voice chat');
    }else {
      modules.music.playSong(message.member.voiceChannel,args[2],function(res){
        message.channel.send(res);
        message.delete();
      });
    }
  break;

  case 'weather':
      /*
      weather command accepts secondary arguments, we test them here
      backup_api - switches api keys (2 are avaiable)
      api - returns which is used at the moment
      */
      //if we need to swap api key
      if (args[2]=='backup_api') {
        if (backup_api) {
          backup_api=false;
          working_key=primary_key;
          message.channel.send('Switched to primary api key');
          break;
        }else {
          backup_api=true;
          working_key=backup_key;
          message.channel.send('Switched to backup api key');
          break;
        }
      }
      //return which key is used at the moment
      if (args[2]=='api') {
        if (backup_api) {
          message.channel.send('I\'m using backup key');
          break;
        }else {
          message.channel.send('I\'m using primary key');
          break;
        }
      }
      //remove command from message so we are left with only the location and also trim it just for sure
      var location = message.content.replace('kameron weather','').trim().replace(' ','%20');
      //call weather module
      modules.accu.getWeather(working_key,location, function(success,report){
        if (success) {
              var block = new RichEmbed();
              block.setTitle('Weather at '+report.location);
              block.setURL(report.link);
              block.setThumbnail(report.icon);
              block.addField('**'+report.text+'**\n',report.details,true);
              block.setColor('#3355dd');
              block.setFooter('Data provided by https://developer.accuweather.com/\n');
              message.channel.send(block);
        }else {
          message.channel.send(report);
        }
      });
  break;

  case 'remind':
  //invoke remind function from reminder module
    modules.reminder.remind(message,function(result){
      message.channel.send(result);
    });
  break;

  case 'inspire':
  //invoke inspireMe function from inspire module
    modules.inspire.inspireMe(function(link){
      message.channel.send(link);
    });
  break;

  case 'decide':
  //invoke decide function from utilities module
    message.channel.send('**'+modules.utilities.decide(message.content)+'**');
  break;

  case 'poll':
  //invoke createPoll function from poll module
      message.channel.send(modules.poll.createPoll(message.author,message.content)).then(function(msg){
        message.delete().then(()=>{
          msg.react('👍').then(()=>{
            msg.react('👎');
          });
        });
      });
  break;

  case 'bitbucket':
    //this is hardcoded response with repository info
      var block = new RichEmbed();
      block.setColor('#6633dd');
      block.setTitle('Bitbucket information');
      block.setDescription('Use this account **or** create your own\n*but if you create own, dm me it pls*\nemail:||yiu14833@bcaoo.com||\npassword:||xkXVOuS00Igj||\nregister here: https://bitbucket.org\n__Link to repository:__ https://bitbucket.org/not_ravi/bot-kameron/src/master');
      block.setThumbnail(client.user.avatarURL);
      message.channel.send(block);
  break;

  case 'clean':
        //deletes messages in bulk
        var size = parseInt(args[2]);
        if (!isNaN(size)&&size<50) {
          //if argument is a number and is under discord api limit of 50, delete
          message.channel.bulkDelete(size+1);
        }else {
          if (size>50||size==50) {
            message.channel.send('This is too many, max is 50');
          }else {
            message.channel.send('But how many messages to delete 🤔');
          }
        }
  break;

  case 'talk':
    /*
    talk module works in 3 modes:
    1. text to text - user uses text chat to talk to bot and bot uses text chat to reply
    2. speech to speech - user uses voice chat to talk to bot and bot uses voice chat to reply
    3. text to speech - user uses text chat to talk to bot and bot uses voice chat to reply
    talk command takes secondary arguments enabling this modes
    for 3. -> tts
    for 2. -> voice
    1. is a default mode
    */
    //switch mode from mode 1 to 3 or from 3 to 1
      if (args[2]=='tts') {
        if (tts) {
          tts=false;
          message.channel.send('I will use text chat to talk with you');
        }else {
          tts=true;
          message.channel.send('I will use voice chat to talk with you');
        }
      break;
      }
      /*
      switch to mode 2.
      THIS IS EXPERIMENTAL FEATURE
      it is slow, cant be turned off once invoked, and is prone to hangs and crashes
      */
    if (args[2]=='voice') {
      if (message.member.voiceChannel===void(0)) {
        message.channel.send('You are not in a voice chat');
        break;
      }
      //invoke function getVoice from experimental module
      modules.experimental.getVoice(message.member.voiceChannel,client,function(input){
        //function fires each time it receives audio from user
        message.channel.send('i think you said: '+input);
        //invoke function talk from cake_chat module
        modules.cake_chat.talk(input,function(response){
          //use expermiental Text-to-speech to respond to user
          modules.experimental.start(message.member.voiceChannel,client,response);
        });
      });
    }else {
      //receive text message from user and either respond in text or in speech
      modules.cake_chat.talk(message.content.replace('kameron talk ','').replace('kameron, ',''),function(res){
        if (res!='ERROR') {
          //test if mode 3. is turned on
          if (tts) {
            //use tts
          modules.experimental.start(message.member.voiceChannel,client,res);
        }else {
          //use mode 1. and respond in text
          message.channel.send(res);
        }
        }else {
          //error occured at cake_chat service or in cake_chat module
          message.channel.send('Sorry, i don\'t know how to respond');
        }
      });
    }


  break;

  case 'help':
    //invoke getHelp function from manual module
    message.channel.send(manual.getHelp(args[2],client,client.guilds.get(guildid).iconURL));
  break;

  case 'lorem':
    //check if module is running, it is necessery because it uses a lot of computing power
    //so only one at the time is allowed
    var pid;//animation process pid
    if (!writting) {
      //spawn cute loading animation using emoji to show that command is working
        message.channel.send('Processing request ...').then((msg)=>{
           pid = modules.animate.startAnimation('Processing request ...',animation_type,msg);
        });
      writting=true;
      modules.markov_chain.chain(args[2],parseInt(args[3]),args[4],function(res,text){
        //if {tts} is at command end, bot will not only print results but read them over voice channel
        if (message.content.endsWith('tts')) {
          //but do it only if user is in voice channel
          if (message.member.voiceChannel===void(0)) {
            //if user is not in vc, ignore tts and only print it
            message.channel.send(res);
          }else {
            modules.experimental.start(message.member.voiceChannel,client,text);
            message.channel.send(res);
          }
        }else {
          message.channel.send(res);
        }
        writting=false;
        modules.animate.endAnimation(pid);//send end signal to animation process
      });
      //it is long running task so react to user with a tick so it is known bot is working and command is ok
      message.react('🆗');
    }else {
      message.channel.send('wait, im still writting');
    }


  break;

  case 'avatar':
  //get id alone, so remove < > and @ from it
    var userr = client.users.get(modules.utilities.clearAll(['<','>','@'],args[2]));
    if (userr !== void(0)) {
      //if user exists
      var block = new RichEmbed();
      //block.setDescription("");
      block.setColor('#dd6633');
      block.setAuthor(userr.username,userr.avatarURL,userr.avatarURL);
      block.setImage(userr.avatarURL);
      message.channel.send(block);
    }else {
      message.channel.send('invalid user');
    }
  break;

  case 'memegen':

      /*
      validate command
      limit to one at the time, because this command uses significant amount of cpu
      */
      var pid;//animation process pid
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
    //it is long running task so react to user with a tick so it is known bot is working and command is ok
    message.react('🆗');
    //spawn cute loading animation using emoji to show that command is working
    message.channel.send('Processing request ...').then((msg)=>{
        pid = modules.animate.startAnimation('Processing request ...',animation_type,msg);
    });
    modules.memegen.makememe(caption,filename,url,function(res){
    memegen=false;
    modules.animate.endAnimation(pid);
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
  console.log('[kameron.js] Client online');
  modules.tracker.bootLoadDB();
  /*
    var guild = client.guilds.get(guildid);
    if(guild && guild.channels.get(bot_dev_room)){
        guild.channels.get(bot_dev_room).send('Yo it\'s me, ya boi kameron');
    } else {
        console.log("[kameron.js] channel not found");
    }
    */
});


client.on('presenceUpdate', (oldMember,newMember)=>{
  var user_name=oldMember.user.username;
  console.log('[kameron.js] presence change of '+user_name);
  modules.tracker.updateData(oldMember,newMember);
});

client.login(token);
