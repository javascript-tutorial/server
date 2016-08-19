var resizeOnload = require('client/head/resizeOnload');
var isScrolledIntoView = require('client/isScrolledIntoView');
var addLineNumbers = require('./addLineNumbers');

function CodeBox(elem) {

  var preElem = elem.querySelector('pre');
  var codeElem = preElem.querySelector('code');
  var code = codeElem.textContent;

  Prism.highlightElement(codeElem);
  addLineNumbers(preElem);

  addBlockHighlight(preElem, elem.getAttribute('data-highlight-block'));
  addInlineHighlight(preElem, elem.getAttribute('data-highlight-inline'));

  var isJS = preElem.classList.contains('language-javascript');
  var isHTML = preElem.classList.contains('language-markup');
  var isTrusted = +elem.getAttribute('data-trusted');
  var isNoStrict = +elem.getAttribute('data-no-strict');

  if (!isNoStrict && isJS) code="'use strict';\n" + code;

  var jsFrame;
  var globalFrame;
  var htmlResult;
  var isFirstRun = true;

  if (!isJS && !isHTML) return;

  var runElem = elem.querySelector('[data-action="run"]');
  if (runElem) {
    runElem.onclick = function() {
      this.blur();
      run();
      return false;
    };
  }

  var editElem = elem.querySelector('[data-action="edit"]');
  if (editElem) {
    editElem.onclick = function() {
      this.blur();
      edit();
      return false;
    };
  }

  // some code can't be shown by epub engine
  if (elem.hasAttribute('data-autorun')) {
    if(window.ebookType == 'epub' && elem.getAttribute('data-autorun') == 'no-epub') {
      elem.querySelector('iframe').remove();
    } else {
      // timeout should be small, around 10ms, or remove it to make crawler process the autorun
      setTimeout(run, 100);
    }
  }

  function postJSFrame() {
    var win = jsFrame.contentWindow;
    if (typeof win.postMessage != 'function') {
      alert("Извините, запуск кода требует более современный браузер");
      return;
    }
    win.postMessage(code, 'https://ru.lookatcode.com/showjs');
  }

  function runHTML() {

    var frame;

    if (htmlResult && elem.hasAttribute('data-refresh')) {
      htmlResult.remove();
      htmlResult = null;
    }

    if (!htmlResult) {
      // take from HTML if exists there (in markup when autorun is specified)
      htmlResult = elem.querySelector('.code-result');
    }

    if (!htmlResult) {
      // otherwise create (or recreate if refresh)
      htmlResult = document.createElement('div');
      htmlResult.className = "code-result code-example__result";

      frame = document.createElement('iframe');
      frame.name = 'frame-' + Math.random();
      frame.className = 'code-result__iframe';

      if (elem.getAttribute('data-demo-height') === "0") {
        // this html has nothing to show
        frame.style.display = 'none';
      } else if (elem.hasAttribute('data-demo-height')) {
        var height = +elem.getAttribute('data-demo-height');
        frame.style.height = height + 'px';
      }
      htmlResult.appendChild(frame);

      elem.appendChild(htmlResult);
    } else {
      frame = htmlResult.querySelector('iframe');
    }

    if (isTrusted) {
      var doc = frame.contentDocument || frame.contentWindow.document;

      doc.open();
      doc.write(normalizeHtml(code));
      doc.close();


      if(window.ebookType == 'epub') {
        setTimeout(function() {
          // remove script from iframes
          // firefox saves the file with full iframe content (including script-generated) and the scripts
          // scripts must not execute and autogenerate content again
          [].forEach.call(doc.querySelectorAll('script'), function(script) {
            script.remove();
          });

          // do it after timeout to allow external scripts (if any) to execute
        }, 2000);
      }

      if (!elem.hasAttribute('data-demo-height')) {
        resizeOnload.iframe(frame);
      }

      if (!(isFirstRun && elem.hasAttribute('data-autorun'))) {
        if (!isScrolledIntoView(htmlResult)) {
          htmlResult.scrollIntoView(false);
        }
      }

    } else {
      var form = document.createElement('form');
      form.style.display = 'none';
      form.method = 'POST';
      form.enctype = "multipart/form-data";
      form.action = "https://ru.lookatcode.com/showhtml";
      form.target = frame.name;

      var textarea = document.createElement('textarea');
      textarea.name = 'code';
      textarea.value = normalizeHtml(code);
      form.appendChild(textarea);

      frame.parentNode.insertBefore(form, frame.nextSibling);
      form.submit();
      form.remove();

      if (!(isFirstRun && elem.hasAttribute('data-autorun'))) {
        frame.onload = function() {

          if (!elem.hasAttribute('data-demo-height')) {
            resizeOnload.iframe(frame);
          }

          if (!isScrolledIntoView(htmlResult)) {
            htmlResult.scrollIntoView(false);
          }
        };
      }
    }

  }

  // Evaluates a script in a global context
  function globalEval( code ) {
    var script = document.createElement( "script" );
    script.text = code;
    document.head.appendChild( script ).parentNode.removeChild( script );
  }

  function runJS() {

    if (elem.hasAttribute('data-global')) {
      if (!globalFrame) {
        globalFrame = document.createElement('iframe');
        globalFrame.className = 'js-frame';
        globalFrame.style.width = 0;
        globalFrame.style.height = 0;
        globalFrame.style.border = 'none';
        globalFrame.name = 'js-global-frame';
        document.body.appendChild(globalFrame);
      }

      let form = document.createElement('form');
      form.style.display = 'none';
      form.method = 'POST';
      form.enctype = "multipart/form-data";
      form.action = "https://ru.lookatcode.com/showhtml";
      form.target = 'js-global-frame';

      var textarea = document.createElement('textarea');
      textarea.name = 'code';
      textarea.value = normalizeHtml('<script>\n' + code + '\n</script>');
      form.appendChild(textarea);

      globalFrame.parentNode.insertBefore(form, globalFrame.nextSibling);
      form.submit();
      form.remove();
    } else if (isTrusted) {

      if (elem.hasAttribute('data-autorun')) {
        // make sure functions from "autorun" go to global scope
        globalEval(code);
        return;
      }

      try {
        /* jshint -W061 */
        window["eval"].call(window, code);
      } catch (e) {
        alert("Error: " + e.message);
      }

    } else {

      if (elem.hasAttribute('data-refresh') && jsFrame) {
        jsFrame.remove();
        jsFrame = null;
      }

      if (!jsFrame) {
        // create iframe for js
        jsFrame = document.createElement('iframe');
        jsFrame.className = 'js-frame';
        jsFrame.src = 'https://ru.lookatcode.com/showjs';
        jsFrame.style.width = 0;
        jsFrame.style.height = 0;
        jsFrame.style.border = 'none';
        jsFrame.onload = function() {
          postJSFrame();
        };
        document.body.appendChild(jsFrame);
      } else {
        postJSFrame();
      }
    }

  }

  function edit() {

    var html;
    if (isHTML) {
      html = normalizeHtml(code);
    } else {
      var codeIndented = code.replace(/^/gim, '    ');
      html = '<!DOCTYPE html>\n<html>\n\n<body>\n  <script>\n' + codeIndented + '\n  </script>\n</body>\n\n</html>';
    }

    var form = document.createElement('form');
    form.action = "http://plnkr.co/edit/?p=preview";
    form.method = "POST";
    form.target = "_blank";

    document.body.appendChild(form);

    var textarea = document.createElement('textarea');
    textarea.name = "files[index.html]";
    textarea.value = html;
    form.appendChild(textarea);

    var input = document.createElement('input');
    input.name = "description";
    input.value = "Fork from " + window.location;
    form.appendChild(input);

    form.submit();
    form.remove();
  }


  function normalizeHtml(code) {
    var codeLc = code.toLowerCase();
    var hasBodyStart = codeLc.match('<body>');
    var hasBodyEnd = codeLc.match('</body>');
    var hasHtmlStart = codeLc.match('<html>');
    var hasHtmlEnd = codeLc.match('</html>');

    var hasDocType = codeLc.match(/^\s*<!doctype/);

    if (hasDocType) {
      return code;
    }

    var result = code;

    if (!hasHtmlStart) {
      result = '<html>\n' + result;
    }

    if (!hasHtmlEnd) {
      result = result + '\n</html>';
    }

    if (!hasBodyStart) {
      result = result.replace('<html>', '<html>\n<head>\n  <meta charset="utf-8">\n</head><body>\n');
    }

    if (!hasBodyEnd) {
      result = result.replace('</html>', '\n</body>\n</html>');
    }

    result = '<!DOCTYPE HTML>\n' + result;

    return result;
  }


  function run() {
    if (isJS) {
      runJS();
    } else {
      runHTML();
    }
    isFirstRun = false;
  }


}


