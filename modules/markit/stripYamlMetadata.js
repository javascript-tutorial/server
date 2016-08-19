'use strict';

// TODO: head.js head.css head.html instead of [head]

/**
 * Parses yaml from file
 * meta: value
 * ---
 * TEXT
 *
 * Returns {text: TEXT, meta: metadata}
 */
const yaml = require('js-yaml');

// YAML can throw!
module.exports = function(text) {

  let parts = text.split(/\n---\n/);

  if (parts.length != 2) {
    return {text, meta: {}};
  }

  let meta = yaml.safeLoad(parts[0]);

  return {
    text: parts[1],
    meta: meta
  };

};
