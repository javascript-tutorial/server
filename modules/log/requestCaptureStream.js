"use strict";

// Adapted and rewritten, from restify by Ilya Kantor
// initial Copyright 2012 Mark Cavage, Inc.  All rights reserved.
var Stream = require('stream').Stream;
var util = require('util');

var assert = require('assert-plus');
var bunyan = require('bunyan');
var LRU = require('lru-cache');
var os = require('os');

///--- API

/**
 * A Bunyan stream to capture records in a ring buffer and only pass through
 * on a higher-level record. E.g. buffer up all records but only dump when
 * getting a WARN or above.
 *
 * @param {Object} options contains the parameters:
 *      - {Object} stream The stream to which to write when dumping captured
 *        records. One of `stream` or `streams` must be specified.
 *      - {Array} streams One of `stream` or `streams` must be specified.
 *      - {Number|String} level The level at which to trigger dumping captured
 *        records. Defaults to bunyan.WARN.
 *      - {Number} maxRecords Number of records to capture. Default 100.
 *      - {Number} maxRequestIds Number of simultaneous request id capturing
 *        buckets to maintain. Default 1000.
 */
class RequestCaptureStream extends Stream {
  constructor(opts) {
    super();

    assert.object(opts, 'options');
    assert.optionalObject(opts.stream, 'options.stream');
    assert.optionalString(opts.level, 'options.level');
    assert.optionalNumber(opts.maxRecords, 'options.maxRecords');
    assert.optionalNumber(opts.maxRequestIds, 'options.maxRequestIds');

    this.level = opts.level ? bunyan.resolveLevel(opts.level) : bunyan.WARN;
    this.limit = opts.maxRecords || 100;
    this.maxRequestIds = opts.maxRequestIds || 1000;

    this.requestMap = LRU({
      max: this.maxRequestIds
    });

    this._offset = -1;
    this._rings = [];

    this.stream = opts.stream;
  }


  write(record) {
    // only request records
    if (!record.requestId) return;

    var reqId = record.requestId;
    var ring;
    var self = this;

    if (!(ring = this.requestMap.get(reqId))) {
      if (++this._offset > this.maxRequestIds)
        this._offset = 0;

      if (this._rings.length <= this._offset) {
        this._rings.push(new bunyan.RingBuffer({
          limit: self.limit
        }));
      }

      ring = this._rings[this._offset];
      ring.records.length = 0;
      this.requestMap.set(reqId, ring);
    }

    assert.ok(ring, 'no ring found');

    ring.write(record);

    if (record.level >= this.level && !(record.status && record.status < 500) ) {
      this.dump(ring);
    }
  }

  dump(ring) {

    var i, r;
    for (i = 0; i < ring.records.length; i++) {
      r = ring.records[i];
      this.stream.write(this.stream.raw ? r : JSON.stringify(r, bunyan.safeCycles()) + '\n');
    }
    ring.records.length = 0;

  }



}


module.exports = RequestCaptureStream;
