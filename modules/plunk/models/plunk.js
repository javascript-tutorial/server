var mongoose = require('mongoose');
var assert = require('assert');
var request = require('co-request');
var config = require('config');
var Schema = mongoose.Schema;
var _ = require('lodash');
var log = require('log')();
var zip = require('node-zip');

var schema = new Schema({
  description: {
    type:    String,
    default: ""
  },
  webPath:     {
    type:     String,
    unique:   true,
    required: true
  },
  plunkId:     {
    type:     String,
    required: true
  },
  files:       [{
    filename: String,
    content:  String
  }]
});

schema.methods.getUrl = function() {
  return 'http://plnkr.co/edit/' + this.plunkId + '?p=preview';
};

schema.methods.getZip = function() {
  var archive = new zip();

  for (var i = 0; i < this.files.length; i++) {
    var file = this.files[i];
    archive.file(file.filename, file.content);
  }

  var buffer = archive.generate({type: 'nodebuffer'});

  return buffer;
};

/**
 * Merges files into the current plunk
 * @param files
 * @returns {boolean} new files list to post w/ nulls where files are deleted
 */
schema.methods.mergeAndSyncRemote = function*(files) {

  var changes = {};

  log.debug("mergeAndSyncRemote " + this.plunkId);
  log.debug("OLD files", this.files);
  log.debug("NEW files", files);

  /* delete this.files which are absent in files */
  for (var i = 0; i < this.files.length; i++) {
    var file = this.files[i];
    if (!files[file.filename]) {
      this.files.splice(i--, 1);
      changes[file.filename] = null; // for submitting to plnkr
    }
  }

  for (var name in files) {
    var existingFile = null;
    for (var i = 0; i < this.files.length; i++) {
      var item = this.files[i];
      if (item.filename == name) {
        existingFile = item;
        break;
      }
    }
    if (existingFile) {
      if (existingFile.content == files[name].content) continue;
      existingFile.content = files[name].content;
    } else {
      this.files.push(files[name]);
    }
    delete files[name].filename;
    changes[name] = files[name];
  }

  log.debug("UPDATED files", this.files);

  if (_.isEmpty(changes)) {
    log.debug("no changes, skip updating");
    return;
  } else {
    log.debug("plunk " + this.plunkId + " changes", changes);
  }


  if (this.plunkId) {
    log.debug("update remotely", this.webPath, this.plunkId);
    yield* Plunk.updateRemote(this.plunkId, changes);
  } else {
    log.debug("create plunk remotely", this.webPath);
    this.plunkId = yield* Plunk.createRemote(this.description, this.files);
  }


  yield this.persist();

};

schema.statics.createRemote = function*(description, files) {

  if (process.env.PLUNK_REMOTE_OFF) {
    return Math.random().toString(36).slice(2);
  }

  var filesObj = {};
  files.forEach(function(file) {
    filesObj[file.filename] = {
      filename: file.filename,
      content:  file.content
    }; // no _id
  });

  var form = {
    description: description,
    tags:        [],
    files:       filesObj,
    private:     true
  };

  var data = {
    method:  'POST',
    headers: {'Content-Type': 'application/json;charset=utf-8'},
    json:    true,
    url:     "http://api.plnkr.co/plunks/?sessid=" + config.plnkrAuthId,
    body:    form
  };

  var result = yield Plunk.request(data);

  assert.equal(result.statusCode, 201);

  return result.body.id;

};

schema.statics.request = function*(data) {
  console.log(data);
  var result = yield request(data);

  if (result.statusCode == 404) {
    throw new Error("result status code 404, probably (plnkrAuthId is too old OR this plunk doesn't belong to plunk@javascript.ru (javascript-plunk) user)");
  }
  if (result.statusCode == 400) {
    throw new Error("invalid json, probably you don't need to stringify body (request will do it)");
  }

  return result;
};

schema.statics.updateRemote = function* (plunkId, changes) {


  if (process.env.PLUNK_REMOTE_OFF) {
    return;
  }

  var form = {
    files: changes
  };

  var result = yield Plunk.request({
    method:  'POST',
    headers: {'Content-Type': 'application/json'},
    json:    true,
    url:     "http://api.plnkr.co/plunks/" + plunkId + "?sessid=" + config.plnkrAuthId,
    body:    form
  });

  assert.equal(result.statusCode, 200);
};


var Plunk = module.exports = mongoose.model('Plunk', schema);


