module.exports = {

    // 开发环境配置
    development: {
        // 数据库配置
        database: {
            DATABASE: 'nideshop',
            USERNAME: 'root',
            PASSWORD: 'root',
            PORT: '3306',
            HOST: 'localhost'
        },
        port: '3000'

    },

    // 生产环境配置
    production: {
        database: {
            DATABASE: 'nideshop',
            USERNAME: 'root',
            PASSWORD: 'root',
            PORT: '3306',
            HOST: 'localhost'
        },
        port: '3000'

    }
}
