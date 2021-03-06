const Base = require('./base.js');
const gm = require('gm').subClass({imageMagick: true});
const fs = require('fs');
const qiniu = require('../utils/qiniu');

module.exports = class extends Base {
  async brandPicAction() {
    const brandFile = this.file('brand_pic');
    if (think.isEmpty(brandFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/brand/' + think.uuid(32) + '.jpg';
    const is = fs.createReadStream(brandFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);


    //七牛上传
    const filekey = think.uuid(32) + '.jpg';
    const filepath = brandFile.path;
    //const result = await qiniu(filekey,filepath);
    await qiniu(filekey, filepath).then(function (result) {
      return that.success({
        name: 'brand_pic',
        fileUrl: result.url
      });
    }, function (err) {
      return that.fail('图片上传失败');
    });




    // return that.success({
    //   name: 'brand_pic',
    //   fileUrl: 'http://127.0.0.1:8360' + filename
    // });
    // gm(brandFile.path)
    //   .resize(750, 420, '!')
    //   .write(think.RESOURCE_PATH + filename, function (err) {
    //     if (err) {
    //       return that.fail('图片上传失败');
    //     }
    //     return that.success({
    //       name: 'brand_pic',
    //       fileUrl: 'http://127.0.0.1:8360' + filename
    //     });
    //   });
  }

  async brandNewPicAction() {
    const brandFile = this.file('brand_new_pic');
    if (think.isEmpty(brandFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/brand/' + think.uuid(32) + '.jpg';

    const is = fs.createReadStream(brandFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'brand_new_pic',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
    // gm(brandFile.path)
    //   .resize(375, 252, '!')
    //   .write(think.ROOT_PATH + '/www' + filename, function(err) {
    //     if (err) {
    //       return that.fail('上传失败');
    //     }
    //     return that.success({
    //       name: 'brand_new_pic',
    //       fileUrl: 'http://127.0.0.1:8360' + filename
    //     });
    //   });
  }

  async categoryWapBannerPicAction() {
    const imageFile = this.file('wap_banner_pic');
    if (think.isEmpty(imageFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/category/' + think.uuid(32) + '.jpg';

    const is = fs.createReadStream(imageFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'wap_banner_url',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
  }

  async topicThumbAction() {
    const imageFile = this.file('scene_pic_url');
    if (think.isEmpty(imageFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/topic/' + think.uuid(32) + '.jpg';

    const is = fs.createReadStream(imageFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'scene_pic_url',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
  }
};
