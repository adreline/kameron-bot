const { Discord, RichEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
var request = require('request');
var dispatcher;
var queue=[];

exports.skipSong = function(){
  //end current stream
  //queue.unshift("dummy");//for some reason it skips two elements so here is dummy
  dispatcher.end();
  console.log('[music.js] dispatcher killed');
}
exports.viewQueue= function(){
  console.log('[music.js] viewQueue() function called');
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
  block.setColor('#33dd66');
  return block;
}
exports.nowPlaying= function(){
  console.log('[music.js] nowPlaying() function called');
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
  block.setColor('#33dd66');
  return block;
}
exports.playSong = function(voice_channel,url,callback){
  console.log('[music.js] playSong() function called');
  getMeta(url,function(info){
    console.log('[music.js] video meta data received');
    if (queue.length==0) {
      //if queue is empty, initiate it
      queue.push(info);
      //start playback
      console.log('[music.js] beginning playback');
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
    block.setColor('#33dd66');
    console.log('[music.js] returning embed');
    callback(block);
  });
}
function getMeta(url,callback){
  console.log('[music.js] requesting meta data');
  request("https://noembed.com/embed?url="+url, function(error, response, body) {
    if (error) {
      console.log('[music.js] request failed, error is:');
      console.log(error);
      callback({
        'title': 'request failed',
        'thumb': 'request failed',
        'url': url
      });
    }else {
      var m = JSON.parse(body);
      callback({
        'title': m.title,
        'thumb': m.thumbnail_url,
        'url': url
      });
    }
  });
}
function playYT(voice_channel){
  console.log('[music.js] playing song');
  console.log("Queue = "+queue);
  console.log("length = "+queue.length);
  const streamOptions = { seek: 0, volume: 0.3 };
  console.log('[music.js] attempting to join voice channel');
  voice_channel.join().then(connection => {
  //spawn ytdl stream using url from top of the queue
  console.log('[music.js] joined, spawning stream');
  const stream=ytdl(queue[0].url);
  //play ytdl stream
  console.log('[music.js] playing stream');
  dispatcher = connection.playStream(stream, streamOptions);
  dispatcher.on('end', () => {
    console.log('[music.js] stream ended, removing song from queue');
  //on stream end, remove element from queue
      queue.shift();
      if (queue.length!=0) {
        console.log('[music.js] queue not empty, recursive call');
        //if queue still has elements, play it
        playYT(voice_channel);
      }else {
        console.log('[music.js] queue empty, leaving voice chat');
        //leave channel
        voice_channel.leave();
      }
      });
    })
    .catch((error)=>{
      console.log('[music.js] error joining voice chat');
      console.log('[music.js] '+error);
    });
}
