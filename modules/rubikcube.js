const { Client, RichEmbed } = require('discord.js');
var utilities = require("./utilities.js");
var client;
//cube object
var rc = {
  sides:{
  1:{
    fill:'❤',
    state:[
      1,1,1,
      1,1,1,
      1,1,1
    ],
    move:{
      up:5,
      down:6,
      left:4,
      right:2
    }
  },
  2:{
    fill:'💛',
    state:[
      2,2,2,
      2,2,2,
      2,2,2
    ],
    move:{
      up:5,
      down:6,
      left:1,
      right:3
    }
  },
  3:{
      fill:'💚',
      state:[
        3,3,3,
        3,3,3,
        3,3,3
      ],
      move:{
        up:5,
        down:6,
        left:2,
        right:4
      }
  },
  4:{
    fill:'💙',
    state:[
      4,4,4,
      4,4,4,
      4,4,4
    ],
    move:{
      up:5,
      down:6,
      left:3,
      right:1
    }
  },
  5:{
    fill:'💜',
    state:[
      5,5,5,
      5,5,5,
      5,5,5
    ],
    move:{
      up:3,
      down:1,
      left:4,
      right:2
    }
  },
  6:{
    fill:'🖤',
    state:[
      6,6,6,
      6,6,6,
      6,6,6
    ],
    move:{
      up:1,
      down:3,
      left:4,
      right:2
    }
  }
},
  view:1,
  solved:false
};

//create image of current cube side
function renderCube(rc){
  //get current side
  var side=rc.sides[rc.view];
  var render='';//final image
  var delimiter=0;//break after 3 (to produce 3x3 box ofc)
  side.state.forEach(item => {
    render+=rc.sides[item].fill;//each side has unique fill (color) assigned to it
    delimiter++;
    if (delimiter==3) {
      //add new line when we already printed 3 cells in current row
      delimiter=0;
      render+='\n';
    }
  });
  return render;
}
//scramble the cube
function shuffleCube(rc){
  //each color can be used only 9 times, pool holds how many uses of given color is left
  var pool=[9,9,9,9,9,9];
  var temp = rc;
    for (var index in temp.sides) {
      for(var indexx in temp.sides[index].state){
        var dice=utilities.getRandom(1,6);
        while (pool[dice-1]==0) {
          //if for current cell is chosen color that have been already used up, keep rolling new untill
          //correct is diced
          // OPTIMIZE: this can keep rolling unavaiable color many times before it roll avaiable one
          // TODO: remove unavaiable colors and make get random roll using only ones that are avaiable
          dice=utilities.getRandom(1,6);
        }
        temp.sides[index].state[indexx]=dice;
        pool[dice-1]--;
      }
  }
  return temp;
}
//attach reactions
function addControls(cube,callback){
  //add reactions one at the time (so they are in order)
    cube.react('◀')
    .then(()=>{
      cube.react('▶')
      .then(()=>{
        cube.react('🔀')
        .then(()=>{
          cube.react('💢')
          .then(()=>{
              callback();
            });
        });
    });
  });
}
exports.spawnCube = function(cli,msg){
client=cli;
var block = new RichEmbed();
block.setTitle('Rubik Cube');
block.setDescription(renderCube(rc));
//block.setURL();
//block.setThumbnail();
block.setColor('RANDOM');
block.setFooter('Viewing side: '+rc.view);
msg.channel.send(block).then((cube)=>{

  addControls(cube,function(){
    cube.awaitReactions(reaction=>{
      switch (reaction.emoji.name) {
        case '💢':
        //this case is for debugging
        for (var index in rc.sides) {
          console.log(rc.sides[index].state);
        }
        break;
        case '🔀':
          console.log('shuffle');
          rc = shuffleCube(rc);
          block.setDescription(renderCube(rc));
          block.setFooter('Viewing side: '+rc.view);
          cube.edit(block);
        break;
        case '▶':
          console.log('right');
          if (rc.view==6) { //if at last side, go to beginning
            rc.view=0;
          }
          rc.view++;
          block.setDescription(renderCube(rc));
          block.setFooter('Viewing side: '+rc.view);
          cube.edit(block);
        break;
        case '◀':
          console.log('left');
          if (rc.view==1) { //if at first side, go to ending
            rc.view=7;
          }
          rc.view--;
          block.setDescription(renderCube(rc));
          block.setFooter('Viewing side: '+rc.view);
          cube.edit(block);
        break;
        default:

      }
    });
  });

});
}
