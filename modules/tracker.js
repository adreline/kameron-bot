const fs = require('fs');
var utilities = require('./utilities.js');
var db = {};
var loaded=false;
exports.updateData = function(oldMember,newMember){
  if (loaded) {
    main(oldMember,newMember);
  }else {
    console.log('[tracker.js] reading db');
    loadDB((sig)=>{
      if (sig!='error') {
        loaded=true;
        main(oldMember,newMember);
      }
    });
  }
}
function main(oldMember,newMember){
    var oldPresence=oldMember.frozenPresence;
    var newPresence=newMember.guild.presences.get(oldMember.user.id);
	  var from = oldPresence.status;
    var to = newPresence.status;
        if(from=='offline'&&to=='offline'){
        	console.log('[tracker.js] nothing to do, returning (off->off)');
          return null;
        }
        if ((oldPresence.game!=void(0)&&newPresence.game!=void(0))&&oldPresence.game.name==newPresence.game.name) {
          console.log('[tracker.js] nothing to do, returning (same game)');
          return null;
        }
  console.log('[tracker.js] updating user data');
  var user_name=oldMember.user.username;
  var user_id=oldMember.user.id;
  var presence = oldMember.guild.presences.get(user_id).game;
  //look up user in db
  if(db[user_id]!=void(0)){
    console.log('[tracker.js] user found');
    if (presence!=null&&!db[user_id].ingame) {
      console.log('[tracker.js] in game, adding data');
      db[user_id].ingame=true;
      db[user_id].started=Date.now();
      db[user_id].curr_game=presence.name;
    }else {
      if (db[user_id].ingame&&presence==null) {
        console.log('[tracker.js] user stopped playing game');
        //calculate time elapsed
        var time = Date.now() - parseInt(db[user_id].started);
        //add this data to db
        if (db[user_id].games[db[user_id].curr_game]!=null) {
          //user played this game before, add time
          var score = db[user_id].games[db[user_id].curr_game];
          var new_score=parseInt(score)+time;
          db[user_id].games[db[user_id].curr_game]=new_score;
        }else {
          //user didnt play this game before, push data
          var game_name=db[user_id].curr_game;
          db[user_id].games[game_name]=time;
        }
        //finished updating, nullify all fields
        db[user_id].curr_game=null
        db[user_id].ingame=false;
        db[user_id].started=null;
      }else {
        console.log('[tracker.js] user was not playing any game');
        //presence changed but not from online to in game nor from in game to online
        //meaning it changed from online to offline (possibly)

        var user_id=oldMember.user.id;
        console.log('[tracker.js] status: '+from+' -> '+to);
        if (to=='offline') {
          console.log('[tracker.js] user went offline');
          db[user_id].online_score += Date.now() - db[user_id].went_online_at;
        }
        if (from=='offline') {
          console.log('[tracker.js] user went online');
          db[user_id].went_online_at=Date.now();
        }
      }
    }
  }else {
    //create user in db
    console.log('[tracker.js] user not in db, adding');
    db[user_id] ={ingame:false,started:null,curr_game:null,games:{},online_score:0,went_online_at:Date.now()};

  }
saveDB();
}


exports.getData = function (user_id,epoch){
  //Math.floor((end-start)/1000) -> extract seconds
  if (db[user_id]!=void(0)) {
    //parse user data and return it
    var data = db[user_id];
    var games='';
    var games_seconds=0;//total seconds spent in game
    //check if data.games is not empty
    if (Object.keys(data.games).length) {
      //sort data
      var keysSorted = Object.keys(data.games).sort(function(a,b){return data.games[a]-data.games[b]});
      keysSorted.forEach((key)=>{
        var game_seconds=Math.floor(data.games[key]/1000);//transform score from ms to seconds
        games_seconds+=game_seconds;
        var temp = utilities.parseTime(game_seconds);
        games='**'+key+'** -> `'+temp+'`\n'+games;
      });

  }else {
    games='Nothing found <:pepe:597901883935293490>';
  }
    var online_score=Math.floor(data.online_score/1000); //transform score from ms to seconds
    var p_online=Math.floor(((data.online_score/(Date.now()-epoch))*100)); //calculate precentage of total time spent online since epoch start
    console.log('[tracker.js] returning user data');
    //calculate fun stats
    var disprofit=(0.000000044*500*online_score).toFixed(2);
    var carbon=(((500*(online_score/3600))/1000)*0.4759).toFixed(2);
    //calculate experiance
    //calculate exp from gaming and idling separately, gaming gives more
    var rank=calculateExp(games_seconds,(online_score-games_seconds));
    online_score=utilities.parseTime(online_score);

   return {
      p_online:p_online,
      online_score:online_score,
      games:games,
      disprofit:disprofit,
      carbon:carbon,
      rank:rank
    };
  }else {
    console.log('[tracker.js] user not found');
    return null;
  }
}
exports.bootLoadDB = function(){
  loadDB(()=>{});
}
function loadDB(callback){
  fs.readFile('/home/pi/Downloads/bot-kameron/temp/tracker.db', 'utf8', function(err, data) {
    if(err) {
      //error loading file
        console.log('[tracker.js] Error reading db');
        callback('error');
    }else{
      //success, save it to variable
        db = JSON.parse(data);
        console.log('[tracker.js] db loaded');
        callback('ok');
    }
  });
}
function saveDB(){
  fs.writeFile("/home/pi/Downloads/bot-kameron/temp/tracker.db", JSON.stringify(db), function(err) {
      if(err) {
          console.log('[tracker.js] Error saving db');
      }else{
          console.log('[tracker.js] db saved');
      }
  });
}
function calculateExp(g,t){
  var total_exp=(t*0.1)+(g*0.5);
  var lvl=0;
  var next_lvl=7;
do {
  lvl+=1;
  next_lvl = next_lvl+20;
  total_exp=total_exp-next_lvl;
} while (total_exp>=0);
var curr_xp=Math.floor(total_exp+next_lvl);
//this is renderin progress bar
var filled_bars=Math.round(((curr_xp/next_lvl)*100)/(100/6));
var unfilled_bars=6-filled_bars;
var bar='';
while (filled_bars!=0) {
  bar+='💚';
  filled_bars--;
}
while (unfilled_bars!=0) {
  bar+='🖤';
  unfilled_bars--;
}
return {lvl:lvl,xp:curr_xp,next:next_lvl,bar:bar};
}
