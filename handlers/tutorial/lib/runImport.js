'use strict';

let TutorialImporter = require('../lib/tutorialImporter');
let TutorialTree = require('../models/tutorialTree');
let TutorialViewStorage = require('../models/tutorialViewStorage');
let config = require('config');
let fs = require('mz/fs');
let path = require('path');
let log = require('log')();

module.exports = async function() {

  let tree = TutorialTree.instance();
  let viewStorage = TutorialViewStorage.instance();

  let importer = new TutorialImporter({
    root: config.tutorialRoot
  });

  tree.clear();
  viewStorage.clear();

  let subRoots = fs.readdirSync(config.tutorialRoot);

  for (let subRoot of subRoots) {
    if (!parseInt(subRoot)) continue;
    await importer.sync(path.join(config.tutorialRoot, subRoot));
  }

  await fs.writeFile(path.join(config.cacheRoot, 'tutorialTree.json'), JSON.stringify(tree.serialize()));
  await fs.writeFile(path.join(config.cacheRoot, 'tutorialViewStorage.json'), JSON.stringify(viewStorage.serialize()));
  // await importer.generateCaches();

  log.info("Tutorial import complete");
};


