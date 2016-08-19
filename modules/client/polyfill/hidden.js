if (document.documentElement.hidden === undefined) {
  document.head.insertAdjacentHTML('beforeEnd', '<style> [hidden] { display: none } </style>');
  Object.defineProperty(Element.prototype, "hidden", {
    set: function(value) {
      this.setAttribute('hidden', value);
    },
    get: function() {
      return this.getAttribute('hidden');
    }
  });
}
