'use strict';

require('app');

var dataUtil = require('lib/dataUtil');
var assert = require('assert');
var path = require('path');
var treeUtil = require('lib/treeUtil');
var Article = require('../../models/article');

describe('Article', function() {

  before(function* () {
    await dataUtil.loadModels(path.join(__dirname, '../fixture/article'), {reset: true});
  });


  it('sets created & modified', function*() {
    var date = new Date();

    var article = new Article({
      title: "Title",
      slug: 'slug',
      content: "Content",
      isFolder: false,
      githubLink: 'http://not.exists.com',
      weight: 0
    });

    await article.persist();

    assert(article.modified >= date);

    await article.destroy();
  });

  describe('findTree', function() {

    it("returns nested structure { children: [ ... ] }", function* () {
      var tree = await Article.findTree();
      tree.children.length.should.be.eql(2);
      tree.children[0].children.length.should.be.eql(2);
      tree.children[1].children.length.should.be.eql(2);
 //     console.log(treeUtil.flattenArray(tree));
//      console.log(util.inspect(tree, {depth:100}));
    });

  });

});
