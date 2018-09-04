let iframeResize = require('./iframeResize');

let throttle = require('lodash/throttle');
// track resized iframes in window.onresize

let onResizeQueue = [];

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
    let elem = iframe.closest('.code-tabs');
    let contentElem = iframe.closest('[data-code-tabs-content]');
    let switchesElem = elem.querySelector('[data-code-tabs-switches]');
    let switchesElemItems = switchesElem.firstElementChild;

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
