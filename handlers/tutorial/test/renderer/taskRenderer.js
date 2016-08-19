'use strict';

const app = require('app');

const TaskRenderer = require('../../renderer/taskRenderer');
const mongoose = require('lib/mongoose');
const Task = require('../../models/task');
const Plunk = require('plunk').Plunk;

describe("TaskRenderer", function() {

  beforeEach(function* () {
    yield Task.destroy();
  });

  it("renderContent", function* () {

    const task = new Task({
      "content":    "Content",
      "slug":       "unique-slug-no-plunk-link-add",
      "title":      "Title",
      "importance": 4,
      "solution":   "..."
    });

    const renderer = new TaskRenderer();

    const result = yield renderer.renderContent(task, {});

    result.replace(/\n/g, '').should.be.eql('<p>Content</p>');
  });


  it("renderSolution", function* () {

    const task = new Task({
      "content":    "# Title\n\nContent",
      "slug":       "unique-slug-no-plunk-link-add",
      "title":      "Title",
      "importance": 4,
      "solution":   "# Part 1\n\nContent 1\n\n# Part 2\n\nContent 2"
    });
    const renderer = new TaskRenderer();

    const result = yield renderer.renderSolution(task, {});

    result.should.be.eql([{title: 'Part 1', content: '<p>Content 1</p>\n'},
      {title: 'Part 2', content: '<p>Content 2</p>\n'}]);

  });
});
