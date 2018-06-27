function Modal(options) {
  options = options || {};
  this.render();
  this.setHasClose(options.hasClose === undefined ? true : options.hasClose);

  this.onClick = this.onClick.bind(this);
  this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);

  this.elem.addEventListener('click', this.onClick);

  document.addEventListener("keydown", this.onDocumentKeyDown);
}

Modal.prototype.setHasClose = function(newHasClose) {
  this._hasClose = newHasClose;
  if (this._hasClose) {
    this.elem.classList.add('modal__has-close');
  } else {
    this.elem.classList.remove('modal__has-close');
  }
};

Modal.prototype.render = function() {
  document.body.insertAdjacentHTML('beforeEnd',
    '<div class="modal"><div class="modal__dialog"><button class="close-button modal__close" title="закрыть"></button><div class="modal__content"></div></div></div>'
  );
  document.body.classList.add('paranja-open');
  this.elem = document.body.lastChild;
  this.contentElem = this.elem.querySelector('.modal__content');
};

Modal.prototype.onClick = function(event) {
  if (event.target.classList.contains('modal__close')) {
    this.remove();
    event.preventDefault();
  }
};


Modal.prototype.onDocumentKeyDown = function(event) {
  if (event.keyCode == 27) {
    event.preventDefault();
    this.remove();
  }
};

Modal.prototype.showOverlay = function() {
  this.contentElem.classList.add('modal-overlay_light');
};

Modal.prototype.hideOverlay = function() {
  this.contentElem.classList.remove('modal-overlay_light');
};

Modal.prototype.setContent = function(htmlOrNode) {
  if (typeof htmlOrNode == 'string') {
    this.contentElem.innerHTML = htmlOrNode;
  } else {
    this.contentElem.innerHTML = '';
    this.contentElem.appendChild(htmlOrNode);
  }
  // use data-modal-autofocus where only modal should autofocus,
  // a field with data-modal-autofocus will not get focus, unless shown in modal
  let autofocus = this.contentElem.querySelector('[data-modal-autofocus],[autofocus]');
  if (autofocus) autofocus.focus();
};

Modal.prototype.remove = function() {
  document.body.classList.remove('paranja-open');
  document.body.removeChild(this.elem);
  document.removeEventListener("keydown", this.onDocumentKeyDown);
  this.elem.dispatchEvent(new CustomEvent("modal-remove"));
};

module.exports = Modal;
