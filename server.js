var PORT_NUMBER = process.env.PORT || 5000;

// Dependencies
var async = require('async');
var express = require('express');
var http_request = require('request');
var http = require('http');
var morgan = require('morgan');
var swig = require('swig');

var DataHandler = require('./server/DataHandler');

var app = express();
var dataHandler = new DataHandler();

app.engine('html', swig.renderFile);

app.set('port', PORT_NUMBER);
app.set('view engine', 'html');

app.use(morgan(':date[web] :method :url :req[header] :remote-addr :status'));
app.use('/bower_components',
        express.static(__dirname + '/bower_components'));
app.use('/static',
        express.static(__dirname + '/static'));

app.get('/', function(request, response) {
  response.render('index.html');
});

GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

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
                   encodeURIComponent(request.query.address) +
                   '&key=' + process.env.GEOCODE_KEY,
                   function(error, googleResponse, body) {
        if (error) {
          callback(error);
          return;
        }
        body = JSON.parse(body);
        if (body.status != 'OK') {
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
      dangerPercentageByDistance = dataHandler.getDangerPercentageByDistance(
          latLng.lat, latLng.lng);
      dangerPercentageByMass = dataHandler.getDangerPercentageByMass(
          latLng.lat, latLng.lng);
      meteors = dataHandler.getNearbyMeteors(
          latLng.lat, latLng.lng);
      callback();
    },
  ], function(error) {
    if (error) {
      console.error(error);
      response.render('index.html', {
        error: 'Something went wrong, try a different input or wait a bit.'
      });
    } else {
      response.render('search.html', {
        percentageByDistance: dangerPercentageByDistance,
        percentageByMass: dangerPercentageByMass,
        lat: latLng.lat,
        lng: latLng.lng,
        meteors: meteors
      });
    }
  });
});

app.get('/rank', function(request, response) {
  var hotspots = dataHandler.getHotspots();
  response.render('rank.html', {
    hotspots: hotspots
  });
});

var server = require('http').Server(app);
server.listen(PORT_NUMBER, function() {
  console.log('Listening to port ' + PORT_NUMBER);
});
