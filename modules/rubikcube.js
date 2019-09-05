const { Client, RichEmbed } = require('discord.js');
var utilities = require("./utilities.js");
var client;
var rc = {
  sides:{
    1:{
    fill:'1',
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
    fill:'2',
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
      fill:'3',
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
    fill:'4',
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
    fill:'5',
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
    fill:'6',
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


function renderCube(rc){
  var side=rc.sides[rc.view];
  var render='';
  var delimiter=0;
  console.log(side.state);
  side.state.forEach(item => {
    console.log(item);
    render+=rc.sides[item].fill;
    delimiter++;
    if (delimiter==3) {
      delimiter=0;
      render+='\n';
    }
  });
  return render;
}
function shuffleCube(rc){
  var pool=[9,9,9,9,9,9];
  var temp = rc;
    for (var index in temp.sides) {
      for(var indexx in temp.sides[index].state){
        var dice=utilities.getRandom(1,6);
        while (pool[dice-1]==0) {
          dice=utilities.getRandom(1,6);
        }
        temp.sides[index].state[indexx]=dice;
        pool[dice-1]--;
      }
  }
  return temp;
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

  cube.react('🔼')
  .then(()=>{
    cube.react('🔽')
    .then(()=>{
      cube.react('▶')
      .then(()=>{
        cube.react('◀')
        .then(()=>{
          cube.react('🔀')
          .then(()=>{
            cube.react('💢')
            .then(()=>{
                cube.awaitReactions(reaction=>{
                  switch (reaction.emoji.name) {
                    case '💢':
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
                    case '🔼':
                      console.log('up');
                      var side = rc.sides[rc.view];
                      rc.view=side.move.up;
                      block.setDescription(renderCube(rc));
                      block.setFooter('Viewing side: '+rc.view);
                      cube.edit(block);
                    break;
                    case '🔽':
                      console.log('down');
                      var side = rc.sides[rc.view];
                      rc.view=side.move.down;
                      block.setDescription(renderCube(rc));
                      block.setFooter('Viewing side: '+rc.view);
                      cube.edit(block);
                    break;
                    case '▶':
                      console.log('right');
                      var side = rc.sides[rc.view];
                      rc.view=side.move.right;
                      block.setDescription(renderCube(rc));
                      block.setFooter('Viewing side: '+rc.view);
                      cube.edit(block);
                    break;
                    case '◀':
                      console.log('left');
                      var side = rc.sides[rc.view];
                      rc.view=side.move.left;
                      block.setDescription(renderCube(rc));
                      block.setFooter('Viewing side: '+rc.view);
                      cube.edit(block);
                    break;
                    default:

                  }
                });

              });

          });

      });
    })
  })
});
});
}
