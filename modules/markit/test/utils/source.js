var extractHighlight = require('../../utils/source/extractHighlight');
var stripIndents = require('textUtil/stripIndents');

var fs = require('fs');
var path = require('path');

function readIn(name) {
  return fs.readFileSync(path.join(__dirname, 'source/in', name), 'utf-8');
}
function readOut(name) {
  return fs.readFileSync(path.join(__dirname, 'source/out', name), 'utf-8');
}

describe("source", function() {

  describe("stripIndents", function() {

    beforeEach(function() {
      this.currentTest.in = readIn(this.currentTest.title);
      this.currentTest.result = stripIndents(this.currentTest.in);
      this.currentTest.out = readOut(this.currentTest.title);
    });

    it("indented.txt", function() {
      this.test.result.should.be.eql(this.test.out);
    });
  });

  describe("extractHighlight", function() {

    beforeEach(function() {
      this.currentTest.in = readIn(this.currentTest.title);
      this.currentTest.result = extractHighlight(this.currentTest.in);
      this.currentTest.out = readOut(this.currentTest.title);
    });


    it("block-whole.txt", function() {
      this.test.result.inline.should.be.eql('');
      this.test.result.block.should.be.eql('0-1');
      this.test.result.text.should.be.eql(this.test.out);
    });

    it("block-one-line.txt", function() {
      this.test.result.inline.should.be.eql('');
      this.test.result.block.should.be.eql('0-0');
      this.test.result.text.should.be.eql(this.test.out);
    });

    it("single-line.txt", function() {
      this.test.result.inline.should.be.eql('');
      this.test.result.block.should.be.eql('1-1');
      this.test.result.text.should.be.eql(this.test.out);
    });

    it("blocks-two.txt", function() {
      this.test.result.inline.should.be.eql('');
      this.test.result.block.should.be.eql('1-2,4-4');
      this.test.result.text.should.be.eql(this.test.out);
    });


    it("inline.txt", function() {
      this.test.result.inline.should.be.eql('0:8-18');
      this.test.result.block.should.be.eql('');
      this.test.result.text.should.be.eql(this.test.out);
    });

    it("inline-multi.txt", function() {
      this.test.result.inline.should.be.eql('0:8-18,1:8-9,1:18-19');
      this.test.result.block.should.be.eql('');
      this.test.result.text.should.be.eql(this.test.out);
    });

    it("mixed.txt", function() {
      this.test.result.inline.should.be.eql('2:8-18,3:8-9');
      this.test.result.block.should.be.eql('2-4');
      this.test.result.text.should.be.eql(this.test.out);
    });


    it("big.txt", function() {
      this.test.result.inline.should.be.eql('9:26-37,10:13-26');
      this.test.result.block.should.be.eql('13-13,23-24');
      this.test.result.text.should.be.eql(this.test.out);
    });


  });

});
