let Router = require('koa-router');

let router = module.exports = new Router();

router.get('/', async function(ctx) {
  ctx.body = ctx.render('index');
});

router.get('/die', async function(ctx) {
  setTimeout(function() {
    throw new Error("die");
  }, 10);
});

router.get('/test', async function(ctx) {
  ctx.body = Math.round(Date.now() / 1000 / 60);
});

