
const qiniu = require("qiniu");
const config = require('../../common/config/config');


module.exports = (key, path) => {

  const qnconfig = config.qiniu;
  const baseurl = qnconfig.baseUrl;
  qiniu.conf.ACCESS_KEY = qnconfig.ACCESS_KEY;
  qiniu.conf.SECRET_KEY = qnconfig.SECRET_KEY;

  const uptoken = (bucket, key) => {
    const putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
    return putPolicy.token();
  }

  const token = uptoken(qnconfig.bucket, key);
  const extra = new qiniu.io.PutExtra();

  return new Promise((resolve, reject) => {
    qiniu.io.putFile(token, key, path, extra, function (err, ret) {
      if (!err) {
        resolve({hash: ret.hash, key: ret.key, url: baseurl + ret.key});
      } else {
        reject(err);
      }
    })
  })
}