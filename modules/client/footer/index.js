//require('./preventDocumentScroll');
var showLinkType = require('./showLinkType');
var load2x = require('./load2x');
var trackSticky = require('client/trackSticky');


function init() {
  showLinkType();

  if (window.devicePixelRatio > 1) {
    load2x();
  }

  window.addEventListener('scroll', trackSticky);
  trackSticky();

  let prices = document.querySelectorAll('.auto-currency');
  for (let i = 0; i < prices.length; i++) {
    let priceElem = prices[i];

    let price = Math.round(parseInt(priceElem.innerHTML) / window.rateUsdRub);
    priceElem.insertAdjacentHTML('beforeEnd', `<span class="auto-currency__usd">(≈${price}$)</span>`);
  }
}

init();

//exports.trackSticky = trackSticky;
