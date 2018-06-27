'use strict';

let TutorialImporter = require('../lib/tutorialImporter');
let TutorialTree = require('../models/tutorialTree');
let FiguresImporter = require('../figuresImporter');
let co = require('co');
let fs = require('fs');
let path = require('path');
let livereload = require('gulp-livereload');
let log = require('log')();
let chokidar = require('chokidar');
let os = require('os');

module.exports = function(options) {

  return async function() {

    let args = require('yargs')
      .usage("Path to tutorial root is required.")
      .demand(['root'])
      .argv;

    let root = fs.realpathSync(args.root);

    if (!root) {
      throw new Error("Import watch root does not exist " + options.root);
    }

    let tree = TutorialTree.instance();

    let importer = new TutorialImporter({
      root: root
    });

    tree.destroyAll();

    let subRoots = fs.readdirSync(root);

    for (let subRoot of subRoots) {
      if (!parseInt(subRoot)) continue;
      await importer.sync(path.join(root, subRoot));
    }

    log.info("Import complete");

    watchTutorial(root);
    watchFigures(root);

    livereload.listen();

    await new Promise(resolve => {});
  };

};


function watchTutorial(root) {


  let importer = new TutorialImporter({
    root:     root,
    onchange: function(path) {
      log.info("livereload.change", path);
      livereload.changed(path);
    }
  });


  let subRoots = fs.readdirSync(root);
  subRoots = subRoots.filter(function(subRoot) {
    return parseInt(subRoot);
  }).map(function(dir) {
    return path.join(root, dir);
  });

  // under linux usePolling: true,
  // to handle the case when linux VM uses shared folder from Windows
  let tutorialWatcher = chokidar.watch(subRoots, {ignoreInitial: true, usePolling: os.platform() != 'darwin'});

  tutorialWatcher.on('add', onTutorialModify.bind(null, false));
  tutorialWatcher.on('change', onTutorialModify.bind(null, false));
  tutorialWatcher.on('unlink', onTutorialModify.bind(null, false));
  tutorialWatcher.on('unlinkDir', onTutorialModify.bind(null, true));
  tutorialWatcher.on('addDir', onTutorialModify.bind(null, true));

  function onTutorialModify(isDir, filePath) {
    if (~filePath.indexOf('___jb_')) return; // ignore JetBrains Webstorm tmp files

    log.debug("ImportWatch Modify " + filePath);

    co(function* () {

      let folder;
      if (isDir) {
        folder = filePath;
      } else {
        folder = path.dirname(filePath);
      }

      await importer.sync(folder);

    }).catch(function(err) {
      log.error(err);
    });
  }

}

function watchFigures(root) {

  let figuresFilePath = path.join(root, 'figures.sketch');
  let importer = new FiguresImporter({
    root: root,
    figuresFilePath: figuresFilePath
  });

  let figuresWatcher = chokidar.watch(figuresFilePath, {ignoreInitial: true});
  figuresWatcher.on('change', onFiguresModify);

  function onFiguresModify() {

    co(function* () {

      await importer.syncFigures();

    }).catch(function(err) {
      throw err;
    });
  }

}
