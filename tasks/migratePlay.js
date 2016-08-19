var fs = require('fs');
var fse = require('fs-extra');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var projectRoot = require('config').projectRoot;
var mysql = require('mysql');
var zip = require('node-zip');


module.exports = function() {
  return function() {

    return co(function*() {

      var connection = mysql.createConnection({
        host:     'localhost',
        user:     'root',
        database: 'js'
      });

      connection.connect();

      var plays = yield function(callback) {
        connection.query('SELECT * FROM play_save', function(err, rows, fields) {
          callback(err, rows);
        });
      };

      plays = plays.map(function(play) {
        try {
          play.content = JSON.parse(play.content);
        } catch(e) {
          console.log("BAD CONTENT", play.name, e.message);
          // probably content over 64K
          return null;
        }
        return {
          id:      play.id,
          name:    play.name,
          url:     'http://learn.javascript.ru/play/' + play.name,
          content: play.content
        };
      }).filter(Boolean);

      for (var i = 0; i < plays.length; i++) {
        var play = plays[i];
        var file;
        try {
          file = yield* exportPlay(connection, play);
        } catch(e) {
          if (e.code == 'ENOENT') {
            console.log("ENOENT", play.name);
            // no such file
            continue;
          } else {
            throw e;
          }
        }
        console.log("done", play.name);
        var dir = `/js/play/${play.name.slice(0,2).toLowerCase()}/${play.name.slice(2,4).toLowerCase()}`;
        fse.ensureDirSync(dir);
        fs.writeFileSync(`${dir}/${play.name}.zip`, file, 'binary');
      }

      connection.end();

    });

  };
};


function* exportPlay(db, play) {


  var resources = yield function(callback) {
    db.query(`
      SELECT play_id,resource_id,name,fs_name,created
      FROM play_save_resources psr, play_resources pr
      WHERE psr.resource_id=pr.id AND play_id=?
      ORDER BY created desc`, [play.id], function(err, rows, fields) {
      callback(err, rows);
    });
  };


  play.content.files = resources;

  var archive = new zip();

  for (var i = 0; i < play.content.tabs.length; i++) {
    var tab = play.content.tabs[i];
    archive.file(tab.name, tab.content);
  }

  for (var i = 0; i < play.content.files.length; i++) {
    var file = play.content.files[i];
    var filepath = `/var/site/js/www/files/play/${file.fs_name.slice(0, 2)}/${file.fs_name.slice(2, 4)}/${file.fs_name}`;
    archive.file(file.name, fs.readFileSync(filepath));
  }

  return archive.generate({base64: false, compression: 'DEFLATE'});


}
