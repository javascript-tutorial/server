/**
 * Copy local collections to remove mongo without drop
 * (drop breaks elastic)
 */

var co = require('co');
var fs = require('fs');
var path = require('path');
var log = require('log')();
var del = require('del');
var gutil = require('gulp-util');
var execSync = require('child_process').execSync;
var config = require('config');

var ecosystem = require(path.join(config.projectRoot, 'ecosystem.json'));

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Path to host is required.")
      .demand(['host'])
      .argv;

    var collections = ['tasks', 'plunks', 'articles', 'references'];

    var host = args.host;

    var db = config.lang == 'ru' ? 'js' : 'js_en';

    return co(function* () {

      exec(`rsync -crlDvtz -e ssh --delete-after ${config.publicRoot}/task ${config.publicRoot}/article ${host}:${config.publicRoot}/`);


      del.sync('dump');


      exec('mkdir dump');

      /*
      monngoexport/import instead of mongodump => for better debug
      collections.forEach(function(coll) {
        exec('mongoexport --out dump/'+coll+'.json -d js -c ' + coll);
      });

      exec('ssh ' + args.host + ' "rm -rf dump"');
      exec('scp -r -C dump ' + host + ':');

      collections.forEach(function(coll) {
        exec('ssh ' + host + ' "mongoimport --db js_sync --drop --file dump/'+coll+'.json"');
      });*/
      collections.forEach(function(coll) {
        exec('mongodump -d ' + db + ' -c ' + coll);
      });
      exec('mv dump/' + db + ' dump/js_sync');

      exec('ssh ' + args.host + ' "rm -rf dump"');
      exec('scp -r -C dump ' + host + ':');

      exec('ssh ' + host + ' "mongorestore --drop"');



      var file = fs.openSync("/tmp/cmd.js", "w");

      fs.writeFileSync("/tmp/check.sh", 'mongo ' + db + ' --eval "db.articles.find().length()";\n');

      // copy/overwrite collections from js_sync to js and then remove non-existing ids
      // without destroy! (elasticsearch river breaks)
      fs.writeSync(file, collections.map(function(coll) {
        // copyTo does not work
        // also see https://jira.mongodb.org/browse/SERVER-732

        // remove non-existing articles
        // insert (replace) synced ones
        var cmd = `
        db.COLL.find({}, {id:1}).forEach(function(d) {
          var cursor = db.getSiblingDB('js_sync').COLL.find({_id:d._id}, {id:1});

          if (!cursor.hasNext()) {
            db.COLL.remove({_id: d._id});
          }
        });

        db.getSiblingDB('js_sync').COLL.find().forEach(function(d) { db.COLL.update({_id:d._id}, d, { upsert: true}) });
        `.replace(/COLL/g, coll);
        // db.getSiblingDB('js_sync').COLL.find().forEach(function(d) { print(db.COLL.update({_id:d._id}, d, { upsert: true})  ) });


        return cmd;

      }).join("\n\n"));


      fs.closeSync(file);

      exec('scp /tmp/cmd.js ' + host + ':/tmp/');
      exec('scp /tmp/check.sh ' + host + ':/tmp/');

      exec('ssh ' + host + ' "bash /tmp/check.sh"');
      exec('ssh ' + host + ' "mongo ' + db + ' /tmp/cmd.js"');
      exec('ssh ' + host + ' "bash /tmp/check.sh"');

      /* jshint -W106 */
      var env = ecosystem.apps[0]['env_' + args.host];

      exec(`ssh ${host} "cd ${config.projectRoot} && SITE_HOST=${env.SITE_HOST} STATIC_HOST=${env.STATIC_HOST} gulp tutorial:cacheRegenerate && gulp cache:clean"`);
    });
  };
};

function exec(cmd) {
  gutil.log(cmd);
  execSync(cmd, {stdio: 'inherit'});
}

/*
 #!/bin/bash


 rm -rf dump &&
 mongodump -d js -c tasks &&
 mongodump -d js -c plunks &&
 mongodump -d js -c articles &&
 mongodump -d js -c references &&
 ssh nightly 'rm -rf dump' &&
 scp -r -C dump nightly: &&
 ssh nightly 'mongorestore --drop ' &&
 rsync -rlDv /js/javascript-nodejs/public/ nightly:/js/javascript-nodejs/public/ &&
 ssh nightly 'cd /js/javascript-nodejs/current/scripts/elastic; bash db' &&
 echo "Tutorial updated"


 db.getSiblingDB('js_sync').articles.copyTo(db.articles)
 vals = db.getSiblingDB('js_sync').articles.find({}, {id:1}).map(function(a){return a._id;})
 db.articles.remove({_id: {$nin: vals}})
*/
