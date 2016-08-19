'use strict';

// 'my=5 test=3 bla="my "test"'  -> my=5 test=3 bla="my "  (test is not matched)
const attrsReg = /([\w-]+)(?:=(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)"|(\S+))|(?:\s|$))/g;

module.exports = function(attrs, withBlockName) {
  const attrsObject = {};

  if (!attrs) {
    return attrsObject;
  }

  let blockName;
  if (withBlockName) {
    blockName = attrs.match(/^\w+/);
    blockName = blockName && blockName[0];
    attrs = attrs.replace(/^\w+\s+/, '');
  }

  let match, name, value;
  while ((match = attrsReg.exec(attrs)) !== null) {
    name = match[1];
    value = match[2] !== undefined ? match[2].replace(/\\'/g, "'") :
      match[3] !== undefined ? match[3].replace(/\\"/g, '"') : match[4];

    attrsObject[name.toLowerCase()] = (value === undefined) ? true : value;
  }

  if (blockName) {
    attrsObject.blockName = blockName;
  }

  return attrsObject;
};
