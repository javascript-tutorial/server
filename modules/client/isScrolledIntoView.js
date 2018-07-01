
function isScrolledIntoView(elem) {
  let coords = elem.getBoundingClientRect();

  let visibleHeight = 0;

  if (coords.top < 0) {
    visibleHeight = coords.bottom;
  } else if (coords.bottom > window.innerHeight) {
    visibleHeight = window.innerHeight - top;
  } else {
    return true;
  }

  return visibleHeight > 10;
}

module.exports = isScrolledIntoView;
