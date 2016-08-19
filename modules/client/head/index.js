
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

if (LANG == 'ru') {
  require('./unready');

  //exports.init = require('./init');
  exports.login = require('./login');

  require('./logout');
}
exports.Modal = require('./modal');
exports.fontTest = require('./fontTest');
exports.resizeOnload = require('./resizeOnload');
require('./layout');
require('./sitetoolbar');
require('./sidebar');
require('./navigationArrows');
require('./hover');
require('./trackLinks');

// must use CommonsChunkPlugin
// to ensure that other modules use exactly this (initialized) client/notify
require('client/notification').init();

exports.showTopNotification = function() {
  let notification = document.querySelector('.notification_top');

  let id = notification.id;

  notification.querySelector('button').onclick = function() {
    localStorage.topNotificationHidden = id;
    notification.style.display = 'none';
  };

  if (!id) throw new Error('Top notification must have an id');

  // topNotificationHidden has the id of the hidden notification (current or previous one)
  let hiddenId = localStorage.topNotificationHidden;
  if (hiddenId == id) return;

  // not same id or no id saved
  delete localStorage.topNotificationHidden;

  notification.style.display = '';
};


