/**
 * Get the cause of the browser-initiated scroll (for onscroll event handler)
 * initial | onload | click | null
 * @type {boolean}
 */


// Chrome
// at page load browser autoscrolls the page to #hash
let isInitialScroll = true;
// then at onload autoscrolls to last remembered position
let isOnloadScroll = false;

// scroll as a result of clicking (probably, navigation)
let isClickScroll = false;

document.addEventListener('DOMContentLoaded', function() {
//  console.log("DOMContentLoaded");
  setTimeout(function() {
    // after 200 ms we consider all scrolls user-requested, not browser autoscroll
    isInitialScroll = false;
//    console.log("clean isInitialScroll");
  }, 2000);
});


document.addEventListener('click', function() {
  isClickScroll = true;
  setTimeout(function() {
    isClickScroll = false;
  }, 50); // firefox needs more than 0ms to scroll
});


window.onload = function() {
//  console.log("onload");
  isOnloadScroll = true;
  setTimeout(function() {
    // let browser scroll to the last remembered position
//    console.log("clean onload");
    isOnloadScroll = false;
  }, 200);
};


function getBrowserScrollCause() {

  return isInitialScroll ? 'initial' :
    isOnloadScroll ? 'onload' :
      isClickScroll ? 'click' : null;

}

module.exports = getBrowserScrollCause;
