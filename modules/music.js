const { Discord, RichEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
var request = require('request');
var dispatcher;
var queue=[];

exports.skipSong = function(){
  //end current stream
  //queue.unshift("dummy");//for some reason it skips two elements so here is dummy
  dispatcher.end();
}
exports.viewQueue= function(){
  var block = new RichEmbed();
  block.setTitle('Music queue');
  if (queue.length!=0) {
    block.setThumbnail(queue[0].thumb);
    var titles='';
    var i = 0;
    queue.forEach(function(song){
      i=i+1;
      titles+=i+'. '+song.title+'\n'
    });
    block.setDescription('__Songs: __\n'+titles);
  }else {
    block.setThumbnail('https://cdn.discordapp.com/avatars/596729492194721813/79ac20716cff1bd79e0c7ba23694bc62.png');
    block.setDescription('Elements: \n'+'Empty');
  }
  block.setColor('RANDOM');
  return block;
}
exports.nowPlaying= function(){
  var block = new RichEmbed();
  if (queue.length==0) {
    return 'Nothing is playing right now';
  }else {
    block.setTitle(queue[0].title);
    block.setThumbnail(queue[0].thumb);
    block.addField('Queue size:',queue.length);
    if (queue.length>1) {
      block.addField('Coming next',queue[1].title);
    }else {
      block.addField('Coming next','None');
    }
  }
  block.setColor('RANDOM');
  return block;
}
exports.playSong = function(voice_channel,url,callback){
  getMeta(url,function(info){
    if (queue.length==0) {
      //if queue is empty, initiate it
      queue.push(info);
      //start playback
      playYT(voice_channel);
    }else{
      //queue is not empty
      //push element at the end of queue
      queue.push(info);
    }
    //send rich embed message
    var block = new RichEmbed();
    block.setTitle(info.title);
    block.setThumbnail(info.thumb);
    block.setDescription('Added to queue\nQueue size: '+queue.length);
    block.addField('Position in Queue',queue.length,true);
    block.setColor('RANDOM');
    callback(block);
  });
}
function getMeta(url,callback){
  request("https://noembed.com/embed?url="+url, function(error, response, body) {
    var m = JSON.parse(body);
    callback({
      'title': m.title,
      'thumb': m.thumbnail_url,
      'url': url
    });
  });
}
function playYT(voice_channel){
  console.log("Queue = "+queue);
  console.log("length = "+queue.length);
  const streamOptions = { seek: 0, volume: 0.3 };

  voice_channel.join().then(connection => {
  //spawn ytdl stream using url from top of the queue
  const stream=ytdl(queue[0].url);
  //play ytdl stream
  console.log('Spawn stream');
  dispatcher = connection.playStream(stream, streamOptions);
  dispatcher.on('end', () => {
  //on stream end, remove element from queue
      queue.shift();
      if (queue.length!=0) {
        //if queue still has elements, play it
        playYT(voice_channel);
      }else {
        //leave channel
        voice_channel.leave();
      }
      });
    })
    .catch(console.error);
}
