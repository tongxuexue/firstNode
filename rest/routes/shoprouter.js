/**
 * Created by gy on 2018/1/17.
 */

import shopRouter from '../controllers/index';
import catalogRouter from '../controllers/catalog';
const router = require('koa-router')()

router
    .get('/index/index', shopRouter.indexAction)
    .post('/catalog/index', catalogRouter.indexAction)
    .post('/catalog/current', catalogRouter.currentAction)

module.exports = router