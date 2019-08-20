const request = require('request');

var city,conditions;
exports.getWeather = function(apikey, location, callback){

  //first grab city key
  request('http://dataservice.accuweather.com/locations/v1/cities/search?apikey='+apikey+'&q='+location, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      city=JSON.parse(response.body)[0];
      console.log(city);
        //if no errors now grab forecast
        request('http://dataservice.accuweather.com/currentconditions/v1/'+city.Key+'?apikey='+apikey+'&details=true', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //if no errors parse response and return fields needed
            conditions = JSON.parse(response.body)[0];
            callback(true,{
              'text': conditions.WeatherText,
              'details':  '🌡 Temperature -> '+conditions.Temperature.Metric.Value+' °'+conditions.Temperature.Metric.Unit+'\n'+
                          '💧 Relative Humidity -> '+conditions.RelativeHumidity+'%'+'\n'+
                          '☁ Cloud cover -> '+conditions.CloudCover+'%'+'\n\n'+
                          'Pressure  -> '+conditions.Pressure.Metric.Value+' '+conditions.Pressure.Metric.Unit+' '+conditions.PressureTendency.LocalizedText+'\n'+
                          'Visibility  -> '+conditions.Visibility.Metric.Value+' '+conditions.Visibility.Metric.Unit+'\n'+
                          'UV Index -> '+conditions.UVIndex+' '+conditions.UVIndexText+'\n\n'+
                          '💨 Wind -> '+conditions.Wind.Speed.Metric.Value+' '+conditions.Wind.Speed.Metric.Unit+' '+conditions.Wind.Direction.English+' '+conditions.Wind.Direction.Degrees+'°'+'\n\n'+
                          'Dew point -> '+conditions.DewPoint.Metric.Value+' °'+conditions.DewPoint.Metric.Unit+'\n\n'+
                          '🌧 Rainfall past 1h -> '+conditions.Precip1hr.Metric.Value+' '+conditions.Precip1hr.Metric.Unit,
              'icon': 'https://developer.accuweather.com/sites/default/files/'+conditions.WeatherIcon+'-s.png',
              'link': conditions.Link,
              'location': city.EnglishName+' '+city.Country.EnglishName
            });
          }else {
            console.error('error:', error); // Print the error if one occurred

            if (JSON.parse(response.body).Code=='ServiceUnavailable') {
              callback(false,JSON.parse(response.body).Message);
            }else {
              console.log(body);
              callback(false,'error occured during forecast request');
            }
          }
        });
    }else {
      console.error('error:', error); // Print the error if one occurred
      if (JSON.parse(response.body).Code=='ServiceUnavailable') {
        callback(false,JSON.parse(response.body).Message);
      }else {
        console.log(body);
        callback(false,'error occured during location search');
      }
    }
  });


}
