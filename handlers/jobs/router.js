'use strict';

const Router = require('koa-router');
const jobsController = require('./controller/jobs');

const router = module.exports = new Router();

router.get('/jobs/', jobsController.list);
router.get('/jobs/new/', jobsController.form);
router.get('/jobs/terms/', jobsController.terms);
router.get('/jobs/:id/', jobsController.show);
router.post('/jobs/', jobsController.create);


