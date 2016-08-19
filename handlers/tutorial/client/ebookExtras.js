'use strict';

exports.init = function() {

  relinkToHeaders();

  replaceSlashesInFragments();

};

// Internal links like /object
// In Ebook article headers get id=url, e.g h2(id=/object)
// Task headers also get similar urls
//   a(href=/object) should go to a(href=#/object) (if exists)
function relinkToHeaders() {
  var internalLinks = document.querySelectorAll('a[href^="/"]');

  for (var i = 0; i < internalLinks.length; i++) {
    var link = internalLinks[i];
    if (document.getElementById(link.getAttribute('href'))) {
      link.setAttribute('href', '#' + link.getAttribute('href'));
    } else {
      link.setAttribute('href', window.SITE_HOST + link.getAttribute('href'));
    }
  }

}

// quick fix for ebook-converter issue
// http://www.mobileread.com/forums/showthread.php?p=3044812#post3044812
// contrary to http://tools.ietf.org/html/rfc3986
// forbids / in fragments https://github.com/kovidgoyal/calibre/blob/ef09e886b3d95d6de5c76ad3a179694ae75c65f4/src/calibre/ebooks/conversion/plugins/epub_output.py#L350-L359
function replaceSlashesInFragments() {
  var internalLinks = document.querySelectorAll('a[href^="#"]');

  for (var i = 0; i < internalLinks.length; i++) {
    var link = internalLinks[i];
    link.setAttribute('href', link.getAttribute('href').replace(/\//g, '-'));
  }

  var elems =  document.querySelectorAll('[id]');

  for (var i = 0; i < elems.length; i++) {
    var elem = elems[i];
    elem.id = elem.id.replace(/\//g, '-');
  }


}
