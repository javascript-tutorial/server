'use strict';

const co = require('co');
const util = require('util');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const config = require('config');
const mongoose = require('lib/mongoose');

const Article = require('tutorial').Article;
const Plunk = require('plunk').Plunk;
const Task = require('tutorial').Task;
const ArticleRenderer = require('./renderer/articleRenderer');
const TaskRenderer = require('./renderer/taskRenderer');
const log = require('log')();

const TutorialParser = require('./lib/tutorialParser');
const stripTitle = require('markit').stripTitle;
const stripYamlMetadata = require('markit').stripYamlMetadata;


function TutorialImporter(options) {
  this.root = fs.realpathSync(options.root);
  this.onchange = options.onchange || function() {    };
}

TutorialImporter.prototype.sync = function* (directory) {

  log.info("sync", directory);
  var dir = fs.realpathSync(directory);
  var type;
  while (true) {
    if (dir.endsWith('.view') && !dir.endsWith('/_js.view')) {
      type = 'View';
      break;
    }
    if (fs.existsSync(path.join(dir, 'index.md'))) {
      type = 'Folder';
      break;
    }
    if (fs.existsSync(path.join(dir, 'article.md'))) {
      type = 'Article';
      break;
    }
    if (fs.existsSync(path.join(dir, 'task.md'))) {
      type = 'Task';
      break;
    }

    dir = path.dirname(dir);

    if (directory == this.root || directory == '/') {
      throw new Error("Unknown directory type: " + directory);
    }
  }

  var parentDir = path.dirname(dir);

  var parentSlug = path.basename(parentDir);
  parentSlug = parentSlug.slice(parentSlug.indexOf('-') + 1);

  var parent;
  if (fs.existsSync(path.join(parentDir, 'task.md'))) {
    parent = yield Task.findOne({slug: parentSlug}).exec();
  } else {
    parent = yield Article.findOne({slug: parentSlug}).exec();
  }
  yield* this['sync' + type](dir, parent);

};

/**
 * Call this after all import is complete to generate caches/searches for ElasticSearch to consume
 */
TutorialImporter.prototype.generateCaches = function*() {
  yield ArticleRenderer.regenerateCaches();
  yield TaskRenderer.regenerateCaches();
};


TutorialImporter.prototype.destroyAll = function* () {
  yield Article.destroy({});
  yield Task.destroy({});
};

TutorialImporter.prototype.syncFolder = function*(sourceFolderPath, parent) {
  log.info("syncFolder", sourceFolderPath);

  const contentPath = path.join(sourceFolderPath, 'index.md');
  let content = fs.readFileSync(contentPath, 'utf-8').trim();

  const folderFileName = path.basename(sourceFolderPath);

  const data = {
    isFolder: true
  };

  if (parent) {
    data.parent = parent._id;
  }

  data.weight = parseInt(folderFileName);
  data.slug = folderFileName.slice(folderFileName.indexOf('-') + 1);

  yield Article.destroyTree({slug: data.slug});

  var options = {
    staticHost:      config.server.staticHost,
    resourceWebRoot: Article.getResourceWebRootBySlug(data.slug)
  };

  let tmp = stripYamlMetadata(content);

  content = tmp.text;
  let meta = tmp.meta;

  if (meta.libs) data.libs = meta.libs;

  tmp = stripTitle(content);

  data.title = tmp.title;
  content = tmp.text;

  data.content = content;

  const parser = new TutorialParser(options);

  const tokens = yield* parser.parse(content);

  data.githubLink = config.tutorialGithubBaseUrl + sourceFolderPath.slice(this.root.length);

  const folder = new Article(data);

  yield folder.persist();

  const subPaths = fs.readdirSync(sourceFolderPath);

  for (var i = 0; i < subPaths.length; i++) {
    if (subPaths[i] == 'index.md') continue;

    var subPath = path.join(sourceFolderPath, subPaths[i]);

    if (fs.existsSync(path.join(subPath, 'index.md'))) {
      yield* this.syncFolder(subPath, folder);
    } else if (fs.existsSync(path.join(subPath, 'article.md'))) {
      yield* this.syncArticle(subPath, folder);
    } else {
      yield* this.syncResource(subPath, folder.getResourceFsRoot());
    }
  }

  this.onchange(folder.getUrl());

};

