/**
 * Created by gy on 2018/1/17.
 */

import shopRouter from '../controllers/index';
import catalogRouter from '../controllers/catalog';
import goodsRouter from '../controllers/goods';
const router = require('koa-router')()

router
    .get('/api/index/index', shopRouter.indexAction)
    .get('/api/catalog/index', catalogRouter.indexAction)
    .get('/api/catalog/current', catalogRouter.currentAction)
    .get('/api/goods/detail', goodsRouter.detailAction)

module.exports = router