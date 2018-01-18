/**
 * Created by gy on 2018/1/17.
 */

import shopRouter from '../controllers/index';
import catalogRouter from '../controllers/catalog';
const router = require('koa-router')()

router
    .get('/api/index/index', shopRouter.indexAction)
    .post('/api/catalog/index', catalogRouter.indexAction)
    .post('/api/catalog/current', catalogRouter.currentAction)

module.exports = router