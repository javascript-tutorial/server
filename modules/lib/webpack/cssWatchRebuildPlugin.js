const fs = require('fs');
const Minimatch = require("minimatch").Minimatch;
const config = require('config');
const glob = require('glob');
const chokidar = require('chokidar');

class CssWatchRebuildPlugin {
  constructor(roots) {
    this.roots = roots;
  }

  apply(compiler) {
    compiler.hooks.afterEnvironment.tap("CssWatchRebuildPlugin", () => {

      compiler.watchFileSystem = new CssWatchFS(
        compiler.watchFileSystem,
        this.roots
      );
    });
  }
}

module.exports = CssWatchRebuildPlugin;

class CssWatchFS {
  constructor(wfs, roots) {
    this.wfs = wfs;
    this.roots = roots;

    this.rebuildAll();

    for(let name in this.roots) {
      chokidar.watch(`${this.roots[name]}/**/*.styl`, {ignoreInitial: true}).on('add', file => {
        console.log("CHOKIDAR ADD");
        this.rebuildRoot(name);
      })/*.on('unlink', file =>  {
        console.log("CHOKIDAR UNNLINK");
        this.rebuildRoot(name);
      })*/
    }

  }

  rebuildAll() {
    for (let name in this.roots) {
      this.rebuildRoot(name);
    }
  }

  rebuildRoot(name) {

    let styles = glob.sync(`${this.roots[name]}/**/*.styl`, {cwd: config.projectRoot});

    config.handlers.forEach(handler => {
      let handlerStyles = glob.sync(`handlers/${handler}/client/styles/**/*.styl`, {cwd: config.projectRoot});
      styles.push(...handlerStyles);
    });

    let content = styles.map(s => `@require '../${s}'`).join("\n");

    fs.writeFileSync(`${config.tmpRoot}/${name}.styl`, content);

    this.wfs.inputFileSystem.purge(`${config.tmpRoot}/${name}.styl`);

   // console.log("REBUILD", name);
  }

  // rebuild batch for deleted .styl
  watch(files, dirs, missing, startTime, options, callback, callbackUndelayed) {
    const watcher = this.wfs.watch(files, dirs, missing, startTime, options,
      (
        err,
        filesModified,
        dirsModified,
        missingModified,
        fileTimestamps,
        dirTimestamps
      ) => {
        //console.log(fileTimestamps);
        if (err) return callback(err);

        // console.log("Modified",  filesModified, fs.existsSync(filesModified[0]));
        for(let fileModified of filesModified) {
          // deleted style
          if (!fs.existsSync(fileModified)) {
            for(let name in this.roots) {

              var mm = new Minimatch(`${this.roots[name]}/**/*.styl`);
              let fn = fileModified.slice(config.projectRoot.length + 1);
              //console.log("CHECK", fn);

              if (mm.match(fn))  {
                this.rebuildRoot(name);
                fileTimestamps.set(`${config.tmpRoot}/${name}.styl`, Date.now());
              }

            }
          }
        }

        callback(
          err,
          filesModified,
          dirsModified,
          missingModified,
          fileTimestamps,
          dirTimestamps
        );
      },
      callbackUndelayed
    );

    return {
      close: () => watcher.close(),
      pause: () => watcher.pause(),
      getContextTimestamps: () => watcher.getContextTimestamps(),
      getFileTimestamps: () => watcher.getFileTimestamps()
    };
  }
}
