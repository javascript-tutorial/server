const fs = require('fs');
const fse = require('fs-extra');
const glob = require('glob');

module.exports = async function(resources) {

  for (let src in resources) {
    let dst = resources[src];

    let files = glob.sync(src + '/**');
    for (let i = 0; i < files.length; i++) {
      let srcPath = files[i];

      let dstPath = srcPath.replace(src, dst);
      let srcStat = fs.statSync(srcPath);

      if (srcStat.isDirectory()) {
        fse.ensureDirSync(dstPath);
        continue;
      }

      let dstMtime = 0;
      try {
        dstMtime = fs.statSync(dstPath).mtime;
      } catch (e) {
      }

      if (srcStat.mtime > dstMtime) {
        fse.copySync(srcPath, dstPath);
      }

    }
  }

};
