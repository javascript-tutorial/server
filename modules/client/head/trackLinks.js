// current page host
let baseURI = window.location.host;

document.addEventListener('click', function(e) {

  if (e.which != 1) return; // track only left-mouse clicks
  if (e.defaultPrevented) return;

  // abandon if no active link or link within domain
  let link = e.target.closest && e.target.closest("a");
  if (!link || (baseURI == link.host && !link.hasAttribute('data-track-outbound'))) return;

  // invalid or blank target
  if (!~["_self", "_top", "_parent"].indexOf(link.target)) return;

  if (e.shiftKey || e.ctrlKey || e.altKey) return;

  // cancel event and record outbound link
  e.preventDefault();
  let href = link.href;
  window.ga('send', 'event', 'outbound', 'click', href, {
    hitCallback: loadPage
  });

  // redirect after half-second if recording takes too long
  setTimeout(loadPage, 500);

  // redirect to outbound page
  function loadPage() {
    document.location = href;
  }

});
