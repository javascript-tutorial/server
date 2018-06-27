let getDocumentHeight = require('client/dom/getDocumentHeight');

function iframeResize(ifrElem, callback) {


  let timeoutTimer = setTimeout(function() {
    // default height
    callback(new Error("timeout"));
  }, 500);

  function done(err, height) {
    clearTimeout(timeoutTimer);

    callback(err, height);
  }

  // throw right now if cross-domain
  try {
    /* jshint -W030 */
    (ifrElem.contentDocument || ifrElem.contentWindow.document).body;
  } catch (e) {
    iframeResizeCrossDomain(ifrElem, done);
  }


  // HINT: I shoulnd't move iframe in DOM, because it will reload it's contents when appended/inserted anywhere!
  // so I create a clone and work on it
  if (!ifrElem.offsetWidth) {
    // clone iframe at another place to see the size
    let cloneIframe = ifrElem.cloneNode(true);
    cloneIframe.name = "";

    cloneIframe.style.height = '50px';
    cloneIframe.style.position = 'absolute';
    cloneIframe.style.display = 'block';
    cloneIframe.style.top = '10000px';

    cloneIframe.onload = function() {
      let height = getDocumentHeight(this.contentDocument);
      ifrElem.style.display = 'block';
      cloneIframe.remove();
      done(null, height);
    };

    document.body.appendChild(cloneIframe);
    return;
  }

  ifrElem.style.display = 'block';
  ifrElem.style.height = '1px';

  let height = getDocumentHeight(ifrElem.contentDocument);

  ifrElem.style.height = '';
  done(null, height);
}

iframeResize.async = function iframeResizeAsync(iframe, callback) {
  // delay to let the code inside the iframe finish
  setTimeout(function() {
    iframeResize(iframe, callback);
  }, 0);
};


function iframeResizeCrossDomain(ifrElem, callback) {
  throw new Error("Not implemented yet");
}

module.exports = iframeResize;


/*
 window.onmessage = function(e) {
 if (e.origin != "http://ru.lookatcode.com") return;
 let data = JSON.parse(e.data);
 if (!data || data.cmd != "resize-iframe") return;
 let elem = document.getElementsByName(data.name)[0];

 elem.style.height = +data.height + 10 + "px";
 let deferred = iframeResizeCrossDomain.deferreds[data.id];
 deferred.resolve();
 };

 function iframeResizeCrossDomain(ifrElem, callback) {

 setTimeout(function() {
 callback(new Error("timeout"));
 }, 500);

 try {
 // try to see if resizer can work on this iframe
 ifrElem.contentWindow.postMessage("test", "http://ru.lookatcode.com");
 } catch(e) {
 // iframe from another domain, sorry
 callback(new Error("the resizer must be from ru.lookatcode.com"));
 return;
 }

 if (!ifrElem.offsetWidth) {
 // move iframe to another place to resize there
 let placeholder = document.createElement('span');
 ifrElem.parentNode.insertBefore(placeholder, ifrElem);
 document.body.appendChild(ifrElem);
 }

 ifrElem.style.display = 'none';

 let id = "" + Math.random();
 let message = { cmd: 'resize-iframe', name: ifrElem[0].name, id: id };
 // TODO
 iframeResizeCrossDomain.deferreds[id] = deferred;
 deferred.always(function() {
 delete iframeResizeCrossDomain.deferreds[id];
 });

 let frame = iframeResizeCrossDomain.iframe;
 if (frame.loaded) {
 frame.contentWindow.postMessage(JSON.stringify(message), "http://ru.lookatcode.com");
 } else {
 frame.on('load', function() {
 frame.contentWindow.postMessage(JSON.stringify(message), "http://ru.lookatcode.com");
 });
 }

 if (placeholder) {
 setTimeout(function() {
 placeholder.replaceWith(ifrElem);
 }, 20);
 }

 return deferred;
 }

 iframeResizeCrossDomain.deferreds = {};
 iframeResizeCrossDomain.iframe = $('<iframe src="http://ru.lookatcode.com/files/iframe-resize.html" style="display:none"></iframe>').prependTo('body');
 iframeResizeCrossDomain.iframe.on('load', function() {
 this.loaded = true;
 });
 */
