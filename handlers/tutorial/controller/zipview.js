'use strict';

const Plunk = require('plunk').Plunk;
const mongoose = require('mongoose');

exports.get = function*() {
  var plunk = yield Plunk.findOne({ plunkId: this.query.plunkId }).exec();

  if (!plunk) {
    this.throw(404);
  }

  this.set('Content-Type', 'application/zip');
  this.body = plunk.getZip();

};