function addBlockHighlight(pre, lines) {

  if (!lines) {
    return;
  }

  var ranges = lines.replace(/\s+/g, '').split(',');

  /*jshint -W084 */
  for (var i = 0, range; range = ranges[i++];) {
    range = range.split('-');

    var start = +range[0],
        end = +range[1] || start;


    var mask = '<code class="block-highlight" data-start="' + start + '" data-end="' + end + '">' +
      new Array(start + 1).join('\n') +
      '<code class="mask">' + new Array(end - start + 2).join('\n') + '</code></code>';

    pre.insertAdjacentHTML("afterBegin", mask);
  }

}


function addInlineHighlight(pre, ranges) {

  // select code with the language text, not block-highlighter
  var codeElem = pre.querySelector('code[class*="language-"]');

  ranges = ranges ? ranges.split(",") : [];

  for (var i = 0; i < ranges.length; i++) {
    var piece = ranges[i].split(':');
    var lineNum = +piece[0], strRange = piece[1].split('-');
    var start = +strRange[0], end = +strRange[1];
    var mask = '<code class="inline-highlight">' +
      new Array(lineNum + 1).join('\n') +
      new Array(start + 1).join(' ') +
      '<code class="mask">' + new Array(end - start + 1).join(' ') + '</code></code>';

    codeElem.insertAdjacentHTML("afterBegin", mask);
  }
}


module.exports = CodeBox;
