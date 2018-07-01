module.exports = trackSticky;


function trackSticky() {

  let stickyElems = document.querySelectorAll('[data-sticky]');

  for (let i = 0; i < stickyElems.length; i++) {
    let stickyElem = stickyElems[i];
    let container = stickyElem.dataset.sticky ?
      document.querySelector(stickyElem.dataset.sticky) : document.body;

    if (stickyElem.getBoundingClientRect().top < 0) {
      // become fixed
      if (stickyElem.style.cssText) {
        // already fixed
        // inertia: happens when scrolled fast too much to bottom
        // http://ilyakantor.ru/screen/2015-02-24_1555.swf
        return;
      }

      let savedLeft = stickyElem.getBoundingClientRect().left;
      let placeholder = createPlaceholder(stickyElem);

      stickyElem.parentNode.insertBefore(placeholder, stickyElem);

      container.appendChild(stickyElem);
      stickyElem.classList.add('sticky');
      stickyElem.style.position = 'fixed';
      stickyElem.style.top = 0;
      stickyElem.style.left = savedLeft + 'px';
      // zIndex < 1000, because it must be under an overlay,
      // e.g. sitemap must show over the progress bar
      stickyElem.style.zIndex = 101;
      stickyElem.style.background = 'white'; // non-transparent to cover the text
      stickyElem.style.margin = 0;
      stickyElem.style.width = placeholder.offsetWidth + 'px'; // keep same width as before
      stickyElem.placeholder = placeholder;
    } else if (stickyElem.placeholder && stickyElem.placeholder.getBoundingClientRect().top > 0) {
      // become non-fixed
      stickyElem.style.cssText = '';
      stickyElem.classList.remove('sticky');
      stickyElem.placeholder.parentNode.insertBefore(stickyElem, stickyElem.placeholder);
      stickyElem.placeholder.remove();

      stickyElem.placeholder = null;
    }
  }

}

/**
 * Creates a placeholder w/ same size & margin
 * @param elem
 * @returns {*|!HTMLElement}
 */
function createPlaceholder(elem) {
  let placeholder = document.createElement('div');
  let style = getComputedStyle(elem);
  placeholder.style.width = elem.offsetWidth + 'px';
  placeholder.style.marginLeft = style.marginLeft;
  placeholder.style.marginRight = style.marginRight;
  placeholder.style.height = elem.offsetHeight + 'px';
  placeholder.style.marginBottom = style.marginBottom;
  placeholder.style.marginTop = style.marginTop;
  return placeholder;
}