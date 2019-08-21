const { Discord, RichEmbed } = require('discord.js');
const fs = require('fs');
const shell = require('shelljs');
const streamOptions = { seek: 0, volume: 0.3 };
var broadcast;
var dispatcher;
var once = true;
exports.start = function(voice_channel,client,text){
  voice_channel.join().then(connection => {
    if (once) {
      broadcast = client.createVoiceBroadcast();
      dispatcher = connection.playBroadcast(broadcast);
    }
    shell.exec('echo "'+text+'"|text2wave -o sample.wav', {async:false});
    broadcast.playFile('/home/pi/Downloads/bot-kameron/sample.wav');
      /*
      dispatcher.on('end', () => {
            voice_channel.leave();
          });
          */
    })
    .catch(console.error);
}


 exports.getVoice = function(voice_channel,client,callback){
  voice_channel.join()
      .then(conn => {
        console.log('ready');
        // create our voice receiver
        const receiver = conn.createReceiver();
        const broadcast = client.createVoiceBroadcast();
        const dispatcher = conn.playBroadcast(broadcast);
        broadcast.playFile('hi.wav');

        conn.on('speaking', (user, speaking) => {
          if (speaking) {
            console.log(`I'm listening to ${user}`);
            // this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
            const audioStream = receiver.createPCMStream(user);
            // create an output stream so we can dump our data in a file
            var fileName = `${user.id}-${Date.now()}.pcm`;
            var outputStream = fs.createWriteStream(fileName);
            // pipe our audio data into the file stream
            audioStream.pipe(outputStream);
            outputStream.on("data", console.log);
            // when the stream ends (the user stopped talking) tell the user
            audioStream.on('end', () => {
              console.log(`I'm no longer listening to ${user}`);
              shell.exec('ffmpeg -y -f s16le -ar 44100 -ac 2 -i '+fileName+' -ar 44100 -ac 2 input.wav',{async:false});
              var results = shell.exec('python3 /home/pi/Downloads/bot-kameron/recognize.py',{async:false});
              shell.exec('rm /home/pi/Downloads/bot-kameron/*.pcm');
              callback(results);
            });
          }
        });
      })
      .catch(console.log);
}
