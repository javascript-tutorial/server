'use strict';

/**
 * Import figures.sketch into tutorial
 * @type {FiguresImporter|exports}
 */

var FiguresImporter = require('../figuresImporter');
var co = require('co');
var fs = require('fs');
var path = require('path');
var log = require('log')();

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Path to tutorial root is required.")
      .demand(['root'])
      .argv;

    var root = fs.realpathSync(args.root);

    var importer = new FiguresImporter({
      root: root,
      figuresFilePath: path.join(root, 'figures.sketch')
    });

    return co(function* () {

      yield* importer.syncFigures();

      log.info("Figures imported");
    });
  };
};


