var PORT_NUMBER = process.env.PORT || 5000;

// Dependencies
var async = require('async');
var express = require('express');
var http_request = require('request');
var swig = require('swig');
var http = require('http');

var DataHandler = require('./server/DataHandler');

var app = express();
var dataHandler = new DataHandler();

app.engine('html', swig.renderFile);

app.set('port', PORT_NUMBER);
app.set('view engine', 'html');

app.use('/bower_components',
        express.static(__dirname + '/bower_components'));
app.use('/static',
        express.static(__dirname + '/static'));

app.get('/', function(request, response) {
  response.render('index.html');
});

GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
NEARNESS_THRESHOLD = 5;

app.get('/address', function(request, response) {
  var dangerPercentageByDistance = 0;
  var dangerPercentageByMass = 0;
  var latLng = null;
  var meteors = null;

  async.series([
    // This first asynchronous query gets the latitude and longitude from the
    // user's entered address so that we can query it in NASA's meteorite API.
    function(callback) {
      http_request(GEOCODE_URL + '?address=' +
                   encodeURIComponent(request.query.address),
                   function(error, googleResponse, body) {
        if (error) {
          callback(error);
          return;
        }
        body = JSON.parse(body);
        if (body.status != 'OK') {
          console.log('error');
          callback(body);
          return;
        }
        try {
          latLng = body.results[0].geometry.location;
        } catch (err) {
          callback(err);
        }
        callback();
      });
    },
    function(callback) {
      meteors = dataHandler.getNearbyMeteors(
          latLng.lat, latLng.lng, NEARNESS_THRESHOLD);
      dangerPercentageByDistance = dataHandler.getDangerPercentageByDistance(
          latLng.lat, latLng.lng, NEARNESS_THRESHOLD);
      dangerPercentageByMass = dataHandler.getDangerPercentageByMass(
          latLng.lat, latLng.lng, NEARNESS_THRESHOLD);
      callback();
    },
  ], function(error) {
    if (error) {
      console.error(error);
      return;
    }
    response.render('search.html', {
      percentageByDistance: dangerPercentageByDistance,
      percentageByMass: dangerPercentageByMass,
      lat: latLng.lat,
      lng: latLng.lng,
      meteors: meteors
    });
  });
});

var server = require('http').Server(app);
server.listen(PORT_NUMBER, function() {
  console.log('Listening to port ' + PORT_NUMBER);
});
