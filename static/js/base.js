/**
 * This file contains base functions necessary for the client side to function.
 * @author Alvin Lin (alvin.lin@stuypulse.com)
 */

function bound(x, min, max) {
  return Math.max(Math.min(x, max), min);
}
