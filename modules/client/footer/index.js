//require('./preventDocumentScroll');
let showLinkType = require('./showLinkType');
let load2x = require('./load2x');
let trackSticky = require('client/trackSticky');


function init() {
  showLinkType();

  if (window.devicePixelRatio > 1) {
    load2x();
  }

  window.addEventListener('scroll', trackSticky);
  trackSticky();

}

init();

//exports.trackSticky = trackSticky;
