// navigation starts to work right now
let onSwipe = require('client/onSwipe');
let ctrlOrAlt = ~navigator.userAgent.toLowerCase().indexOf("mac os x") ? 'ctrl' : 'alt';

function onKeyDown(event) {
  // don't react on Ctrl-> <- if in text
  if (document.activeElement) {
    if (~['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName)) return;
  }

  if (!event[ctrlOrAlt + 'Key']) return;

  let rel = null;
  switch (event.keyCode) {
  case 0x25:
    rel = 'prev';
    break;
  case 0x27:
    rel = 'next';
    break;
  default:
    return;
  }

  let link = document.querySelector('link[rel="' + rel + '"]');
  if (!link) return;

  document.location = link.href;
  event.preventDefault();

}

function showHotKeys() {
  let keyDesc = ctrlOrAlt[0].toUpperCase() + ctrlOrAlt.slice(1);

  let shortcut;

  let next = document.querySelector('link[rel="next"]');
  if (next) {
    shortcut = document.querySelector('a[href="' + next.getAttribute('href') + '"] .page__nav-text-shortcut');
    shortcut.innerHTML = keyDesc + ' + <span class="page__nav-text-arr">→</span>';
  }

  let prev = document.querySelector('link[rel="prev"]');
  if (prev) {
    shortcut = document.querySelector('a[href="' + prev.getAttribute('href') + '"] .page__nav-text-shortcut');
    shortcut.innerHTML = keyDesc + ' + <span class="page__nav-text-arr">←</span>';
  }

}

onSwipe(document, {
  onRight: function() {
    let link = document.querySelector('link[rel="prev"]');
    if (link) document.location = link.href;
  },
  onLeft: function() {
    let link = document.querySelector('link[rel="next"]');
    if (link) document.location = link.href;
  }
});

document.addEventListener('keydown', onKeyDown);

document.addEventListener('DOMContentLoaded', showHotKeys);