TutorialImporter.prototype.syncArticle = function* (articlePath, parent) {
  log.info("syncArticle", articlePath);

  const contentPath = path.join(articlePath, 'article.md');
  let content = fs.readFileSync(contentPath, 'utf-8').trim();

  const articlePathName = path.basename(articlePath);

  const data = {
    isFolder: false
  };

  if (parent) {
    data.parent = parent._id;
  }

  data.weight = parseInt(articlePathName);
  data.slug = articlePathName.slice(articlePathName.indexOf('-') + 1);

  yield Article.destroyTree({slug: data.slug});

  const options = {
    staticHost:      config.server.staticHost,
    resourceWebRoot: Article.getResourceWebRootBySlug(data.slug)
  };

  let tmp = stripYamlMetadata(content);

  content = tmp.text;
  let meta = tmp.meta;

  if (meta.libs) data.libs = meta.libs;

  tmp = stripTitle(content);

  data.title = tmp.title;
  content = tmp.text;

  data.content = content;

  const parser = new TutorialParser(options);

  const tokens = yield* parser.parse(content);

  data.githubLink = config.tutorialGithubBaseUrl + articlePath.slice(this.root.length) + '/article.md';

  try {
    data.headJs = fs.readFileSync(path.join(articlePath, 'head.js'));
  } catch (e) {
  }
  try {
    data.headCss = fs.readFileSync(path.join(articlePath, 'head.css'));
  } catch (e) {
  }
  try {
    data.headHtml = fs.readFileSync(path.join(articlePath, 'head.html'));
  } catch (e) {
  }

  const article = new Article(data);
  yield article.persist();

  const subPaths = fs.readdirSync(articlePath);

  for (var i = 0; i < subPaths.length; i++) {
    if (subPaths[i] == 'article.md') continue;

    var subPath = path.join(articlePath, subPaths[i]);


    if (fs.existsSync(path.join(subPath, 'task.md'))) {
      yield* this.syncTask(subPath, article);
    } else if (subPath.endsWith('.view')) {
      yield* this.syncView(subPath, article);
    } else {
      // resources
      yield* this.syncResource(subPath, article.getResourceFsRoot());
    }

  }

  this.onchange(article.getUrl());

};


TutorialImporter.prototype.syncResource = function*(sourcePath, destDir) {
  fse.ensureDirSync(destDir);

  log.info("syncResource", sourcePath, destDir);

  const stat = fs.statSync(sourcePath);
  const ext = getFileExt(sourcePath);
  const destPath = path.join(destDir, path.basename(sourcePath));

  if (stat.isFile()) {
    if (ext == 'png' || ext == 'jpg' || ext == 'gif' || ext == 'svg') {
      yield* importImage(sourcePath, destDir);
      return;
    }
    copySync(sourcePath, destPath);
  } else if (stat.isDirectory()) {
    fse.ensureDirSync(destPath);
    const subPathNames = fs.readdirSync(sourcePath);
    for (var i = 0; i < subPathNames.length; i++) {
      var subPath = path.join(sourcePath, subPathNames[i]);
      yield* this.syncResource(subPath, destPath);
    }

  } else {
    throw new Error("Unsupported file type at " + sourcePath);
  }

};

function getFileExt(filePath) {
  var ext = filePath.match(/\.([^.]+)$/);
  return ext && ext[1];
}

function* importImage(srcPath, dstDir) {
  log.info("importImage", srcPath, "to", dstDir);
  const filename = path.basename(srcPath);
  const dstPath = path.join(dstDir, filename);

  copySync(srcPath, dstPath);
}

function copySync(srcPath, dstPath) {
  if (checkSameMtime(srcPath, dstPath)) {
    log.debug("copySync: same mtime %s = %s", srcPath, dstPath);
    return;
  }

  log.debug("copySync %s -> %s", srcPath, dstPath);

  fse.copySync(srcPath, dstPath);
}

TutorialImporter.prototype.syncTask = function*(taskPath, parent) {
  log.info("syncTask", taskPath);

  const contentPath = path.join(taskPath, 'task.md');
  let content = fs.readFileSync(contentPath, 'utf-8').trim();

  const taskPathName = path.basename(taskPath);

  const data = {
    parent: parent._id
  };

  data.weight = parseInt(taskPathName);
  data.slug = taskPathName.slice(taskPathName.indexOf('-') + 1);

  data.githubLink = config.tutorialGithubBaseUrl + taskPath.slice(this.root.length);

  // console.log("DESTROY", data);
  yield Task.destroy({slug: data.slug});

  const options = {
    staticHost:      config.server.staticHost,
    resourceWebRoot: Task.getResourceWebRootBySlug(data.slug)
  };


  let tmp = stripYamlMetadata(content);

  content = tmp.text;
  let meta = tmp.meta;

  if (meta.libs) data.libs = meta.libs;
  if (meta.importance) data.importance = meta.importance;

  tmp = stripTitle(content);

  data.title = tmp.title;
  content = tmp.text;

  data.content = content;

  const parser = new TutorialParser(options);

  let tokens = yield* parser.parse(content);

  // Solution, no title, no meta
  const solutionPath = path.join(taskPath, 'solution.md');
  const solution = fs.readFileSync(solutionPath, 'utf-8').trim();
  data.solution = solution;

  log.debug("parsing solution");

  tokens = yield* parser.parse(solution);

  const task = new Task(data);
  yield task.persist();

  log.debug("task saved");

  const subPaths = fs.readdirSync(taskPath);

  for (var i = 0; i < subPaths.length; i++) {
    // names starting with _ don't sync
    if (subPaths[i] == 'task.md' || subPaths[i] == 'solution.md' || subPaths[i][0] == '_') continue;

    var subPath = path.join(taskPath, subPaths[i]);

    if (subPath.endsWith('.view')) {
      yield* this.syncView(subPath, task);
    } else {
      yield* this.syncResource(subPath, task.getResourceFsRoot());
    }
  }

  if (fs.existsSync(path.join(taskPath, '_js.view'))) {
    yield* this.syncTaskJs(path.join(taskPath, '_js.view'), task);
  }

  this.onchange(task.getUrl());

};

