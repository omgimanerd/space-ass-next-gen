var PORT_NUMBER = process.env.PORT || 5000;

// Dependencies
var async = require('async');
var bodyParser = require('body-parser');
var express = require('express');
var swig = require('swig');
var https = require('https');

var app = express();

app.engine('html', swig.renderFile);

app.set('port', PORT_NUMBER);
app.set('view engine', 'html');

app.use('/bower_components',
        express.static(__dirname + '/bower_components'));
app.use('/static',
        express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(request, response) {
  response.render('index.html');
});

app.get('/address', function(request, response) {
  var data = null;
  console.log(request.body);
  async.parallel([
    function(callback) {
      var options = {
        'host': 'https.//maps.googleapis.com',
        'path': '/maps/api/geocode/json?address=1164'
      };
      https.request(options, function(googleResponse) {
        googleResponse.on('data', function(chunk) {
          data = chunk;
        });
      });
    }
  ], function(error) {
    if (error) {
      console.log(error);
    }
  });
});

var server = require('http').Server(app);
server.listen(PORT_NUMBER, function() {
  console.log('Listening to port ' + PORT_NUMBER);
});
