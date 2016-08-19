'use strict';

/**
 * Strips first # Title
 * Returns {title, text}
 */

module.exports = function(text) {

  let titleReg = /^\s*#\s+(.*)(\n|$)/;
  let title = text.match(titleReg);

  if (!title) {
    return {
      text: text,
      title: ''
    };
  }

  return {
    text: text.replace(titleReg, ''),
    title: title[1].trim()
  };

};
