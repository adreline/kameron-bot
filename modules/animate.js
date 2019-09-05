const { Client, RichEmbed } = require('discord.js');
var animations = {
  clock:['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'],
  moon:['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'],
  bar:['[◽             ]','[◽◽      ]','[◽◽◽]','[      ◽◽]','[             ◽]'],
}
var id_seed=0;
var pids = {};
exports.startAnimation = function(prefix,name,msg){
  console.log('start anim');
  frames=animations[name];
  new_id=id_seed;
  pids[new_id]=true;
  running(new_id,prefix,frames,msg,0);
  id_seed++;
  return new_id;
}
function running(id,prefix,frames,msg,i){
  var index=i;
  if (index==frames.length) {
    index=0;
  }
  setTimeout(function() {
    msg.edit(prefix+' '+frames[index]).then(()=>{
      var n_i=index+1;
      if (pids[id]) {
        running(id,prefix,frames,msg,n_i);
      }else {
        msg.delete();
      }
    });
  }, 1000);
}
exports.endAnimation = function(id){
  if (pids[id]!=void(0)&&pids[id]) {
    pids[id]=false;
  }
}
