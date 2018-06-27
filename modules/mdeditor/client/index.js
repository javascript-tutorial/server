'use strict';

require('./styles');

const MdEditor = require('./mdEditor');


function init() {
  let editorElems = document.querySelectorAll('.mdeditor');

  for (let i = 0; i < editorElems.length; i++) {
    let editorElem = editorElems[i];
    new MdEditor({
      elem: editorElem
    });
  }
}

// must be on document ready
init();


