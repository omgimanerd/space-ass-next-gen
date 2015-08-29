/**
 * This file contains the class necessary to interpret latitude-longitude data
 * given back by the Google API.
 * @author Alvin Lin (alvin.lin@stuypulse.com)
 */

// Dependencies
var fs = require('fs');

function DataHandler(meteoriteData) {
  this.meteoriteData = meteoriteData;

  this.setup();
}

DataHandler.prototype.setup = function() {
  var context = this;
  fs.readFile('data/meteorites.json', function(err, data) {
    if (err) {
      throw err;
    }
    context.meteoriteData = JSON.parse(data);
  });
};

DataHandler.prototype.getNearbyMeteors = function(latitude, longitude,
                                                  threshold) {
  var nearbyMeteors = {};
  for (var meteor in this.meteoriteData) {
    if (Math.abs(this.meteoriteData[meteor].latitude - latitude) <
            threshold &&
        Math.abs(this.meteoriteData[meteor].longitude - longitude) <
            threshold) {
      nearbyMeteors[meteor] = this.meteoriteData[meteor];
    }
  }
  return nearbyMeteors;
};

DataHandler.prototype.getDangerPercentageByDistance = function(latitude,
                                                               longitude,
                                                               threshold) {
  var nearbyMeteors = this.getNearbyMeteors(latitude, longitude, threshold);
  return nearbyMeteors.length / this.meteoriteData.length;
};

DataHandler.prototype.getDangerPercentageByMass = function(latitude,
                                                           longitude,
                                                           threshold) {
  var nearbyMeteors = this.getNearbyMeteors(latitude, longitude, threshold);
  var nearbyMassSum = nearbyMeteors.reduce(function(prev, curr) {
    return prev + curr.mass;
  });
  var totalMassSum = this.meteoriteData.reduce(function(prev, curr) {
    return prev + curr.mass;
  });
  return nearbyMassSum / totalMassSum;
};

module.exports = DataHandler;
