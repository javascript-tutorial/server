let getScrollbarHeight = require('./getScrollbarHeight');
let scrollbarHeight;

function getDocumentHeight(doc) {
  doc = doc || document;

  let height = Math.max(
    doc.body.scrollHeight, doc.documentElement.scrollHeight,
    doc.body.offsetHeight, doc.documentElement.offsetHeight,
    doc.body.clientHeight, doc.documentElement.clientHeight
  );

  if (doc.documentElement.scrollWidth > doc.documentElement.clientWidth) {
    // got a horiz scroll, let's add it
    if (!scrollbarHeight) scrollbarHeight = getScrollbarHeight();
    height += scrollbarHeight;
  }

  return height;
}

module.exports = getDocumentHeight;

