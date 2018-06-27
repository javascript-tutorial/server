'use strict';

/**
 * tokenAttrReplace(name, value)
 *
 * Replace all attributes with name `name` with one with the value `attrData`
 **/
function attrReplace(token, name, value) {
  let found;

  let attrs = token.attrs;

  if (attrs) {
    // modify the existing attr is possible
    for (let i = 0; i < attrs.length; i++) {
      if (attrs[i][0] === name) {
        if (!found) {
          attrs[i][1] = value;
          found = true;
        } else {
          // remove extra attrs with same name
          attrs.splice(i, 1);
          i--;
        }
      }
    }

    // add a new attribute with such name if none was found
    if (!found) {
      attrs.push([name, value]);
    }
  } else {
    token.attrs = [ [name, value] ];
  }
}

function addClass(token, value) {
  let classAttr = attrGet(token, 'class');
  if (classAttr.match(new RegExp(`\b${value}\b`))) return;

  if (classAttr) {
    classAttr += ' ' + value;
  } else {
    classAttr = value;
  }
  attrReplace(token, 'class', classAttr);
}

function attrGet(token, name) {
  let idx = token.attrIndex(name);
  if (idx == -1) return null;
  return token.attrs[idx][1];
}

function attrDel(token, name) {
  let idx = token.attrIndex(name);
  if (idx == -1) return null;
  token.attrs.splice(idx, 1);
}

exports.attrReplace = attrReplace;

exports.attrGet = attrGet;
exports.attrDel = attrDel;
exports.addClass = addClass;

