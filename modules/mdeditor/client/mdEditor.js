'use strict';

const delegate = require('client/delegate');

const t = require('i18n');
const LANG = require('config').lang;
t.requirePhrase('mdeditor', require('../locales/' + LANG + '.yml'));

class MdEditor {

  actionBold() {
    this.replaceSelection("**", "**", t("mdeditor.text.bold"));
  }


  actionItalic() {
    this.replaceSelection("*", "*", t("mdeditor.text.italic"));
  }

  actionCode() {
    this.replaceSelection("`", "`", t("mdeditor.text.code"));
  }


  actionFencedCode() {
    this.replaceSelection("\n```js\n", "\n```\n", t("mdeditor.text.fencedCode"));
  }

  actionAutolink() {
    this.replaceSelection("<", ">", 'http://');
  }

  actionLink() {
    let text;
    let link;

    let value = this.textarea.value;
    let hasSelection = (this.textarea.selectionStart != this.textarea.selectionEnd);

    let selection = hasSelection ? value.slice(this.textarea.selectionStart, this.textarea.selectionEnd) : '';

    if (selection) {
      if (selection.match(/^https?:\/\//)) {
        link = selection;
      } else {
        text = selection;
      }
    }

    let substitutionText = text || t('mdeditor.text.link'); // || link ?
    let substitution = '[' + substitutionText + '](' + (link || 'http://') + ')';

    let before = value.slice(0, this.textarea.selectionStart);
    let after = value.slice(this.textarea.selectionEnd);
    this.textarea.value = before + substitution + after;

    if (!text) {
      // select default text
      this.textarea.selectionStart = before.length + 1;
      this.textarea.selectionEnd = before.length + 1 + substitutionText.length;
    } else if (!link) {
      // place cursor after http://
      this.textarea.selectionEnd = before.length + substitution.length - 1;
      this.textarea.selectionStart = this.textarea.selectionEnd;
    }
    this.triggerChange();

  }

  insertList(prefix) {

    let area = this.textarea;
    let nextLinePos = area.value.indexOf("\n", area.selectionStart);
    if (nextLinePos == -1) nextLinePos = area.value.length;

    let before = area.value.slice(0, nextLinePos);
    let after = area.value.slice(nextLinePos);

    if (area.value[area.selectionStart] != '\n' && area.selectionStart !== 0) {
      prefix = "\n" + prefix;
    }

    area.value = before + prefix + t('mdeditor.text.ol') + after;
    area.selectionStart = before.length + prefix.length;
    area.selectionEnd = area.selectionStart + t('mdeditor.text.ol').length;
  }

  actionOl() {
    let area = this.textarea;
    let prevNewLinePos = area.value.lastIndexOf("\n", area.selectionStart - 1);
    if (prevNewLinePos == -1) prevNewLinePos = 0;

    let num = parseInt(area.value.slice(prevNewLinePos));
    num = num ? num + 1 : 1;

    let prefix = `${num}. `;
    this.insertList(prefix);
  }

  actionUl() {
    this.insertList("- ");
  }

  actionHeading() {
    this.replaceSelection("\n\n# ", "\n", t('mdeditor.text.heading'));
  }

  actionImage() {
    // todo
    /*
    let selection = this.codemirror.getSelection();
    let text = t("mdeditor.text.alt");

    if (!selection) {
      selection = "http://my.jpg";
    }
    this.codemirror.replaceSelection('![' + text + '](' + selection + ')');
    let cursorPos = this.codemirror.getCursor();
    this.codemirror.setCursor(cursorPos.line, cursorPos.ch - (1 + selection.length));
    */
  }


  replaceSelection(prefix, suffix, defaultText) {
    let value = this.textarea.value;
    let hasSelection = (this.textarea.selectionStart != this.textarea.selectionEnd);

    let selection = hasSelection ? value.slice(this.textarea.selectionStart, this.textarea.selectionEnd) : '';

    let substitution = hasSelection ?
      (prefix + selection + suffix) :
      (prefix + defaultText + suffix);

    let before = value.slice(0, this.textarea.selectionStart);
    let after = value.slice(this.textarea.selectionEnd);
    this.textarea.value = before + substitution + after;

    if (!hasSelection) {
      this.textarea.selectionStart = before.length + prefix.length;
      this.textarea.selectionEnd = before.length + prefix.length + defaultText.length;
    }
    this.triggerChange();
  }


  onResizeMouseDown(e) {
    this.elem.classList.add('mdeditor_resizing');
    document.addEventListener('mousemove', this.onResizeMouseMove);
    document.addEventListener('mouseup', this.onResizeMouseUp);
    e.preventDefault();
  }

  onResizeMouseMove(e) {
    let height = e.clientY - this.textarea.getBoundingClientRect().top;
    if (height < 30) height = 30;
    this.textarea.style.height = height + 'px';
  }

  onResizeMouseUp(e) {
    this.elem.classList.remove('mdeditor_resizing');
    document.removeEventListener('mousemove', this.onResizeMouseMove);
    document.removeEventListener('mouseup', this.onResizeMouseUp);
  }

  constructor(options) {
    this.elem = options.elem;
    this.textarea = this.elem.querySelector('textarea');

    // allow to use form.elements.content.editor.setValue()
    this.elem.editor = this.textarea.editor = this;

    this.delegate('[data-action]', 'click', function(e) {
      let actionName = 'action' +
        e.delegateTarget.getAttribute('data-action')[0].toUpperCase() +
        e.delegateTarget.getAttribute('data-action').slice(1);

      if (!this[actionName]) return;

      e.preventDefault();
      this[actionName]();
      this.textarea.focus();
    });

    this.onResizeMouseDown = this.onResizeMouseDown.bind(this);
    this.onResizeMouseMove = this.onResizeMouseMove.bind(this);
    this.onResizeMouseUp = this.onResizeMouseUp.bind(this);

    this.delegate('[data-mdeditor-resize]', 'mousedown', this.onResizeMouseDown);

    this.textarea.addEventListener("input", () => this.triggerChange());

    /*
    // maybe preview is made with a webservice
    if (!options.noPreview) {
      require.ensure([], (require) => {
        let MdEditorPreview = require('./mdEditorPreview');
        new MdEditorPreview({editor: this});
      });
    }*/
  }

  triggerChange() {
    this.elem.dispatchEvent(new CustomEvent('mdeditor:change', {
      bubbles: true,
      detail: {
        editor: this
      }
    }));
  }

/*
  getPreviewElem() {
    return this.elem.querySelector('[data-editor-preview]');
  } // TODO: where editoor comes from? Adapt newslettreEReleaseForm!!!
*/
  getValue() {
    return this.textarea.value;
  }

  setValue(val, quiet) {
    this.textarea.value = val;
    if (!quiet) {
      this.triggerChange();
    }
  }

}

delegate.delegateMixin(MdEditor.prototype);

module.exports = MdEditor;
