
let Router = require('koa-router');

let frontpage = require('./controller/frontpage');

let router = module.exports = new Router();

router.get('/', frontpage.get);
