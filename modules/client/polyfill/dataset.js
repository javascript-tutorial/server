// dataset for IE10

if (!document.documentElement.dataset &&
    // FF is empty while IE gives empty object
  (!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset')  ||
  !Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
) {
  let propDescriptor = {
    enumerable: true,
    get: function () {
      'use strict';
      let i,
          that = this,
          HTML5_DOMStringMap,
          attrVal, attrName, propName,
          attribute,
          attributes = this.attributes,
          attsLength = attributes.length,
          toUpperCase = function (n0) {
            return n0.charAt(1).toUpperCase();
          },
          getter = function () {
            return this;
          },
          setter = function (attrName, value) {
            return (typeof value !== 'undefined') ?
              this.setAttribute(attrName, value) :
              this.removeAttribute(attrName);
          };
      try { // Simulate DOMStringMap w/accessor support
        // Test setting accessor on normal object
        ({}).__defineGetter__('test', function () {});
        HTML5_DOMStringMap = {};
      }
      catch (e1) { // Use a DOM object for IE8
        HTML5_DOMStringMap = document.createElement('div');
      }
      for (i = 0; i < attsLength; i++) {
        attribute = attributes[i];
        // Fix: This test really should allow any XML Name without
        //         colons (and non-uppercase for XHTML)
        if (attribute && attribute.name &&
          (/^data-\w[\w\-]*$/).test(attribute.name)) {
          attrVal = attribute.value;
          attrName = attribute.name;
          // Change to CamelCase
          propName = attrName.substr(5).replace(/-./g, toUpperCase);
          try {
            Object.defineProperty(HTML5_DOMStringMap, propName, {
              enumerable: this.enumerable,
              get: getter.bind(attrVal || ''),
              set: setter.bind(that, attrName)
            });
          }
          catch (e2) { // if accessors are not working
            HTML5_DOMStringMap[propName] = attrVal;
          }
        }
      }
      return HTML5_DOMStringMap;
    }
  };
  try {
    // FF enumerates over element's dataset, but not
    //   Element.prototype.dataset; IE9 iterates over both
    Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
  } catch (e) {
    propDescriptor.enumerable = false; // IE8 does not allow setting to true
    Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
  }
}