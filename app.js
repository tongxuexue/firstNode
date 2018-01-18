const Koa = require('koa')
const app = new Koa()
const router = require('koa-router')();
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

var session = require('koa-session-minimal');
var mysqlstore = require('koa-mysql-session');
var config = require('./config/common');

const dbConfig = config[process.env.NODE_ENV||'development'];
const {shopRouter} = require('./rest/index');

// error handler
onerror(app)

// session存储配置
const sessionMysqlConfig = {
    user: dbConfig.database.USERNAME,
    password: dbConfig.database.PASSWORD,
    database: dbConfig.database.DATABASE,
    host: dbConfig.database.HOST,
}


// middlewares
// 配置session中间件
app.use(session({
    key: 'USER_SID',
    store: new mysqlstore(sessionMysqlConfig)
}))

app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
    extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(require('./rest/middlewares/response'));
app.use(require('./rest/middlewares/filter'));
app.use(shopRouter.routes(), shopRouter.allowedMethods())


// response
app.on('error', function(err, ctx){
    console.log(err)
    logger.error('server error', err, ctx);
    ctx.render('error', { message: ' 服务器错误!',error: err });
});

module.exports = app
