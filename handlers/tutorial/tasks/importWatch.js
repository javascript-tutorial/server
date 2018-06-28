'use strict';

let TutorialImporter = require('../lib/tutorialImporter');
let TutorialTree = require('../models/tutorialTree');
let TutorialViewStorage = require('../models/tutorialViewStorage');
let FiguresImporter = require('../figuresImporter');
let fs = require('fs');
let path = require('path');
let livereload = require('gulp-livereload');
let log = require('log')();
let chokidar = require('chokidar');
let os = require('os');
let config = require('config');

module.exports = function(options) {

  return async function() {

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

    log.info("Import complete");

    watchTutorial();
    watchFigures();

    livereload.listen();

    await new Promise(resolve => {});
  };

};


function watchTutorial() {


  let importer = new TutorialImporter({
    root:     config.tutorialRoot,
    onchange: function(path) {
      log.info("livereload.change", path);
      livereload.changed(path);
    }
  });


  let subRoots = fs.readdirSync(config.tutorialRoot);
  subRoots = subRoots.filter(function(subRoot) {
    return parseInt(subRoot);
  }).map(function(dir) {
    return path.join(config.tutorialRoot, dir);
  });

  // under linux set WATCH_USE_POLLING
  // to handle the case when linux VM uses shared folder from Windows
  let tutorialWatcher = chokidar.watch(subRoots, {ignoreInitial: true, usePolling: process.env.WATCH_USE_POLLING});

  tutorialWatcher.on('add', onTutorialModify.bind(null, false));
  tutorialWatcher.on('change', onTutorialModify.bind(null, false));
  tutorialWatcher.on('unlink', onTutorialModify.bind(null, false));
  tutorialWatcher.on('unlinkDir', onTutorialModify.bind(null, true));
  tutorialWatcher.on('addDir', onTutorialModify.bind(null, true));

  function onTutorialModify(isDir, filePath) {
    if (~filePath.indexOf('___jb_')) return; // ignore JetBrains Webstorm tmp files

    log.debug("ImportWatch Modify " + filePath);

    let folder;
    if (isDir) {
      folder = filePath;
    } else {
      folder = path.dirname(filePath);
    }

    importer.sync(folder).catch(function(err) {
      log.error(err);
    });
  }

}

function watchFigures() {

  let figuresFilePath = path.join(config.tutorialRoot, 'figures.sketch');
  let importer = new FiguresImporter({
    root: config.tutorialRoot,
    figuresFilePath: figuresFilePath
  });

  let figuresWatcher = chokidar.watch(figuresFilePath, {ignoreInitial: true});
  figuresWatcher.on('change', onFiguresModify);

  function onFiguresModify() {

    importer.syncFigures().catch(function(err) {
      console.error(err);
    });
  }

}
