'use strict';

const should = require('should');
const MarkdownIt = require('markdown-it');

// compares removing spaces between tags
should.Assertion.add('html', function(str) {
  this.obj.should.be.a.String;
  str.should.be.a.String;
  this.obj.trim().replace(/>\s+</g, '><').should.equal(str.trim().replace(/>\s+</g, '><'));
}, false);


function makeMd(options) {

  const md = MarkdownIt({
    blockTags: ['iframe']
  });

  require('../plugins/outlinedBlocks')(md);
  require('../plugins/sourceBlocks')(md);
  require('../plugins/blockTags/plugin')(md);
  require('../plugins/blockTags/iframe')(md);

  return md;
}

function render(text) {

  const md = makeMd();

  return md.render(text);
}

function parse(text) {

  const md = makeMd();

  return md.parse(text);
}

describe('MarkIt', function() {


});

