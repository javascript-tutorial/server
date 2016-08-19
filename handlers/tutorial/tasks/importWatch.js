'use strict';

var TutorialImporter = require('../tutorialImporter');
var FiguresImporter = require('../figuresImporter');
var co = require('co');
var fs = require('fs');
var path = require('path');
var livereload = require('gulp-livereload');
var log = require('log')();
var chokidar = require('chokidar');
var os = require('os');

module.exports = function(options) {

  return function(callback) {

    var args = require('yargs')
      .usage("Path to tutorial root is required.")
      .demand(['root'])
      .argv;

    var root = fs.realpathSync(args.root);

    if (!root) {
      throw new Error("Import watch root does not exist " + options.root);
    }

    watchTutorial(root);
    watchFigures(root);

    livereload.listen();

  };

};


function watchTutorial(root) {


  var importer = new TutorialImporter({
    root:     root,
    onchange: function(path) {
      log.info("livereload.change", path);
      livereload.changed(path);
    }
  });


  var subRoots = fs.readdirSync(root);
  subRoots = subRoots.filter(function(subRoot) {
    return parseInt(subRoot);
  }).map(function(dir) {
    return path.join(root, dir);
  });

  // under linux usePolling: true,
  // to handle the case when linux VM uses shared folder from Windows
  var tutorialWatcher = chokidar.watch(subRoots, {ignoreInitial: true, usePolling: os.platform() != 'darwin'});

  tutorialWatcher.on('add', onTutorialModify.bind(null, false));
  tutorialWatcher.on('change', onTutorialModify.bind(null, false));
  tutorialWatcher.on('unlink', onTutorialModify.bind(null, false));
  tutorialWatcher.on('unlinkDir', onTutorialModify.bind(null, true));
  tutorialWatcher.on('addDir', onTutorialModify.bind(null, true));

  function onTutorialModify(isDir, filePath) {
    if (~filePath.indexOf('___jb_')) return; // ignore JetBrains Webstorm tmp files

    log.debug("ImportWatch Modify " + filePath);

    co(function* () {

      var folder;
      if (isDir) {
        folder = filePath;
      } else {
        folder = path.dirname(filePath);
      }

      yield* importer.sync(folder);

    }).catch(function(err) {
      log.error(err);
    });
  }

}

function watchFigures(root) {

  var figuresFilePath = path.join(root, 'figures.sketch');
  var importer = new FiguresImporter({
    root: root,
    figuresFilePath: figuresFilePath
  });

  var figuresWatcher = chokidar.watch(figuresFilePath, {ignoreInitial: true});
  figuresWatcher.on('change', onFiguresModify);

  function onFiguresModify() {

    co(function* () {

      yield* importer.syncFigures();

    }).catch(function(err) {
      throw err;
    });
  }

}
