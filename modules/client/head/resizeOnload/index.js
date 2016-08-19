var iframeResize = require('./iframeResize');
var throttle = require('lib/throttle');
// track resized iframes in window.onresize

var onResizeQueue = [];

exports.iframe = function(iframe) {

  function resize() {
    iframeResize.async(iframe, function(err, height) {
      if (err) console.error(err);
      if (height) iframe.style.height = height + 'px';
    });
  }

  resize();
};

exports.codeTabs = function(iframe) {
  function hideShowArrows() {

    // add arrows if needed
    var elem = iframe.closest('.code-tabs');
    var contentElem = iframe.closest('[data-code-tabs-content]');
    var switchesElem = elem.querySelector('[data-code-tabs-switches]');
    var switchesElemItems = switchesElem.firstElementChild;

    if (switchesElemItems.offsetWidth > switchesElem.offsetWidth) {
      elem.classList.add('code-tabs_scroll');
    } else {
      elem.classList.remove('code-tabs_scroll');
    }

  }

  hideShowArrows();
  onResizeQueue.push(hideShowArrows);
};



window.addEventListener('resize', throttle(function() {
  onResizeQueue.forEach(function(onResize) {
    onResize();
  });
}, 200));
