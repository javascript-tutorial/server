const app = require('app');

const ArticleRenderer = require('../../renderer/articleRenderer');
const mongoose = require('lib/mongoose');
const Article = require('../../models/article');

describe("ArticleRenderer", function() {

  beforeEach(function* () {
    yield Article.destroy();
  });

  it("appends -2, -3... to header with same title", function* () {

    const article = new Article({
      title:   "Title",
      slug:    "test",
      githubLink: 'http://not.exists.com',
      content: "## Title\n\n## Title\n\n"
    });
    const renderer = new ArticleRenderer();

    const result = yield renderer.render(article);
    result.content.replace(/\n/g, '').should.be.eql(
      '<h2><a class="main__anchor" name="title" href="#title">Title</a></h2><h2><a class="main__anchor" name="title-2" href="#title-2">Title</a></h2>'
    );

  });

});
