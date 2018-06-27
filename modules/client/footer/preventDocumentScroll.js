// DEPRECATED: see https://github.com/iliakan/javascript-nodejs/issues/62

/**
 *
 * Don't scroll page when scrolling an element inside it and reached the bottom.
 *
 * Algorithm:
 * Go up from target, look for scrollable elements
 *   -> if we found a scrollable element, which can be scrolled
 *     => everything's fine, return, do nothing
 *   -> if we find a scrollable element, which can not be scrolled
 *     => the event may lead to document scroll
 *       -> ...but only if there are no scrollable element above
 *
 * P.S. Does not work when scrolling iframes :/
 */
document.documentElement.addEventListener('wheel', function(event) {

  let target = event.target;

  let foundScrollable = false;

  while (target != document.documentElement) {

    if (target.scrollHeight != target.clientHeight) {
      if (getComputedStyle(target).overflowY != 'auto' ) {
        // strange glitch with .code-tabs__content:
        // scrollTop = 0 when the scrollbar is at bottom
        // it has overflow: visible
        //   usually scrollable elements have overflow: auto
        //   so we ignore 'visible/hidden' here
        target = target.parentNode;
        continue;
      }
      foundScrollable = true;

      // got a scrollable element!
      //console.log(target, event.deltaY, target.scrollTop, target.clientHeight + target.scrollTop,  target.scrollHeight);


      // can scroll in this direction?
      if ((target.scrollTop > 0 && event.deltaY < 0) ||
        (event.deltaY > 0 && target.clientHeight + target.scrollTop < target.scrollHeight)) {
        // yes, can scroll, let it go...
        //console.log("can scroll");
        return;
      }
    }

    target = target.parentNode;
  }

  // found a scrollable which can not be scrolled any more and no scrollables above him
  if (foundScrollable) {
    // prevent document scroll
    event.preventDefault();
  }

});

// prevents parent scrolls from iframes (usually)
let iframes = document.querySelectorAll('iframe');
for (let i = 0; i < iframes.length; i++) {
  let iframe = iframes[i];
  iframe.addEventListener('wheel', function(e) {
    let html = this.contentWindow.document.documentElement;
    if (html.scrollHeight != html.clientHeight) {
      e.preventDefault();
    }
  });
}
