'use strict';

const Plunk = require('plunk').Plunk;

exports.get = function*() {
  var plunk = yield Plunk.findOne({ plunkId: this.query.plunkId });

  if (!plunk) {
    this.throw(404);
  }

  this.set('Content-Type', 'application/zip');
  this.body = plunk.getZip();

};