var hoverIntent = require('client/hoverIntent');

module.exports = function() {

  var tooltipSpan = null;
  var shiftX = 8;
  var shiftY = 10;

  function updatePosition(event) {
    var left = event.clientX + shiftX;
    if (left + tooltipSpan.offsetWidth > document.documentElement.clientWidth) { // if beyond the right document border
      // mirror to the left
      left = Math.max(0, event.clientX - shiftX - tooltipSpan.offsetWidth);
    }
    tooltipSpan.style.left = left + 'px';

    var top = event.clientY + shiftY;
    if (top + tooltipSpan.offsetHeight > document.documentElement.clientHeight) {
      top = Math.max(0, event.clientY - shiftY - tooltipSpan.offsetHeight);
    }

    tooltipSpan.style.top = top + 'px';
  }



  // we show tooltip element for any link hover, but few of them actually get styled
  function onOver(event) {
    if (!event.target.closest) return; // over svg
    var target = event.target.closest('a, [data-tooltip]');

    if (!target) return;

    // links inside toolbars need no tooltips
    if (target.tagName == 'A' && target.closest('.toolbar')) return;

    tooltipSpan = document.createElement('span');
    tooltipSpan.className = 'link__type';

    if (target.getAttribute('data-tooltip')) {
      tooltipSpan.setAttribute('data-tooltip', target.getAttribute('data-tooltip'));
    } else {
      tooltipSpan.setAttribute('data-url', target.getAttribute('href'));
    }

    document.body.appendChild(tooltipSpan);
    updatePosition(event);

    document.addEventListener('mousemove', updatePosition);
  }

  function onOut() {
    if (!tooltipSpan) return;

    document.removeEventListener('mousemove', updatePosition);
    tooltipSpan.remove();
    tooltipSpan = null;
  }

  hoverIntent('a,[data-tooltip]', onOver, onOut);

};
