'use strict';

const BasicParser = require('markit/basicParser');
const prism = require('client/prism');

const throttle = require('lodash/throttle');

class MdEditorPreview {

  constructor(options) {
    this.editor = options.editor;
    this.elem = options.elem;

    this.renderThrottled = throttle(this.render.bind(this), 100);

    this.editor.elem.addEventListener('mdeditor:change', e => {
      this.renderThrottled();
    });

    this.renderThrottled();

  }

  highlight() {
    prism.highlight(this.elem);
  }

  render() {
    let value = this.editor.getValue();
    let rendered = new BasicParser().render(value);
    this.elem.innerHTML = rendered;
    this.highlight();
  }

}

module.exports = MdEditorPreview;
