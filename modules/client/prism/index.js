// prism requires data-manual attribute on the current script NOT to highlightAll automatically
let script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();
script.setAttribute('data-manual', 1);

require('prismjs/components/prism-core.js');
require('prismjs/components/prism-markup.js');
require('prismjs/components/prism-css.js');
require('prismjs/components/prism-css-extras.js');
require('prismjs/components/prism-clike.js');
require('prismjs/components/prism-javascript.js');
require('prismjs/components/prism-http.js');
require('prismjs/components/prism-scss.js');
require('prismjs/components/prism-sql.js');
require('prismjs/components/prism-java.js');

Prism.tokenTag = 'code'; // for iBooks to use monospace font

let CodeBox = require('./codeBox');
let CodeTabsBox = require('./codeTabsBox');

function initCodeBoxes(container) {

  // highlight inline
  let codeExampleElems = container.querySelectorAll('.code-example:not([data-prism-done])');

  for (let i = 0; i < codeExampleElems.length; i++) {
    let codeExampleElem = codeExampleElems[i];
    new CodeBox(codeExampleElem);
    codeExampleElem.setAttribute('data-prism-done', '1');
  }

}


function initCodeTabsBox(container) {

  let elems = container.querySelectorAll('div.code-tabs:not([data-prism-done])');

  for (let i = 0; i < elems.length; i++) {
    new CodeTabsBox(elems[i]);
    elems[i].setAttribute('data-prism-done', '1');
  }

}

exports.init = function () {

  document.removeEventListener('DOMContentLoaded', Prism.highlightAll);

  document.addEventListener('DOMContentLoaded', function() {
    highlight(document);
  });

};

function highlight(elem) {
  initCodeBoxes(elem);
  initCodeTabsBox(elem);
}

exports.highlight = highlight;
