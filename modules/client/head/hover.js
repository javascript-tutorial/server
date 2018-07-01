// add/remove .hover onmouseenter/leave
// for mobile devices (:hover sticks)

let currentHoverElem;

/*
function log(e) {
  console.log(Date.now() % 1e4, e.type);
}

document.addEventListener("focusin", log, false);
document.addEventListener("focus", log, false);
document.addEventListener("touchstart", log, false);
document.addEventListener("touchend", log, false);
document.addEventListener("touchcancel", log, false);
document.addEventListener("touchleave", log, false);
document.addEventListener("touchmove", log, false);
document.addEventListener("touch", log, false);

document.addEventListener("pointerup", log, false);
document.addEventListener("pointerdown", log, false);
document.addEventListener("pointermove", log, false);
document.addEventListener("pointercancel", log, false);
document.addEventListener("mouseover", log, false);
*/
document.addEventListener('mouseover', function(event) {
  let target = event.target.closest('[data-add-class-on-hover]') || event.target.closest('.button');
  if (target) {
    currentHoverElem = target;
    target.classList.add('hover');
  }
});

document.addEventListener('touchend', function(event) {
  setTimeout(function() {
    if (currentHoverElem) {
      currentHoverElem.classList.remove('hover');
      currentHoverElem = null;
    }
  }, 500); // touchstart -> tourchend -> (delay up to 300ms) -> mouseover
});

document.addEventListener('mouseout', function(event) {
  if (!currentHoverElem) return;

  if (currentHoverElem.contains(event.relatedTarget)) {
    return;
  }

  currentHoverElem.classList.remove('hover');
  currentHoverElem = null;
});

if (!navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
  document.documentElement.classList.add('working-hover');
}

