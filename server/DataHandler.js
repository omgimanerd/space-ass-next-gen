/**
 * This file contains the class necessary to interpret latitude-longitude data
 * given back by the Google API.
 * @author Alvin Lin (alvin.lin@stuypulse.com)
 */

// Dependencies
var async = require('async');
var clusterfck = require('clusterfck');
var fs = require('fs');
var copy = require('shallow-copy');

var Util = require('./Util');

/**
 * @constructor
 * This class handles the interpretation of latitude, longitude, and meteorite
 * positional data.
 */
function DataHandler(meteoriteData, hotspots) {
  this.meteoriteData = meteoriteData;
  this.hotspots = hotspots;

  this.setup();
}

DataHandler.NEAR_COLOR = '#d00000';

DataHandler.FAR_COLOR = '#00e600';

DataHandler.NEARNESS_THRESHOLD = 2.5;

/**
 * @private
 * This function is called internally and reads the meteorites JSON file.
 * It will also calculate 10 of the highest ranked danger hotspots.
 * We use the clusterfck library to apply the KMeans clustering algorithm
 * to the meteorite coordinates.
 */
DataHandler.prototype.setup = function() {
  var context = this;

  async.series([
    function(callback) {
      fs.readFile('data/meteorites.json', function(err, data) {
        if (err) {
          throw err;
        }
        context.meteoriteData = JSON.parse(data);
        callback();
      });
    },
    function(callback) {
//      Bullshit way to get the cluster centroids.
//      We take the console.log output and copy it to a file lol.
//      var latlngs = [];
//      for (var meteor in context.meteoriteData) {
//        latlngs.push([
//          context.meteoriteData[meteor]['latitude'],
//          context.meteoriteData[meteor]['longitude']
//        ]);
//      }
//      var kmeans = new clusterfck.Kmeans();
//      var hotspotClusters = kmeans.cluster(latlngs, 10);
//      context.hotspots = [];
//      for (var i = 0; i < kmeans.centroids.length; ++i) {
//        var lat = kmeans.centroids[i][0];
//        var lng = kmeans.centroids[i][1];
//        context.hotspots.push({
//          lat: lat,
//          lng: lng,
//          rating: context.getDangerPercentageByDistance(lat, lng)
//        });
//      }
//      context.hotspots.sort(function(a, b) {
//        return b['rating'] - a['rating'];
//      });
//      console.log(JSON.stringify(context.hotspots));
//      We'll read from that file, fuck it.

      fs.readFile('data/hotspots.json', function(err, data) {
        if (err) {
          throw err;
        }
        context.hotspots = JSON.parse(data);
        callback();
      });
    }
  ]);
};

/**
 * Returns the top 10 meteorite hotspots.
 */
DataHandler.prototype.getHotspots = function() {
  var topHotspots = copy(this.hotspots);
  for (var i = 0; i < topHotspots.length; ++i) {
    hotspot = topHotspots[i]
    topHotspots[i]['nearbyMeteors'] = this.getNearbyMeteors(
        hotspot.lat, hotspot.lng);
  }
  return topHotspots;
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
DataHandler.prototype.getNearbyMeteors = function(latitude, longitude) {
  var nearbyMeteors = {};
  for (var meteor in this.meteoriteData) {
    if (Util.getSquaredEuclideanDistance(
        this.meteoriteData[meteor]['latitude'],
        this.meteoriteData[meteor]['longitude'],
        latitude,
        longitude) <
        DataHandler.NEARNESS_THRESHOLD * DataHandler.NEARNESS_THRESHOLD) {
      nearbyMeteors[meteor] = this.meteoriteData[meteor];
    }
  }
  return this.colorCodeMeteors(nearbyMeteors, latitude,
                               longitude);
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
                                                               longitude) {
  var nearbyMeteors = this.getNearbyMeteors(latitude, longitude);
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
                                                           longitude) {
  var nearbyMeteors = this.getNearbyMeteors(latitude, longitude);
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
                                                  longitude) {
  for (var meteor in meteors) {
    if (Util.getSquaredEuclideanDistance(
        this.meteoriteData[meteor]['latitude'],
        this.meteoriteData[meteor]['longitude'],
        latitude,
        longitude) <
        DataHandler.NEARNESS_THRESHOLD *
        DataHandler.NEARNESS_THRESHOLD / 4) {
      meteors[meteor]['color'] = DataHandler.NEAR_COLOR;
    } else {
      meteors[meteor]['color'] = DataHandler.FAR_COLOR;
    }
  }
  return meteors;
};

module.exports = DataHandler;
