'use strict';

const parseAttrs = require('../../utils/parseAttrs');

describe('parseAttrs', function() {

  it(`bare my=value test="quoted value" me='single quoted value'`, function() {
    let result = parseAttrs(this.test.title);
    result.should.be.eql({bare: true, my: 'value', test: 'quoted value', me: 'single quoted value'});
  });

  it(`multiple bare attrs`, function() {
    let result = parseAttrs(this.test.title);
    result.should.be.eql({multiple: true, bare: true, attrs: true});
  });

  it(`str='single quote \\' inside'`, function() {
    let result = parseAttrs(this.test.title);
    result.should.be.eql({ str: "single quote ' inside" });
  });

  it(`str="double quote \\" inside"`, function() {
    let result = parseAttrs(this.test.title);
    result.should.be.eql({ str: 'double quote " inside' });
  });

});

