/**
 * Autorun tasks *sequentially* on watch events
 */

var gulp = require('gulp');
var minimatch = require("minimatch");
var chokidar = require('chokidar');
var fs = require('fs');
var runSequence = require('run-sequence');
var glob = require('glob');
var path = require('path');

var taskQueue = [];
var taskRunning = '';

var DEBUG = false;

function log() {
  if (!DEBUG) return;

  var args = [].slice.call(arguments);
  args.unshift(Date.now() % 1e6);

  console.log.apply(console, args);
}

function pushTaskQueue(task) {
  if (~taskQueue.indexOf(task)) {
    log("queue: already exists", task);
    return;
  }
  /* (maybe the task should be moved into the end of the queue? couldn't find any practical difference)
   if (~taskQueue.indexOf(task)) {
   log("queue: already exists, removing", task);
   taskQueue.splice(taskQueue.indexOf(task), 1);
   }
   */
  taskQueue.push(task);
  log("push", taskQueue);

  if (!taskRunning) {
    runNext();
  }
}

function runNext() {
  if (!taskQueue.length) return;

  taskRunning = taskQueue.shift();
  log("runNext start", taskRunning, "queue", taskQueue);

  runSequence(taskRunning, function(err) {
    log("runNext finish", taskRunning);
    taskRunning = '';
    runNext();
  });
}

function onModify(filePath) {
  if (~filePath.indexOf('___jb_')) return; // ignore JetBrains Webstorm tmp files

  var relFilePath = filePath.slice(this.root.length + 1);

  if (DEBUG) console.log("->", relFilePath);

  function watch(mapping) {
    // mapping.watch mapping.ignore mapping.task
    var patternsWatch = Array.isArray(mapping.watch) ? mapping.watch : [mapping.watch];
    var patternsIgnore = !mapping.ignore ? [] :
      Array.isArray(mapping.ignore) ? mapping.ignore : [mapping.ignore];

    // matches any watch => found=true
    var found = false, i, pattern;
    for (i = 0; i < patternsWatch.length; i++) {
      pattern = patternsWatch[i];
      if (minimatch(relFilePath, pattern)) {
        found = true;
        break;
      }
    }

    if (!found) return;

    // matches any ignore => found=false
    for (i = 0; i < patternsIgnore.length; i++) {
      pattern = patternsIgnore[i];

      if (minimatch(relFilePath, pattern)) {
        found = false;
        break;
      }
    }

    if (!found) return;

    pushTaskQueue(mapping.task);
  }

  this.taskMapping.forEach(watch);
}

// options.root - where to start watching
// options.taskMapping - regexp -> task mappings
module.exports = function(options) {

  return function(callback) {
    var dirs = options.dirs.map(function(dir) {
      return path.join(options.root, dir);
    });

    var watcher = chokidar.watch(dirs, {ignoreInitial: true});

    watcher.root = options.root;
    watcher.taskMapping = options.taskMapping;

    watcher.on('add', onModify);
    watcher.on('change', onModify);
    watcher.on('unlink', onModify);
    watcher.on('unlinkDir', onModify);
    watcher.on('addDir', onModify);
  };

};
