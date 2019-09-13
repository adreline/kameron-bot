var request = require("request");
var fs = require("fs");
const api_key='RGAPI-1929e0fb-4e12-4147-a5c5-8b6b1cf163ae';
var db={};
var loaded=false;
exports.getMatch=getMatch;
exports.setSummoner=setSummoner;
function getMatch(user,callback){
    console.log('[opgg.js] getMatch() db not loaded, loading now');
    loadDB((sig)=>{
      if (sig=='ok') {
        console.log('[opgg.js] getMatch() db loaded successfuly');
        if (db[user]!=void(0)) {
          console.log('[opgg.js] getMatch() summoner found');
          var summoner_id = db[user].id;
          var url = 'https://'+db[user].region+'.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/'+summoner_id+'?api_key='+api_key;
          console.log('[opgg.js] getMatch() requesting match details');
          request({uri:url,timeout: 5000}, function (error, response, body) {
            if (error) {
              console.log('[opgg.js] getMatch() GET request failed');
              callback('Error occured');
            }else {
              console.log('[opgg.js] getMatch() result: ');
              var res = JSON.parse(body);
              if (res.status!=void(0)&&res.status.status_code!=200) {
                //player not in match
                console.log('[opgg.js] getMatch() player not in match ');
                //if thats the case, print profile
                getTier(db[user].id,db[user].region,(q)=>{
                  getSummonerIcon(db[user].summoner_name,db[user].region,(url)=>{
                    var rank =q.rank;
                    switch (rank) {
                      case 'I':
                        rank=1;
                      break;
                      case 'II':
                        rank=2;
                        break;
                        case 'III':
                          rank=3;
                          break;
                          case 'IV':
                            rank=4
                          break;
                      default:

                    }
                    var url2='http://opgg-static.akamaized.net/images/medals/'+q.tier.toLowerCase()+'_'+rank+'.png';
                    callback({
                      win:q.wins,
                      loss:q.losses,
                      rank:q.rank,
                      tier:q.tier,
                      lp:q.leaguePoints,
                      rank_icon:url2,
                      summoner_icon:url,
                      summoner:db[user].summoner_name,
                      region:db[user].region,
                      code:404
                    });
                    /*
                    example:
                    [
                {
                    "queueType": "RANKED_SOLO_5x5",
                    "summonerName": "Doss3",
                    "hotStreak": false,
                    "wins": 271,
                    "veteran": true,
                    "losses": 175,
                    "rank": "I",
                    "tier": "CHALLENGER",
                    "inactive": false,
                    "freshBlood": false,
                    "leagueId": "65ebcd4f-368c-30f6-a635-976beb0e1a8c",
                    "summonerId": "FbmMu9Z4C-zAUDoFMxuuIcVUlEaGe4mIMJtrdIUvErPFyA7p",
                    "leaguePoints": 795
                }
            ]
                    */
                  });
                });

              }else {
                /*
                Prepare Data to display, all good
                */
                var team1='';
                var team2='';
                res.participants.forEach((item,i)=>{
                  var temp = db.summoner_spells[item.spell1Id]+' '+db.summoner_spells[item.spell2Id]+' `'+item.summonerName+'` ->  **'+db.champions[item.championId]+'**\n';
                  if (item.summonerName==db[user].summoner_name) {
                    temp='__'+temp+'__';
                  }
                  if (i>=5) {
                    team2+=temp
                  }else {
                    team1+=temp
                  }
                });
                getSummonerIcon(db[user].summoner_name,db[user].region,(url)=>{
                  console.log(url);
                  callback({
                    code:200,
                    team1:team1,
                    team2:team2,
                    icon:url,
                    summoner:db[user].summoner_name
                  });
                });


              }
            }
          });
        }else {
          console.log('[opgg.js] getMatch() summoner not found');
          callback('User not found');
        }
      }else {
        console.log('[opgg.js] getMatch() db loading failed');
        callback('Error occured');
      }
    });
}

function setSummoner(name,region,author,callback){
  //format region
  var format_region=region;
  if (region=='EUNE') {
    format_region='EUN';
  }
  if (format_region!='RU'&&format_region!='KR') {
    format_region+=1;
  }
  loadDB((sig)=>{

    if (sig=='ok') {
      console.log('[opgg.js] setSummoner() db loaded successfuly');
      var url = 'https://'+format_region+'.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+name+'?api_key='+api_key;
      request({uri:url,timeout: 5000}, function (error, response, body) {
        if (error) {
          console.log('[opgg.js] setSummoner() error in GET request');
          callback('Error occured');
        }else {
          //parse api respose and save data
          var res = JSON.parse(body);
          //check if summoner was found
          console.log(res);
          if (res.status!=void(0)&&res.status.status_code!=200){
            console.log('[opgg.js] setSummoner() account not found');
            callback('Account not found');
          }else {
            //check if user is in db already
            var action = 'Account linked';
            if (db[author]!=void(0)) {
              action='Account updated';
            }

            db[author]={id:res.id,summoner_name:name,region:format_region};
            //save to file now
            saveDB((sig)=>{
              if (sig!='error') {
                console.log('[opgg.js] setSummoner() account linked successfuly');
                callback(action);
              }else {
                callback('Error occured');
              }
            });
          }
        }
      });
    }else {
      console.log('[opgg.js] setSummoner() db loading failed');
      callback('Error occured');
    }
  });

}
function getSummonerIcon(name,region,callback){
  var url = 'https://'+region+'.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+name+'?api_key='+api_key;
  request({uri:url,timeout: 5000}, function (error, response, body) {
    if (error) {
      console.log('[opgg.js] setSummoner() error in GET request');
      callback('Error occured');
    }else {
      //parse api respose and save data
      var res = JSON.parse(body);
      //check if summoner was found
      if (res.status!=void(0)&&res.status.status_code==404){
        console.log('[opgg.js] setSummoner() account not found');
        callback('error');
      }else {
        callback('http://opgg-static.akamaized.net/images/profile_icons/profileIcon'+res.profileIconId+'.jpg')
      }
    }
  });
}
function getTier(id,region,callback){
  var url = 'https://'+region+'.api.riotgames.com/lol/league/v4/entries/by-summoner/'+id+'?api_key='+api_key;
  request({uri:url,timeout: 5000}, function (error, response, body) {
    if (error) {
      console.log('[opgg.js] getTier() error in GET request');
      callback('Error occured');
    }else {
      //parse api respose and save data
      var res = JSON.parse(body);
      //check if summoner was found
      if (res.status!=void(0)&&res.status.status_code!=200){
        console.log('[opgg.js] getTier() account not found');
        callback('error');
      }else {
        //get data now, all good
        var q;
        res.forEach((item)=>{
          if (item.queueType=="RANKED_SOLO_5x5") {
            q=item;
          }
        });
        callback(q);

      }
    }
  });
}
function loadDB(callback){
  if (!loaded) {
    fs.readFile('/home/pi/Downloads/bot-kameron/temp/opgg.db', 'utf8', function(err, data) {
      if(err) {
        //error loading file
          console.log('[opgg.js] Error reading db');
          callback('error');
      }else{
        //success, save it to variable
          db = JSON.parse(data);
          console.log('[opgg.js] db loaded');
          loaded=true;
          callback('ok');
      }
    });
  }else {
    callback('ok');
  }


}

function saveDB(callback){
  fs.writeFile("/home/pi/Downloads/bot-kameron/temp/opgg.db", JSON.stringify(db), function(err) {
      if(err) {
          console.log('[opgg.js] Error saving db');
          callback('error');
      }else{
          console.log('[opgg.js] db saved');
          callback('ok');
      }
  });
}
