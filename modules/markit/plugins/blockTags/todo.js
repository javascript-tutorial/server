'use strict';

module.exports = function(md) {

  md.renderer.rules.blocktag_todo = function(tokens, idx, options, env, slf) {
    return '';
  };

};
