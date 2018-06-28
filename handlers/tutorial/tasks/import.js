'use strict';

let runImport = require('tutorial').runImport;
let log = require('log')();

module.exports = function(options) {

  return function() {

    return async function() {

      await runImport();

    }();
  };
};


