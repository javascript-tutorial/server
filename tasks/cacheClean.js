const gulp = require('gulp');

const CacheEntry = require('cache').CacheEntry;

module.exports = function() {

  return function(callback) {
    CacheEntry.remove(callback);
  };

};

