'use strict';

var co = require('co');
var fs = require('fs');
var path = require('path');
var log = require('log')();
var glob = require('glob');
var beautify = require('js-beautify');
var readlineSync = require('readline-sync');

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Path to tutorial root is required.")
      .demand(['root'])
      .argv;

    var root = fs.realpathSync(args.root);

    var options = {
      indent_size: 2,
      selector_separator_newline: true,
      newline_between_rules: true,
      preserve_newlines: true
      //space_in_paren: true
    };
    return co(function* () {

      var jsFiles = glob.sync( path.join( root, '**', '*.js' ) );

      for (var i = 0; i < jsFiles.length; i++) {
        var jsFile = jsFiles[i];
        var content = fs.readFileSync(jsFile, 'utf8');

        fs.writeFileSync(jsFile, beautify.js(content, options), 'utf8');
      }

      var cssFiles = glob.sync(path.join(root, '**', '*.css'));

      for (var i = 0; i < cssFiles.length; i++) {
        var cssFile = cssFiles[i];
        var content = fs.readFileSync(cssFile, 'utf8');
        fs.writeFileSync(cssFile, beautify.css(content, options), 'utf8');
      }


      var htmlFiles = glob.sync(path.join(root, '**', '*.html'));

      for (var i = 0; i < htmlFiles.length; i++) {
        var htmlFile = htmlFiles[i];
        var content = fs.readFileSync(htmlFile, 'utf8');
        fs.writeFileSync(htmlFile, beautify.html(content, options), 'utf8');
      }

      var mdFiles = glob.sync(path.join(root, '**', '*.md'));

      for (var i = 0; i < mdFiles.length; i++) {
        var mdFile = mdFiles[i];
        var content = fs.readFileSync(mdFile, 'utf8');
        console.log(mdFile);
        fs.writeFileSync(mdFile, beautifyMd(content, mdFile, options), 'utf8');
      }


    });
  };
};

function beautifyMd(content, mdFile, options) {

  var contentNew;

  contentNew = content.replace(/```(js|html|css)\n([\s\S]*?)\n```/gim, function(match, lang, code) {
    var codeOpts = code.match(/^\/\/\+.*\n/) || code.match(/^<!--\+.*\n/) || code.match(/^\/\*\+.*\n/);
    if (!codeOpts) codeOpts = ''; // for str methods to work

    var codeNoOpts;

    if (codeOpts) {
      codeOpts = codeOpts[0];
      codeNoOpts = code.replace(codeOpts, '');
    } else {
      codeNoOpts = code;
    }
    // skip the code which doesn't need beautification
    if (~codeOpts.indexOf('no-beautify')) return match;

    // contains *!*...*/!*, will be beautified incorrectly
    if (codeNoOpts.match(/\*!\*.*\*\/!\*/)) {
      console.log("SKIP INLINE MARKUP " + mdFile);
      return match;
    }

    var beautified = codeNoOpts;
    beautified = beautified.replace(/^[ \t]*\*!\*/gim, lang == 'html' ? '<!--*!*-->' : '/**!**/');
    beautified = beautified.replace(/^[ \t]*\*\/!\*/gim, lang == 'html' ? '<!--*/!*-->' : '/**-!**/');

    //console.log(beautified);
    beautified = beautify[lang](beautified, options);

    //console.log(beautified);
    beautified = beautified.replace(/^[ \t]*<!--\*!\*-->/gim, '*!*');
    beautified = beautified.replace(/^[ \t]*<!--\*\/!\*-->/gim, '*/!*');
    beautified = beautified.replace(/^[ \t]*\/\*\*!\*\*\//gim, '*!*');
    beautified = beautified.replace(/^[ \t]*\/\*\*-!\*\*\//gim, '*/!*');

    beautified = beautified.replace(/alert\((\S.*?)\);/gim, 'alert( $1 );');

    if (beautified === codeNoOpts) {
      return match; // nothing changed (already beautified?), skip
    }

    // clear console
    process.stdout.write('\u001B[2J\u001B[0;0f');
    console.log("\n" + mdFile);
    console.log("=======================================================\n");
    console.log(codeNoOpts);
    console.log("-------------------------------------------------------");
    console.log(beautified);

    var keep = readlineSync.question('Beautify [y]?');

    var result;
    if (keep == 'y' || keep === '') {
      result = codeOpts + beautified;
    } else {
      var codeOptsNoBeautify = codeOpts.slice(0, 2) == '//' ? codeOpts.replace("\n", " no-beautify\n") :
        codeOpts.slice(0, 2) == '/*' ? codeOpts.replace("*/", " no-beautify */") :
          codeOpts.slice(0, 2) == '<!' ? codeOpts.replace("-->", " no-beautify -->") :
            lang == 'html' ? '<!--+ no-beautify -->\n' :
            lang == 'css' ? '/*+ no-beautify */\n' :
            '//+ no-beautify\n';

      result = codeOptsNoBeautify + codeNoOpts;
    }

    result = "```" + lang + "\n" + result + "\n```";
    return result;
  });



  return contentNew;

}

