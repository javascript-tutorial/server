'use strict';

/**
 * Single:
  <div class="balance balance_single">   compare_single_open
    <div class="balance__pluses">  bullet_list_open -> compare_single_list_plus_open
      <div class="balance__content">
        <ul class="balance__list">
          <li>...</li> add class to every li
          <li>...</li>
        </ul>
      </div>
   </div>  compare_list_plus_close
  </div> compare_close

  Double:
  <div class="balance">  compare_double_open
    <div class="balance__pluses">  bullet_list_open ->compare_double_list_plus_open
      <div class="balance__content">
        <ul class="balance__list">
          <div class="balance__title">Достоинства</div>
          <li>...</li>
          <li>...</li>
        </ul>
      </div>
    </div>
    <div class="balance__minuses">  bullet_list_open -> compare_double_list_plus_open
      <div class="balance__content">
        <ul class="balance__list">
          <div class="balance__title">Недостатки</div>
          <li>...</li>  add class to every li
          <li>...</li>
        </ul>
      </div>
    </div> compare_list_minus_close
  </div>
 */

const parseAttrs = require('../utils/parseAttrs');
const t = require('i18n');
const markdownItContainer = require('markdown-it-container');

const LANG = require('config').lang;

t.requirePhrase('markit.compare', require('../locales/compare/' + LANG + '.yml'));

module.exports = function(md) {

  md.use(markdownItContainer, 'compare', {
    marker: '`'
  });


  // rewrite lists inside compare to compare_list_plus_open/close
  md.core.ruler.push('rewrite_compare_list', function rewriteCompareList(state) {

    let tokens = state.tokens;
    for (let idx = 0; idx < tokens.length; idx++) {

      if (tokens[idx].type != 'container_compare_open') continue;

      let listCount = 0;
      let i;
      for (i = idx + 1; i < tokens.length; i++) {
        if (tokens[i].type == 'bullet_list_open') listCount++;
        if (tokens[i].type == 'container_compare_close') break;
      }

      if (listCount != 1 && listCount != 2) {
        // do nothing if not a list, rewind the loop forward to close
        idx = i;
        continue;
      }

      let subType = listCount == 2 ? 'double' : 'single';

      tokens[idx].type = `compare_${subType}_open`;

      while (tokens[idx].type != 'container_compare_close') {
        if (tokens[idx].type == 'bullet_list_open') {
          if (tokens[idx].markup == '+') {
            tokens[idx].type = `compare_${subType}_list_plus_open`;
          } else {
            tokens[idx].type = `compare_${subType}_list_minus_open`;
          }
        }

        if (tokens[idx].type == 'bullet_list_close') {
          if (tokens[idx].markup == '+') {
            tokens[idx].type = `compare_${subType}_list_plus_close`;
          } else {
            tokens[idx].type = `compare_${subType}_list_minus_close`;
          }
        }

        idx++;
      }

      tokens[idx].type = `compare_${subType}_close`;

    }

  });


  // Single

  md.renderer.rules.compare_single_open = function(tokens, idx, options, env, slf) {
    return '<div class="balance balance_single">';
  };

  md.renderer.rules.compare_single_close = function() {
    return '</div>';
  };

  md.renderer.rules.compare_single_list_plus_open = function(tokens, idx, options, env, slf) {
    return '<div class="balance__pluses"><div class="balance__content"><ul class="balance__list">';
  };

  md.renderer.rules.compare_single_list_plus_close = function(tokens, idx, options, env, slf) {
    return '</ul></div></div>';
  };

  md.renderer.rules.compare_single_list_minus_open = function(tokens, idx, options, env, slf) {
    return '<div class="balance__minuses"><div class="balance__content"><ul class="balance__list">';
  };

  md.renderer.rules.compare_single_list_minus_close = function(tokens, idx, options, env, slf) {
    return '</ul></div></div>';
  };

  // Double


  md.renderer.rules.compare_double_open = function(tokens, idx, options, env, slf) {
    return '<div class="balance">';
  };

  md.renderer.rules.compare_double_close = function() {
    return '</div>';
  };

  md.renderer.rules.compare_double_list_plus_open = function(tokens, idx, options, env, slf) {
    return `<div class="balance__pluses">
      <div class="balance__content">
      <div class="balance__title">${t('markit.compare.merits')}</div><ul class="balance__list">`;
  };

  md.renderer.rules.compare_double_list_plus_close = function(tokens, idx, options, env, slf) {
    return '</ul></div></div>';
  };

  md.renderer.rules.compare_double_list_minus_open = function(tokens, idx, options, env, slf) {
    return `<div class="balance__minuses">
      <div class="balance__content">
      <div class="balance__title">${t('markit.compare.demerits')}</div><ul class="balance__list">`;
  };

  md.renderer.rules.compare_double_list_minus_close = function(tokens, idx, options, env, slf) {
    return '</ul></div></div>';
  };
};
