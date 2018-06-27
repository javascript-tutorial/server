let requestAnimationFrameId;

let DEBUG = false;
function log() {
  if (DEBUG) {
    console.log.apply(console, arguments);
  }
}

let TABLET_WIDTH = 840;

(function() {

  // don't handle onscroll more often than animation
  function onWindowScrollAndResizeThrottled() {
    log("onWindowScrollAndResizeThrottled", requestAnimationFrameId);
    if (requestAnimationFrameId) return;

    requestAnimationFrameId = window.requestAnimationFrame(function() {
      onWindowScrollAndResize();
      requestAnimationFrameId = null;
    });

  }

  window.addEventListener('scroll', onWindowScrollAndResizeThrottled);
  window.addEventListener('resize', onWindowScrollAndResizeThrottled);
  document.addEventListener('DOMContentLoaded', onWindowScrollAndResizeThrottled);

})();

function compactifySidebar() {
  log("compactifySidebar");
  let sidebar = document.querySelector('.sidebar');

  let sidebarContent = sidebar.querySelector('.sidebar__content');
  let sidebarInner = sidebar.querySelector('.sidebar__inner');

  let hasStickyFooter = sidebar.classList.contains('sidebar_sticky-footer');
  let isCompact = sidebar.classList.contains('sidebar_compact');

  if (isCompact) {
    let emptySpaceSize;
    if (hasStickyFooter) {
      emptySpaceSize = sidebarContent.lastElementChild.getBoundingClientRect().top -
      sidebarContent.lastElementChild.previousElementSibling.getBoundingClientRect().bottom;
    } else {
      emptySpaceSize = sidebarContent.getBoundingClientRect().bottom -
      sidebarContent.lastElementChild.getBoundingClientRect().bottom;
    }

    log("decompact?", emptySpaceSize);

    // enough space to occupy the full height in decompacted form without scrollbar
    if (emptySpaceSize > 150) {
      sidebar.classList.remove('sidebar_compact');
    }

  } else {
    log(sidebarInner.scrollHeight, sidebarInner.clientHeight);
    if (sidebarInner.scrollHeight > sidebarInner.clientHeight) {
      log("compact!");
      sidebar.classList.add('sidebar_compact');
    }
  }


}

function onWindowScrollAndResize() {

  let toolbarSelector = '.sitetoolbar-light';
  let sitetoolbar = document.querySelector(toolbarSelector);


  if (!sitetoolbar) {
    log("no sitetoolbar");
    return; // page in a no-top-nav layout
  }

  let sidebar = document.querySelector('.sidebar');

  if (sidebar) {
    sidebar.style.top = Math.max(sitetoolbar.getBoundingClientRect().bottom, 0) + 'px';
    compactifySidebar();
  }

  setUserScaleIfTablet();


}

function setUserScaleIfTablet() {
  let isTablet = document.documentElement.clientWidth <= TABLET_WIDTH;
  let content = document.querySelector('meta[name="viewport"]').content;
  content = content.replace(/user-scalable=\w+/, 'user-scalable=' + (isTablet ? 'yes' : 'no'));
  document.querySelector('meta[name="viewport"]').content = content;
}
