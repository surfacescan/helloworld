// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".


Players = new Meteor.Collection("players");


if(Meteor.isServer){
Meteor.methods({

   getWeather: function(city, country){

      var Future = Meteor.require('future');
      var myFuture = new Future();
      console.log(myFuture);

var weather_result = Async.runSync(function(done) {

      Meteor.http.get("http://api.coindesk.com/v1/bpi/currentprice.json", function (error, result) {
      //Meteor.http.get("http://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country, function (error, result) {
if(error) {
    console.log('http get FAILED!');
} else {
    console.log('http get SUCCES');
    if (result.statusCode === 200) {
        console.log('Status code = 200!');
        console.log(result.content);
    }
    done(null,result);
}
});
});
    return JSON.parse(weather_result.result.content).bpi.USD.rate;

    }
});
}

if (Meteor.isClient) {

  Template.leaderboard.weather = function (){
    return Session.get('weather');
  };

  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
      
      Meteor.call('getWeather', 'Berlin', 'Germany', function(err, data) {
         if (err)
            console.log(err);
         console.log("here it comes..." + data);
         Session.set('weather', data);
      });
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
// it is backed by a MongoDB collection named "players".
