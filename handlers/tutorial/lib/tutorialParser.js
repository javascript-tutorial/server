'use strict';

/**
 * Tutorial ArticleRenderer uses markit
 * Markit should not use tutorial not to introduce circular dep
 * So we put tutorial-specific staff here
 * If in the future it becomes non-tutorial-specific, then refactor
 */
const resolveTutorialLinks = require('./resolveTutorialLinks');
const ServerParser = require('markit').ServerParser;

module.exports = class TutorialParser extends ServerParser {

  *parse(text) {
    const tokens = yield* super.parse(text);
    yield* resolveTutorialLinks(tokens, this.md.options);
    return tokens;
  }

};
