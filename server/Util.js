/**
 * This class contains utility methods used on the server.
 * @author Alvin Lin (alvin.lin@stuypulse.com)
 */

function getSquaredEuclideanDistance(x1, y1, x2, y2) {
  return (Math.abs(y2 - y1) * Math.abs(y2 - y1)) +
      (Math.abs(x2 - x1) * Math.abs(x2 - x1));
};

module.exports.getSquaredEuclideanDistance = getSquaredEuclideanDistance;
