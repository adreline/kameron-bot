var shell = require('shelljs');
const { RichEmbed } = require('discord.js');

exports.chain = function(source,state,length,callback){
  //source state length
  if (state!=1||state!=2||state!=3) {
    state=3;
    }
  if (source=='combine') {
    var child = shell.exec('python3 /home/pi/Downloads/bot-kameron/modules/markov/fixed_markov.py', {async:true});
    child.stdout.on('data', function(data) {
      var block = new RichEmbed();
      block.setTitle('Story');
      block.setDescription(data);
      block.setColor('RANDOM');
      callback(block,data);
    });
  }else {
    if (source=='lotr'||source=='lovecraft') {
        if (length=='story'||length=='quoute') {
          console.log('state='+state);
          var child = shell.exec('python3 /home/pi/Downloads/bot-kameron/modules/markov/markov.py '+source+' '+state+' '+length, {async:true});
          child.stdout.on('data', function(data) {
            if (length=='quoute') {
              callback('*"'+data.trim()+'"*');
            }else {
              var block = new RichEmbed();
              block.setTitle('Story');
              block.setDescription(data);
              block.setColor('RANDOM');
              callback(block,data);
            }

          });
        }else {
          callback('invalid length');
        }
    }else {
      callback('invalid source');
    }


  }




}
