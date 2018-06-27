'use strict';

/**
 * Import tutorial into DB
 * @type {TutorialImporter|exports}
 */

var TutorialImporter = require('../lib/tutorialImporter');
var TutorialTree = require('../models/tutorialTree');
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

    var tree = TutorialTree.instance();

    var importer = new TutorialImporter({
      root: root
    });

    return async function() {

      log.info("START");
      tree.destroyAll();

      let subRoots = fs.readdirSync(root);

      for (let subRoot of subRoots) {
        if (!parseInt(subRoot)) continue;
        await importer.sync(path.join(root, subRoot));
      }

      // await importer.generateCaches();

      // console.log("SLUGMAP", tree.bySlugMap);
      log.info("DONE");

    }();
  };
};


