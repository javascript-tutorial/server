const path = require('path');
const fs = require('mz/fs');
const config = require('config');
const TutorialViewStorage = require('../models/tutorialViewStorage');
const TutorialTree = require('../models/tutorialTree');

module.exports = async function() {
  if (process.env.TUTORIAL_EDIT) {
    // imported and watched by another task
    return;
  }
  if (!await fs.exists(path.join(config.cacheRoot, 'tutorialTree.json'))) {
    throw new Error("Tutorial not imported? No cache/tutorialTree.json");
  }

  let tree = await fs.readFile(path.join(config.cacheRoot, 'tutorialTree.json'));
  tree = JSON.parse(tree);
  TutorialTree.instance().load(tree);

  let views = await fs.readFile(path.join(config.cacheRoot, 'tutorialViewStorage.json'));
  views = JSON.parse(views);
  TutorialViewStorage.instance().load(tree);
};