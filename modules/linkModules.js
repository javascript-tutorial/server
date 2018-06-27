/**
 * This module does not have any other module dependencies,
 * because even require('log') requires "log" to be linked in.
 * @type {exports}
 */
let fs = require('fs');
let glob = require('glob');
let path = require('path');

let DEBUG = false;

// Ensures the existance of a symlink linkDst -> linkSrc
// returns true if link was created
// returns false if link exists alread (and is correct)
// throws error if conflict (another file or link by that name)
function createSymlinkSync(linkSrc, linkDst) {
  let lstatDst;
  // check same-named link
  try {
    lstatDst = fs.lstatSync(linkDst);
  } catch (e) {
  }

  if (lstatDst) {
    if (!lstatDst.isSymbolicLink()) {
      throw new Error("Conflict: path exist and is not a link: " + linkDst);
    }

    let oldDst = fs.readlinkSync(linkDst);
    if (oldDst == linkSrc) {
      return false; // already exists and is correct
    }

    // kill old link!
    fs.unlinkSync(linkDst);
  }

  // check same file/dir module
  // if src is "module.js", check "module/"
  // if src is "module/", check module.js

  let conflictingName;
  let conflictingNameLstat;
  try {
    conflictingName = linkDst.endsWith('.js') ? linkDst.slice(0, -3) : (linkDst + '.js');
    conflictingNameLstat = fs.lstatSync(conflictingName);
  } catch(e) {
  }

  if (conflictingNameLstat) {
    throw new Error("Conflict: path exist: " + conflictingName);
  }

  fs.symlinkSync(linkSrc, linkDst);
  return true;
}

module.exports = function(options) {
  let modules = [];
  options.src.forEach(function(pattern) {
    modules = modules.concat(glob.sync(pattern));
  });

  for (let i = 0; i < modules.length; i++) {
    let moduleToLinkRelPath = modules[i];  // hmvc/auth
    let moduleToLinkName = path.basename(moduleToLinkRelPath); // auth
    let linkSrc = path.join('..', moduleToLinkRelPath);
    let linkDst = path.join('node_modules', moduleToLinkName);

    if (createSymlinkSync(linkSrc, linkDst)) {
      if (DEBUG) console.log(linkSrc + " -> " + linkDst);
    }
  }

};
