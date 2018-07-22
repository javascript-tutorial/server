'use strict';

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const config = require('config');

const Article = require('../models/article');
const Task = require('../models/task');
const ArticleRenderer = require('../renderer/articleRenderer');
const TaskRenderer = require('../renderer/taskRenderer');
const log = require('log')();

const TutorialTree = require('../models/tutorialTree');
const TutorialView = require('../models/tutorialView');
const TutorialViewStorage = require('../models/tutorialViewStorage');
const TutorialParser = require('./tutorialParser');
const stripTitle = require('markit').stripTitle;
const stripYamlMetadata = require('markit').stripYamlMetadata;
const mime = require('mime');
const stripIndents = require('textUtil/stripIndents');

const t = require('i18n');

t.requirePhrase('tutorial', 'importer');

module.exports = class TutorialImporter {
  constructor(options) {
    this.root = fs.realpathSync(options.root);
    this.onchange = options.onchange || function () {};
    this.tree = TutorialTree.instance();
  }

  /*
  update=false => removes old entry and re-imports
  update=true => doesnn't remove anything, for adding only (checks for dupe slugs)
   */
  async sync(directory, update = false) {

    log.info("sync", directory);
    let dir = fs.realpathSync(directory);
    let type;
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

      if (directory === this.root || directory === '/') {
        throw new Error("Unknown directory type: " + directory);
      }
    }

    let slug = path.basename(dir).slice(path.basename(dir).indexOf('-') + 1);

    let parentDir = path.dirname(dir);

    let parentSlug = path.basename(parentDir);
    parentSlug = parentSlug.slice(parentSlug.indexOf('-') + 1);

    let parent = this.tree.bySlug(parentSlug);

    if (update) {
      //console.log("DESTROY", slug);
      this.tree.destroyTree(slug);
    }
    await this['sync' + type](dir, parent);

  }

  /**
   * Call this after all import is complete to generate caches/searches for ElasticSearch to consume
   */
  async generateCaches() {
    await ArticleRenderer.regenerateCaches();
    await TaskRenderer.regenerateCaches();
  }

  async syncFolder(sourceFolderPath, parent) {
    log.info("syncFolder", sourceFolderPath);

    const contentPath = path.join(sourceFolderPath, 'index.md');
    let content = fs.readFileSync(contentPath, 'utf-8').trim();

    const folderFileName = path.basename(sourceFolderPath);

    const data = {
      isFolder: true
    };

    if (parent) {
      data.parent = parent.slug;
    }

    data.weight = parseInt(folderFileName);
    data.slug = folderFileName.slice(folderFileName.indexOf('-') + 1);

    //this.tree.destroyTree(data.slug);

    let options = {
      staticHost: config.server.staticHost,
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

    await parser.parse(content);

    data.githubLink = config.tutorialGithubBaseUrl + sourceFolderPath.slice(this.root.length);

    log.debug(data);
    const folder = new Article(data);

    this.tree.add(folder);

    const subPaths = fs.readdirSync(sourceFolderPath);

    for (let subPath of subPaths) {
      if (subPath === 'index.md') continue;

      subPath = path.join(sourceFolderPath, subPath);

      if (fs.existsSync(path.join(subPath, 'index.md'))) {
        await this.syncFolder(subPath, folder);
      } else if (fs.existsSync(path.join(subPath, 'article.md'))) {
        await this.syncArticle(subPath, folder);
      } else {
        await this.syncResource(subPath, folder.getResourceFsRoot());
      }
    }

    this.onchange(folder.getUrl());

  };

  async syncArticle(articlePath, parent) {
    log.info("syncArticle", articlePath);

    const contentPath = path.join(articlePath, 'article.md');
    let content = fs.readFileSync(contentPath, 'utf-8').trim();

    const articlePathName = path.basename(articlePath);

    const data = {
      isFolder: false
    };

    if (parent) {
      data.parent = parent.slug;
    }

    data.weight = parseInt(articlePathName);
    data.slug = articlePathName.slice(articlePathName.indexOf('-') + 1);

    // this.tree.destroyTree(data.slug);

    const options = {
      staticHost: config.server.staticHost,
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

    // just make sure it parses
    await parser.parse(content);

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
    this.tree.add(article);

    const subPaths = fs.readdirSync(articlePath);

    for (let subPath of subPaths) {
      if (subPath === 'article.md') continue;

      subPath = path.join(articlePath, subPath);

      if (fs.existsSync(path.join(subPath, 'task.md'))) {
        await this.syncTask(subPath, article);
      } else if (subPath.endsWith('.view')) {
        await this.syncView(subPath, article);
      } else {
        // resources
        await this.syncResource(subPath, article.getResourceFsRoot());
      }

    }

    this.onchange(article.getUrl());

  };


  async syncResource(sourcePath, destDir) {
    fse.ensureDirSync(destDir);

    log.debug("syncResource", sourcePath, destDir);

    const stat = fs.statSync(sourcePath);
    const ext = getFileExt(sourcePath);
    const destPath = path.join(destDir, path.basename(sourcePath));

    if (stat.isFile()) {
      if (ext === 'png' || ext === 'jpg' || ext === 'gif' || ext === 'svg') {
        importImage(sourcePath, destDir);
        return;
      }
      copySync(sourcePath, destPath);
    } else if (stat.isDirectory()) {
      fse.ensureDirSync(destPath);
      const subPathNames = fs.readdirSync(sourcePath);
      for (let subPath of subPathNames) {
        subPath = path.join(sourcePath, subPath);
        await this.syncResource(subPath, destPath);
      }

    } else {
      throw new Error("Unsupported file type at " + sourcePath);
    }

  };

  async syncTask(taskPath, parent) {
    log.debug("syncTask", taskPath);

    const contentPath = path.join(taskPath, 'task.md');
    let content = fs.readFileSync(contentPath, 'utf-8').trim();

    const taskPathName = path.basename(taskPath);

    const data = {
      parent: parent.slug
    };

    data.weight = parseInt(taskPathName);
    data.slug = taskPathName.slice(taskPathName.indexOf('-') + 1);

    data.githubLink = config.tutorialGithubBaseUrl + taskPath.slice(this.root.length);

    //this.tree.destroyTree(data.slug);

    const options = {
      staticHost: config.server.staticHost,
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

    await parser.parse(content);

    // Solution, no title, no meta
    const solutionPath = path.join(taskPath, 'solution.md');
    const solution = fs.readFileSync(solutionPath, 'utf-8').trim();
    data.solution = solution;

    log.debug("parsing solution");

    await parser.parse(solution);

    const task = new Task(data);
    this.tree.add(task);

    log.debug("task saved");

    const subPaths = fs.readdirSync(taskPath);

    for (let subPath of subPaths) {
      // names starting with _ don't sync
      if (subPath === 'task.md' || subPath === 'solution.md' || subPath[0] === '_') continue;

      subPath = path.join(taskPath, subPath);

      if (subPath.endsWith('.view')) {
        await this.syncView(subPath, task);
      } else {
        await this.syncResource(subPath, task.getResourceFsRoot());
      }
    }

    if (fs.existsSync(path.join(taskPath, '_js.view'))) {
      await this.syncTaskJs(path.join(taskPath, '_js.view'), task);
    }

    this.onchange(task.getUrl());

  };


  async syncView(dir, parent) {

    log.info("syncView: dir", dir);
    let pathName = path.basename(dir).replace('.view', '');
    if (pathName === '_js') {
      throw new Error("Must not syncView " + pathName);
    }

    let webPath = parent.getResourceWebRoot() + '/' + pathName;

    log.debug("syncView webpath", webPath);
    let view = TutorialViewStorage.instance().get(webPath);

    if (view) {
      log.debug("Plunk from db", view);
    } else {
      view = new TutorialView({
        webPath,
        description: "Fork from https://" + config.domain.main
      });
      log.debug("Created new plunk (db empty)", view);
    }

    let filesForPlunk = readFs(dir);
    log.debug("Files for plunk", filesForPlunk);

    if (!filesForPlunk) return; // had errors

    log.debug("Merging plunk");

    await view.mergeAndSyncPlunk(filesForPlunk, this.plunkerToken);

    log.debug("Plunk merged");

    let dst = path.join(parent.getResourceFsRoot(), pathName);

    fse.ensureDirSync(dst);
    fs.readdirSync(dir).forEach(function(dirFile) {
      copySync(path.join(dir, dirFile), path.join(dst, dirFile));
    });

    TutorialViewStorage.instance().set(webPath, view);
  };


  async syncTaskJs(jsPath, task) {

    log.debug("syncTaskJs", jsPath);

    let sourceJs;

    try {
      sourceJs = fs.readFileSync(path.join(jsPath, 'source.js'), 'utf8');
    } catch (e) {
      sourceJs = "// " + t('tutorial.importer.your_code');
    }

    let testJs;
    try {
      testJs = fs.readFileSync(path.join(jsPath, 'test.js'), 'utf8');
    } catch (e) {
      testJs = "";
    }

    let solutionJs = fs.readFileSync(path.join(jsPath, 'solution.js'), 'utf8');

    // Source
    let sourceWebPath = task.getResourceWebRoot() + '/source';

    let source = makeSource(sourceJs, testJs);

    let sourceView = TutorialViewStorage.instance().get(sourceWebPath);

    if (!sourceView) {
      sourceView = new TutorialView({
        webPath: sourceWebPath,
        description: "Fork from https://" + config.domain.main
      });
      TutorialViewStorage.instance().set(sourceWebPath, sourceView);
    }

    let sourceFilesForView = {
      'index.html': {
        content:  source,
        filename: 'index.html'
      },
      'test.js':    !testJs ? null : {
        content:  testJs.trim(),
        filename: 'test.js'
      }
    };

    log.debug("save plunk for ", sourceWebPath);
    await sourceView.mergeAndSyncPlunk(sourceFilesForView, this.plunkerToken);

    // Solution
    let solutionWebPath = task.getResourceWebRoot() + '/solution';

    let solution = makeSolution(solutionJs, testJs);

    let solutionView = TutorialViewStorage.instance().get(solutionWebPath);

    if (!solutionView) {
      solutionView = new TutorialView({
        webPath:     solutionWebPath,
        description: "Fork from https://" + config.domain.main
      });
      TutorialViewStorage.instance().set(solutionWebPath, solutionView);
    }

    let solutionFilesForView = {
      'index.html': {
        content:  solution,
        filename: 'index.html'
      },
      'test.js':    !testJs ? null : {
        content:  testJs.trim(),
        filename: 'test.js'
      }
    };

    log.debug("save plunk for ", solutionWebPath);
    await solutionView.mergeAndSyncPlunk(solutionFilesForView, this.plunkerToken);

  };

};



function makeSource(sourceJs, testJs) {
  let source = "<!DOCTYPE HTML>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n";
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
  let solution = "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n";
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

  return stat1.mtime === stat2.mtime;
}


function getFileExt(filePath) {
  let ext = filePath.match(/\.([^.]+)$/);
  return ext && ext[1];
}

function importImage(srcPath, dstDir) {
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


function readFs(dir) {

  let files = fs.readdirSync(dir);

  let hadErrors = false;
  files = files.filter(function(file) {
    if (file[0] == ".") return false;

    let filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      log.error("Directory not allowed: " + file);
      hadErrors = true;
    }

    let type = mime.getType(file).split('/');
    if (type[0] != 'text' && type[1] != 'json' && type[1] != 'javascript' && type[1] != 'svg+xml') {
      log.error("Bad file extension: " + file);
      hadErrors = true;
    }

    return true;
  });

  if (hadErrors) {
    return null;
  }

  files = files.sort(function(fileA, fileB) {
    let extA = fileA.slice(fileA.lastIndexOf('.') + 1);
    let extB = fileB.slice(fileB.lastIndexOf('.') + 1);

    if (extA == extB) {
      return fileA > fileB ? 1 : -1;
    }

    // html always first
    if (extA == 'html') return 1;
    if (extB == 'html') return -1;

    // then goes CSS
    if (extA == 'css') return 1;
    if (extB == 'css') return -1;

    // then JS
    if (extA == 'js') return 1;
    if (extB == 'js') return -1;

    // then other extensions
    return fileA > fileB ? 1 : -1;
  });

  let filesForPlunk = {};
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    filesForPlunk[file] = {
      filename: file,
      content: stripIndents(fs.readFileSync(path.join(dir, file), 'utf-8'))
    };
  }

  return filesForPlunk;
}
  