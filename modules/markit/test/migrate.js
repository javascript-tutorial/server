'use strict';

let migrate = require('../migrate');

describe("Migrate", function() {

  it('edit', function() {
    migrate('[edit src="solution"]Полный код решения[/edit]').text.trim().should.eql(
      '[edit src="solution" title="Полный код решения"]'
    );

    migrate('[edit src="solution"/]').text.trim().should.eql(
      '[edit src="solution"]'
    );
  });

  it('links', function() {

    migrate('[http://quirksmode.org/]()').text.should.eql(
      '<http://quirksmode.org/>'
    );

    migrate('[](/article/path)').text.should.eql(
      '<info:article/path>'
    );

  });

  it('images', function() {
    let text = migrate(`<img src="a.png" style="vertical-align:middle">
\`\`\`html
<img src="incode.png">
\`\`\`
<img style="vertical-align:middle" src="b.png">`).text;
    text.should.be.eql(`![|style="vertical-align:middle"](a.png)
\`\`\`html
<img src="incode.png">
\`\`\`

![|style="vertical-align:middle"](b.png)`);
  });

  it('demo', function() {
    migrate(`[demo src="index.html"/] [demo /] [demo]`).text.trim().should.be.eql('[demo src="index.html"] [demo] [demo]');
  });

  it('[importance 5]', function() {
    migrate(`# Title\n[importance 5]\ntext`).text.should.be.eql('importance: 5\n\n---\n\n# Title\ntext');
  });

  it('[libs]', function() {
    migrate(`В следующих главах мы познакомимся с DOM более плотно.
[libs]
d3
domtree
[/libs]`).text.should.be.eql(`libs:
  - d3
  - domtree

---

В следующих главах мы познакомимся с DOM более плотно.
`);

  });

  it('[head]', function() {
    let result = migrate(`В следующих главах мы познакомимся с DOM более плотно.
[head]
...
[/head]`);

    result.text.should.be.eql('В следующих главах мы познакомимся с DOM более плотно.\n');
    result.head.should.be.eql('...');
  });

  it('code src', function() {
    migrate('```html\n<!--+ src="index.html" -->\n```').text.trim().should.be.eql('[html src="index.html"]')
  });

  it('code', function() {
    migrate('```js\n//+ run\na = 5\n```').text.should.be.eql('```js run\na = 5\n```');
  });

});
