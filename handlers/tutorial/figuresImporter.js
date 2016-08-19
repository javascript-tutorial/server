const co = require('co');
const util = require('util');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const config = require('config');
const mongoose = require('lib/mongoose');
const glob = require("glob");

const log = require('log')();

const execSync = require('child_process').execSync;

// TODO: use htmlhint/jslint for html/js examples

function FiguresImporter(options) {
  this.sketchtool = options.sketchtool || '/Applications/Sketch.app/Contents/Resources/sketchtool/bin/sketchtool';

  this.root = fs.realpathSync(options.root);
  this.figuresFilePath = options.figuresFilePath;
}

FiguresImporter.prototype.syncFigures = function*() {

  if (!fs.existsSync(this.sketchtool)) {
    log.info("No sketchtool");
    return;
  }

  var outputDir = path.join(config.tmpRoot, 'sketchtool');

  fse.removeSync(outputDir);
  fse.mkdirsSync(outputDir);

  var artboardsByPages = JSON.parse(execSync(this.sketchtool + ' list artboards "' + this.figuresFilePath + '"', {
    encoding: 'utf-8'
  }));

  var artboards = artboardsByPages
    .pages
    .reduce(function(prev, current) {
      return prev.concat(current.artboards);
    }, []);

  var svgIds = [];
  var pngIds = [];
  var artboardsExported = [];

  for (var i = 0; i < artboards.length; i++) {
    var artboard = artboards[i];

    // only allow artboards with extensions are exported
    // others are temporary / helpers
    var ext = path.extname(artboard.name).slice(1);
    if (ext == 'png') {
      pngIds.push(artboard.id);
      artboardsExported.push(artboard);
    }
    if (ext == 'svg') {
      svgIds.push(artboard.id);
      artboardsExported.push(artboard);
    }
  }

  // NB: Artboards are NOT trimmed (sketchtool doesn't do that yet)
  execSync(this.sketchtool + ' export artboards "' + this.figuresFilePath + '" ' +
  '--overwriting=YES --trimmed=YES --formats=png --scales=1,2 --output="' + outputDir + '" --items=' + pngIds.join(','), {
    stdio: 'inherit',
    encoding: 'utf-8'
  });

  // NB: Artboards are NOT trimmed (sketchtool doesn't do that yet)
  execSync(this.sketchtool + ' export artboards "' + this.figuresFilePath + '" ' +
  '--overwriting=YES --trimmed=YES --formats=svg --output="' + outputDir + '" --items=' + svgIds.join(','), {
    stdio: 'inherit',
    encoding: 'utf-8'
  });

  // files are exported as array-pop.svg.svg, metric-css.png@2x.png
  // => remove first extension
  var images = glob.sync(path.join(outputDir, '*.*'));
  images.forEach(function(image) {
    fs.renameSync(image, image.replace(/.(svg|png)/, ''));
  });

  var allFigureFilePaths = glob.sync(path.join(this.root, '**/*.{png,svg}'));

  function findArtboardPaths(artboard) {

    var paths = [];
    for (var j = 0; j < allFigureFilePaths.length; j++) {
      if (path.basename(allFigureFilePaths[j]) == artboard.name) {
        paths.push(path.dirname(allFigureFilePaths[j]));
      }
    }

    return paths;

  }

  // copy should trigger folder resync on watch
  // and that's right (img size changed, <img> must be rerendered)

  for (var i = 0; i < artboardsExported.length; i++) {
    var artboard = artboardsExported[i];
    var artboardPaths = findArtboardPaths(artboard);
    if (!artboardPaths.length) {
      log.error("Artboard path not found " + artboard.name);
      continue;
    }

    for (var j = 0; j < artboardPaths.length; j++) {
      var artboardPath = artboardPaths[j];

      log.info("syncFigure move " + artboard.name + " -> " + artboardPath);
      fse.copySync(path.join(outputDir, artboard.name), path.join(artboardPath, artboard.name));
      if (path.extname(artboard.name) == '.png') {
        var x2Name = artboard.name.replace('.png', '@2x.png');
        fse.copySync(path.join(outputDir, x2Name), path.join(artboardPath, x2Name));
      }
    }

  }


};

module.exports = FiguresImporter;
