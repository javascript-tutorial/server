// Adapted from bemto.jade, copyright(c) 2012 Roman Komarov <kizu@kizu.ru>

/* jshint -W106 */

var jade = require('jade/lib/runtime');

module.exports = function(settings) {
  settings = settings || {};

  settings.prefix = settings.prefix || '';
  settings.element = settings.element || '__';
  settings.modifier = settings.modifier || '_';

  return function(buf, bem_chain, tag, isElement) {
    //console.log("-->", arguments);
    var block = this.block;
    var attributes = this.attributes || {};

    if (!attributes.class && tag && !isElement) {
      throw new Error("Block without class: " + tag);
    }

    // Rewriting the class for elements and modifiers
    if (attributes.class) {
      var bem_classes = attributes.class;

      if (bem_classes instanceof Array) {
        bem_classes = bem_classes.join(' ');
      }
      bem_classes = bem_classes.split(' ');

      var bem_block;
      try {
        bem_block = bem_classes[0].match(new RegExp('^(((?!' + settings.element + '|' + settings.modifier + ').)+)'))[1];
      } catch (e) {
        throw new Error("Incorrect bem class: " + bem_classes[0]);
      }

      if (!isElement) {
        bem_chain[bem_chain.length] = bem_block;
      } else {
        bem_classes[0] = bem_chain[bem_chain.length - 1] + settings.element + bem_classes[0];
      }

      var current_block = (isElement ? bem_chain[bem_chain.length - 1] + settings.element : '') + bem_block;

      // Adding the block if there is only modifier and/or element
      if (bem_classes.indexOf(current_block) === -1) {
        bem_classes[bem_classes.length] = current_block;
      }

      for (var i = 0; i < bem_classes.length; i++) {
        var klass = bem_classes[i];

        if (klass.match(new RegExp('^(?!' + settings.element + ')' + settings.modifier))) {
          // Expanding the modifiers
          bem_classes[i] = current_block + klass;
        } else if (klass.match(new RegExp('^' + settings.element))) {
          //- Expanding the mixed in elements
          if (bem_chain[bem_chain.length - 2]) {
            bem_classes[i] = bem_chain[bem_chain.length - 2] + klass;
          } else {
            bem_classes[i] = bem_chain[bem_chain.length - 1] + klass;
          }
        }

        // Adding prefixes
        if (bem_classes[i].match(new RegExp('^' + current_block + '($|(?=' + settings.element + '|' + settings.modifier + '))'))) {
          bem_classes[i] = settings.prefix + bem_classes[i];
        }
      }

      // Write modified classes to attributes in the correct order
      attributes.class = bem_classes.sort().join(' ');
    }

    bem_tag(buf, block, attributes, bem_chain, tag);

    // Closing actions (remove the current block from the chain)
    if (!isElement) {
      bem_chain.pop();
    }
  };


  // used for tweaking what tag we are throwing and do we need to wrap anything here
  function bem_tag(buf, block, attributes, bem_chain, tag) {
    // rewriting tag name on different contexts
    var newTag = tag || 'div';

    switch (newTag) {
    case 'img':
      // If there is no title we don't need it to show even if there is some alt
      if (attributes.alt && !attributes.title) {
        attributes.title = '';
      }
      // If we have title, we must have it in alt if it's not set
      if (attributes.title && !attributes.alt) {
        attributes.alt = attributes.title;
      }
      if (!attributes.alt) {
        attributes.alt = '';
      }
      break;
    case 'input':
      if (!attributes.type) {
        attributes.type = "text";
      }
      break;
    case 'html':
      buf.push('<!DOCTYPE HTML>');
      break;
    case 'a':
      if (!attributes.href) {
        attributes.href = '#';
      }
    }

    buf.push('<' + newTag + jade.attrs(jade.merge([attributes]), true) + ">");

    if (block) block();

    if (['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'].indexOf(newTag) == -1) {
      buf.push('</' + newTag + '>');
    }

  }


};
