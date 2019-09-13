const { Client, RichEmbed } = require('discord.js');
var animations = {
  clock:['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'],
  moon:['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'],
  bar:['[◽             ]','[◽◽      ]','[◽◽◽]','[      ◽◽]','[             ◽]'],
}
//this is used to asign an uniqe id to animation process
var id_seed=0;
//pids collection, contains id and status of animation as boolean
var pids = {};
exports.startAnimation = function(prefix,name,msg){
  console.log('[animate.js] Starting animation');
  //select animation
  frames=animations[name];
  //pull id
  new_id=id_seed;
  //put new id with status of animation into pids
  pids[new_id]=true;
  //spawn new animation
  running(new_id,prefix,frames,msg,0);
  //increment id, so that next time we pick it its diffrent (obv)
  id_seed++;
  //return pid
  console.log('[animate.js] Assigned pid = '+new_id);
  return new_id;
}
//the animation itself
function running(id,prefix,frames,msg,i){
  var index=i;//we track on which frame we are
  if (index==frames.length) {
    //if we are at the last frame, go to the beginning
    index=0;
  }
  //timeout is set for 1 sec. so framerate is 1 fps (wow)
  setTimeout(function() {
    msg.edit(prefix+' '+frames[index]).then(()=>{
      var n_i=index+1;
      //check if there was sigal to end animation
      if (pids[id]) {
        running(id,prefix,frames,msg,n_i);
      }else {
        msg.delete();
      }
    });
  }, 1000);
}
exports.endAnimation = function(id){
  console.log('[animate.js] Ending animetion with id: '+id);
  if (pids[id]!=void(0)&&pids[id]) {
    pids[id]=false;
  }
}
