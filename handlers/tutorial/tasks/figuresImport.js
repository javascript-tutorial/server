'use strict';

/**
 * Import figures.sketch into tutorial
 * @type {FiguresImporter|exports}
 */

let FiguresImporter = require('../figuresImporter');

let fs = require('fs');
let path = require('path');
let log = require('log')();

module.exports = function(options) {

  return function() {

    let args = require('yargs')
      .usage("Path to tutorial root is required.")
      .demand(['root'])
      .argv;

    let root = fs.realpathSync(args.root);

    let importer = new FiguresImporter({
      root: root,
      figuresFilePath: path.join(root, 'figures.sketch')
    });

    return async function() {

      await importer.syncFigures();

      log.info("Figures imported");
    }();
  };
};


