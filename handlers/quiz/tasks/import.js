var co = require('co');
var fs = require('fs');
var path = require('path');
var log = require('log')();
var gutil = require('gulp-util');
var glob = require('glob');
var QuizImporter = require('../quizImporter');
var Quiz = require('../models/quiz');

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Path to quiz root is required.")
      .demand(['root'])
      .argv;

    var root = fs.realpathSync(args.root);

    return co(function* () {

      var files = glob.sync(path.join(root, '*.yml'));

      if (args.reset) {
        yield Quiz.destroy({});
      }

      for (var i = 0; i < files.length; i++) {
        var yml = files[i];
        if (path.basename(yml)[0] == '_') {
          gutil.log("Skip unfinished " + yml);
          continue;
        }

        gutil.log("Importing " + yml);

        var importer = new QuizImporter({
          yml: yml
        });


        yield* importer.import();
      }

      log.info("DONE");

    });
  };
};