TutorialImporter.prototype.syncView = function*(dir, parent) {

  log.info("syncView: dir", dir);
  var pathName = path.basename(dir).replace('.view', '');
  if (pathName == '_js') {
    throw new Error("Must not syncView " + pathName);
  }

  var webPath = parent.getResourceWebRoot() + '/' + pathName;

  log.debug("syncView webpath", webPath);
  var plunk = yield Plunk.findOne({webPath: webPath});

  if (plunk) {
    log.debug("Plunk from db", plunk);
  } else {
    plunk = new Plunk({
      webPath:     webPath,
      description: "Fork from https://" + config.domain.main
    });
    log.debug("Created new plunk (db empty)", plunk);
  }

  var filesForPlunk = require('plunk').readFs(dir);
  log.debug("Files for plunk", filesForPlunk);

  if (!filesForPlunk) return; // had errors

  log.debug("Merging plunk");

  yield* plunk.mergeAndSyncRemote(filesForPlunk);

  log.debug("Plunk merged");

  var dst = path.join(parent.getResourceFsRoot(), pathName);

  fse.ensureDirSync(dst);
  fs.readdirSync(dir).forEach(function(dirFile) {
    copySync(path.join(dir, dirFile), path.join(dst, dirFile));
  });
};


TutorialImporter.prototype.syncTaskJs = function*(jsPath, task) {

  log.debug("syncTaskJs", jsPath);

  var sourceJs;

  try {
    sourceJs = fs.readFileSync(path.join(jsPath, 'source.js'), 'utf8');
  } catch (e) {
    sourceJs = "// ...ваш код...";
  }

  var testJs;
  try {
    testJs = fs.readFileSync(path.join(jsPath, 'test.js'), 'utf8');
  } catch (e) {
    testJs = "";
  }

  var solutionJs = fs.readFileSync(path.join(jsPath, 'solution.js'), 'utf8');

  // Source
  var webPath = task.getResourceWebRoot() + '/source';

  var source = makeSource(sourceJs, testJs);

  var sourcePlunk = yield Plunk.findOne({webPath: webPath}).exec();

  if (!sourcePlunk) {
    sourcePlunk = new Plunk({
      webPath:     webPath,
      description: "Fork from https://" + config.domain.main
    });
  }

  var filesForPlunk = {
    'index.html': {
      content:  source,
      filename: 'index.html'
    },
    'test.js':    !testJs ? null : {
      content:  testJs.trim(),
      filename: 'test.js'
    }
  };

  log.debug("save plunk for ", webPath);
  yield* sourcePlunk.mergeAndSyncRemote(filesForPlunk);

  // Solution
  var webPath = task.getResourceWebRoot() + '/solution';

  var solution = makeSolution(solutionJs, testJs);

  var solutionPlunk = yield Plunk.findOne({webPath: webPath}).exec();

  if (!solutionPlunk) {
    solutionPlunk = new Plunk({
      webPath:     webPath,
      description: "Fork from https://" + config.domain.main
    });
  }

  var filesForPlunk = {
    'index.html': {
      content:  solution,
      filename: 'index.html'
    },
    'test.js':    !testJs ? null : {
      content:  testJs.trim(),
      filename: 'test.js'
    }
  };

  log.debug("save plunk for ", webPath);
  yield* solutionPlunk.mergeAndSyncRemote(filesForPlunk);

};


function makeSource(sourceJs, testJs) {
  var source = "<!DOCTYPE HTML>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n";
  if (testJs) {
    source += "  <script src=\"https://" + config.domain.static + "/test/libs.js\"></script>\n";
    source += "  <script src=\"test.js\"></script>\n";
  }
  source += "</head>\n<body>\n\n  <script>\n\n";

  source += sourceJs.trim().replace(/^/gim, '    ');
  source += "\n\n  </script>\n";
  source += "\n</body>\n</html>";
  return source;
}


function makeSolution(solutionJs, testJs) {
  var solution = "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n";
  if (testJs) {
    solution += "  <script src=\"https://" + config.domain.static + "/test/libs.js\"></script>\n";
    solution += "  <script src=\"test.js\"></script>\n";
  }
  solution += "</head>\n<body>\n\n  <script>\n\n";

  solution += solutionJs.trim().replace(/^/gim, '    ');

  solution += "\n\n  </script>\n";
  solution += "\n</body>\n</html>";

  return solution;
}


function checkSameMtime(filePath1, filePath2) {
  if (!fs.existsSync(filePath2)) return false;

  const stat1 = fs.statSync(filePath1);
  if (!stat1.isFile()) {
    throw new Error("not a file: " + filePath1);
  }

  const stat2 = fs.statSync(filePath2);
  if (!stat2.isFile()) {
    throw new Error("not a file: " + filePath2);
  }

  return stat1.mtime == stat2.mtime;
}


module.exports = TutorialImporter;
