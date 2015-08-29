/**
 * This file contains the class necessary to interpret latitude-longitude data
 * given back by the Google API.
 * @author Alvin Lin (alvin.lin@stuypulse.com)
 */

// Dependencies
var fs = require('fs');
var Util = require('./Util');

/**
 * @constructor
 * This class handles the interpretation of latitude, longitude, and meteorite
 * positional data.
 */
function DataHandler(meteoriteData) {
  this.meteoriteData = meteoriteData;

  this.setup();
}

DataHandler.NEAR_COLOR = '#d00000';

DataHandler.FAR_COLOR = '#00e600';

/**
 * @private
 * This function is called internally and reads the meteorites JSON file.
 */
DataHandler.prototype.setup = function() {
  var context = this;
  fs.readFile('data/meteorites.json', function(err, data) {
    if (err) {
      throw err;
    }
    context.meteoriteData = JSON.parse(data);
  });
};

/**
 * This function returns an object of the same format as data/meteorites.json
 * but contains only meteors that are closer than the given threshold to the
 * given latitude and longitude. It will also call colorCodeMeteors on the list
 * of meteors.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} threshold
 */
DataHandler.prototype.getNearbyMeteors = function(latitude, longitude,
                                                  threshold) {
  var nearbyMeteors = {};
  for (var meteor in this.meteoriteData) {
    if (Util.getSquaredEuclideanDistance(
        this.meteoriteData[meteor]['latitude'],
        this.meteoriteData[meteor]['longitude'],
        latitude,
        longitude) < threshold * threshold) {
      nearbyMeteors[meteor] = this.meteoriteData[meteor];
    }
  }
  return this.colorCodeMeteors(nearbyMeteors, latitude,
                               longitude, threshold / 2);
};

/**
 * Given a latitude, longitude, and distance threshold, this function returns
 * a decimal number representing the danger percentage index of the location
 * by frequency of meteors in the area versus frequency worldwide.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} threshold
 */
DataHandler.prototype.getDangerPercentageByDistance = function(latitude,
                                                               longitude,
                                                               threshold) {
  var nearbyMeteors = this.getNearbyMeteors(latitude, longitude, threshold);
  return Object.keys(nearbyMeteors).length /
      Object.keys(this.meteoriteData).length;
};

/**
 * Given a latitude, longitude, and distance threshold, this function returns
 * a decimal number representing the danger percentage index of the location
 * by the total mass of the meteors in the region versus the total mass of
 * all meteors worldwide.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} threshold
 */
DataHandler.prototype.getDangerPercentageByMass = function(latitude,
                                                           longitude,
                                                           threshold) {
  var nearbyMeteors = this.getNearbyMeteors(latitude, longitude, threshold);
  var nearbyMassSum = 0;
  for (var meteor in nearbyMeteors) {
    nearbyMassSum += nearbyMeteors[meteor]['mass'];
  }
  var totalMassSum = 0;
  for (var meteor in this.meteoriteData) {
    totalMassSum += this.meteoriteData[meteor]['mass'];
  }
  return nearbyMassSum / totalMassSum;
};

/**
 * This function will mutate the given array of meteor objects and add a field to
 * each meteor specifying its color based on its distance from the latitude and
 * longitude.
 * @private
 * @param {Array.<Object>} meteors
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} threshold
 */
DataHandler.prototype.colorCodeMeteors = function(meteors, latitude,
                                                  longitude, threshold) {
  for (var meteor in meteors) {
    if (Util.getSquaredEuclideanDistance(
        this.meteoriteData[meteor]['latitude'],
        this.meteoriteData[meteor]['longitude'],
        latitude,
        longitude) < threshold * threshold) {
      meteors[meteor]['color'] = DataHandler.NEAR_COLOR;
    } else {
      meteors[meteor]['color'] = DataHandler.FAR_COLOR;
    }
  }
  return meteors;
};

module.exports = DataHandler;
