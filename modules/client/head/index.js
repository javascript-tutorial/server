
require('client/polyfill');

try {
  window.localStorage.testProperty = 1;
  delete window.localStorage.testProperty;
} catch(e) {
  // localStorage disabled or forbidden
  try {
    window.localStorage = {};
    // so that operations on it won't fail
  } catch(e) {
    /* can happen TypeError: Attempted to assign to readonly property. */
  }
}

exports.Modal = require('./modal');
exports.fontTest = require('./fontTest');
exports.resizeOnload = require('./resizeOnload');
require('./layout');
require('engine/sidebar/client');
require('./navigationArrows');
require('./hover');
require('./trackLinks');

