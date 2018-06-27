'use strict';

require('app');

let dataUtil = require('lib/dataUtil');
let assert = require('assert');
let path = require('path');
let treeUtil = require('lib/treeUtil');
let Article = require('../../models/article');

describe('Article', function() {

  before(function* () {
    await dataUtil.loadModels(path.join(__dirname, '../fixture/article'), {reset: true});
  });


  it('sets created & modified', function*() {
    let date = new Date();

    let article = new Article({
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
      let tree = await Article.findTree();
      tree.children.length.should.be.eql(2);
      tree.children[0].children.length.should.be.eql(2);
      tree.children[1].children.length.should.be.eql(2);
 //     console.log(treeUtil.flattenArray(tree));
//      console.log(util.inspect(tree, {depth:100}));
    });

  });

});
