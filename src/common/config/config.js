// default config
module.exports = {
  default_module: 'api',
  // errnoField: 'code', // errno field
  // errmsgField: 'msg', // errmsg field
  weixin: {
    appid: '', // 小程序 appid
    secret: '', // 小程序密钥
    mch_id: '', // 商户帐号ID
    partner_key: '', // 微信支付密钥
    notify_url: '' // 微信异步通知，例：https://www.nideshop.com/api/pay/notify
  },
  qiniu: {  // 七牛云sdk配置 (仅供参考)
    ACCESS_KEY: '授权key',   // 示例：'SVDBGFNHBFSBFDNGSBRSVFDV'
    SECRET_KEY: '秘钥key',   // 示例：'XVDFNBDNTWGECdterfnfdvac345edfv'
    bucket: '空间',          // 示例: 'sinn'
    baseUrl: "http://oma6qcctt.bkt.clouddn.com/",
  },
};
