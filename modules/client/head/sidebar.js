
document.addEventListener('click', onClick);

document.addEventListener('keydown', onKeyDown);

initSidebarHighlight();

function toggle() {

  let pageWrapper = document.querySelector('.page-wrapper');

  document.querySelector('.page').classList.toggle('page_sidebar_on');

  pageWrapper && pageWrapper.classList.toggle('page-wrapper_sidebar_on');

  window.acceptGdpr(accepted => {
    if (document.querySelector('.page').classList.contains('page_sidebar_on')) {
      delete localStorage.noSidebar;
    } else {
      if (accepted) {
        localStorage.noSidebar = 1;
      }
    }
  });

}

function onClick(event) {

  if (!event.target.hasAttribute('data-sidebar-toggle')) return;

  toggle();
}


function onKeyDown(event) {
  // don't react on Ctrl-> <- if in text
  if (document.activeElement) {
    if (~['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName)) return;
  }

  if (event.keyCode != "S".charCodeAt(0)) return;

  if (~navigator.userAgent.toLowerCase().indexOf("mac os x")) {
    if (!event.metaKey || !event.altKey) return;
  } else {
    if (!event.altKey) return;
  }

  toggle();
  event.preventDefault();

}

function initSidebarHighlight() {

  function highlight() {

    let current = document.getElementsByClassName('sidebar__navigation-link_active');
    if (current[0]) current[0].classList.remove('sidebar__navigation-link_active');

    //debugger;
    let h2s = document.getElementsByTagName('h2');
    let i;
    for (i = 0; i < h2s.length; i++) {
      let h2 = h2s[i];
      // first in-page header
      // >1, because when visiting http://javascript.local/native-prototypes#native-prototype-change,
      // top may be 0.375 or kind of...
      if (h2.getBoundingClientRect().top > 1) break;
    }
    i--; // we need the one before it (currently reading)

    if (i >= 0) {
      let href = h2s[i].firstElementChild && h2s[i].firstElementChild.getAttribute('href');
      let li = document.querySelector('.sidebar__navigation-link a[href="' + href + '"]');
      if (href && li) {
        li.classList.add('sidebar__navigation-link_active');
      }
    }

  }

  document.addEventListener('DOMContentLoaded', function() {
    highlight();

    window.addEventListener('scroll', highlight);
  });


}

