const { RichEmbed } = require('discord.js');
exports.createPoll = function(author,description){
  var block = new RichEmbed();
  block.setTitle("Poll");
  block.setDescription(description.replace('kameron poll',''));
  block.setAuthor(author.username,author.avatarURL);
  block.setColor('#dd6633');
  block.setFooter('vote by using reactions below');
  return block;
}
