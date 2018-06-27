'use strict';

/**
 * Import tutorial into DB
 * @type {TutorialImporter|exports}
 */

let TutorialImporter = require('../lib/tutorialImporter');
let TutorialTree = require('../models/tutorialTree');
let co = require('co');
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

    let tree = TutorialTree.instance();

    let importer = new TutorialImporter({
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


