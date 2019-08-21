const { RichEmbed } = require('discord.js');
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
manual.set('weather','kameron weather <location>\ngives current weather at location\nJust type in the city and country (or only city but idk what will happen)\n**example:**\nkameron weather Lublin Poland\n\n__Note__\n**kameron weather backup_api** - this will swap api key, use if one is now working\n**kameron weather api** - this will tell you which api key kameron is using currently');
manual.set('play','kameron play <youtube link>\nplay a youtube video, this command will add any new files to the queue if its already playing something\n**kameron play skip** - Skip current song\n**kameron play song** - See what is playing right now\n**kameron play queue** - View song queue');

exports.getHelp = function(command){


  if (command===void(0)) {
    //none command was suplied so we print all commands
    var block = new RichEmbed();
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
    return block;
  }else {
    if (manual.get(command)===void(0)) {
      //command name was suplied but it cannot be found in manual
      return 'command not found in manual, try "kameron help" for list of commands';
    }else {
      //all good we can print help on specific command
      var block = new RichEmbed();
      block.setTitle(command);
      block.setDescription(manual.get(command));
      block.setColor('RANDOM');
      return block;
    }
  }



}
