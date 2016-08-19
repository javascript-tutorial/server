function getScrollbarHeight() {
  var outer = document.createElement("div");
  outer.style.cssText = "visibility:hidden;height:100px";
  if (!document.body) {
    throw new Error("getScrollbarHeight called to early: no document.body");
  }
  document.body.appendChild(outer);

  var widthNoScroll = outer.offsetWidth;
  // force scrollbars
  outer.style.overflow = "scroll";

  // add innerdiv
  var inner = document.createElement("div");
  inner.style.width = "100%";
  outer.appendChild(inner);

  var widthWithScroll = inner.offsetWidth;

  // remove divs
  outer.parentNode.removeChild(outer);

  return widthNoScroll - widthWithScroll;
}

module.exports = getScrollbarHeight;
