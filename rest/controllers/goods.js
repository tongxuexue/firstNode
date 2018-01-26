/**
 * Created by gy on 2018/1/24.
 */
const mysql = require('../../config/mysqlUtil');
const goodsModel = require('../model/goods');

class goodsController {

    static async indexAction(ctx) {
        const goodsList = await mysql.execQuery({
            sql: 'select * from nideshop_goods',
        });
        return ctx.success({
            data: goodsList
        });
    }

    /**
     * 获取sku信息，用于购物车编辑时选择规格
     */
    static async skuAction(ctx) {
        const goodsId = ctx.query.id;
        const specificationList = goodsModel.getSpecificationList(goodsId);
        const productList = goodsModel.getProductList(goodsId);
        return ctx.success({
            data: {
                specificationList: specificationList,
                productList: productList
            }
        });
    }

    /**
     * 商品详情页数据
     */
    static async detailAction(ctx) {
        const goodsId = ctx.query.id;

        const info = await mysql.execQuery({
            sql: 'select * from nideshop_goods where id = ? limit 1',
            args: goodsId
        });

        const brand_id = !info[0] ? '' : info[0].brand_id;

        const gallery = await mysql.execQuery({
            sql: 'select * from nideshop_goods_gallery where goods_id = ? limit 4',
            args: goodsId
        });

        const attribute = await mysql.execQuery({
            sql: 'select nideshop_goods_attribute.value,nideshop_attribute.name from nideshop_goods_attribute left join nideshop_attribute on nideshop_goods_attribute.attribute_id = nideshop_attribute.id where nideshop_goods_attribute.goods_id = ? order by nideshop_goods_attribute.id asc',
            args: goodsId
        });

        const issue = await mysql.execQuery({
            sql: 'select * from nideshop_goods_issue',
        });

        if (!brand_id) {

            return ctx.success({
                data: {
                    brand_id: '大萨达所',
                    test: typeof(brand_id)
                }
            });

        } else {

            return ctx.success({
                data: {
                    brand_id: brand_id
                }
            });
        }

        const brand = await mysql.execQuery({
            sql: 'select * from nideshop_brand where id = 0',
            args: brand_id
        });

        return ctx.success({
            data: {
                brand_id: brand_id
            }
        });

        const commentCount = await mysql.execQuery({
            sql: 'select count(*) from nideshop_comment where value_id = ? and type_id = 0 limit 1',
            args: brand_id
        });

        const hotComment = await mysql.execQuery({
            sql: 'select * from nideshop_comment where value_id = ? and type_id = 0 limit 1',
            args: goodsId
        });


        return ctx.success({
            data: {
                hotComment: hotComment
            }
        });


        const hotComment_user_id = typeof(hotComment[0]) == "undefined" ? '' : info[0].user_id;
        const hotComment_id = typeof(hotComment[0]) == "undefined" ? '' : info[0].id;

        let commentInfo = {};
        if (!(JSON.stringify(hotComment) == "{}")) {

            const commentUser = await mysql.execQuery({
                sql: 'select nickname,username,avatar from nideshop_user where id = ? limit 1',
                args: hotComment_user_id
            });

            const pic_list = await mysql.execQuery({
                sql: 'select * from nideshop_comment_picture where comment_id = ? ',
                args: hotComment_id
            });

            commentInfo = {
                content: new Buffer(hotComment.content, 'base64').toString(),
                add_time: new Date(hotComment.add_time * 1000),
                nickname: commentUser.nickname,
                avatar: commentUser.avatar,
                pic_list: pic_list
            };
        }

        const comment = {
            count: commentCount,
            data: commentInfo
        };

        // 当前用户是否收藏
        const userHasCollect = goodsController.isUserHasCollect(think.user_id, 0, goodsId);
        //const userHasCollect = await this.model('collect').isUserHasCollect(think.userId, 0, goodsId);

        // 记录用户的足迹 TODO
        goodsController.addFootprint(think.user_id, goodsId)
        //await this.model('footprint').addFootprint('test', goodsId);

        return ctx.success({
            data: {
                info: info,
                gallery: gallery,
                attribute: attribute,
                userHasCollect: userHasCollect,
                issue: issue,
                comment: comment,
                brand: brand,
                specificationList: goodsModel.getSpecificationList(goodsId),
                productList: goodsModel.getProductList(goodsId)
            }
        });
    }

    static async isUserHasCollect(userId, typeId, valueId) {
        const hasCollect = await mysql.execQuery({
            sql: 'select count(id) from nideshop_collect where value_id = ? and type_id = ? and user_id = ? limit 1',
            args: [valueId, typeId, userId]
        });
        return hasCollect;
    }

    static async addFootprint(userId, goodsId) {
        // 用户已经登录才可以添加到足迹
        if (userId > 0 && goodsId > 0) {
            await mysql.execQuery({
                sql: 'INSERT INTO nideshop_footprint (user_id, goods_id, add_time) VALUES (?,?,?)',
                args: [userId, goodsId, parseInt(Date.now() / 1000)]
            });
        }
    }

    /**
     * 获取分类下的商品
     */
    static async categoryAction(ctx) {
        const model = this.model('category');
        const currentCategory = await model.where({id: this.get('id')}).find();
        const parentCategory = await model.where({id: currentCategory.parent_id}).find();
        const brotherCategory = await model.where({parent_id: currentCategory.parent_id}).select();

        return this.success({
            currentCategory: currentCategory,
            parentCategory: parentCategory,
            brotherCategory: brotherCategory
        });
    }

    /**
     * 获取商品列表
     */
    static async listAction(ctx) {
        const categoryId = this.get('categoryId');
        const brandId = this.get('brandId');
        const keyword = this.get('keyword');
        const isNew = this.get('isNew');
        const isHot = this.get('isHot');
        const page = this.get('page');
        const size = this.get('size');
        const sort = this.get('sort');
        const order = this.get('order');

        const goodsQuery = this.model('goods');

        const whereMap = {};
        if (!think.isEmpty(isNew)) {
            whereMap.is_new = isNew;
        }

        if (!think.isEmpty(isHot)) {
            whereMap.is_hot = isHot;
        }

        if (!think.isEmpty(keyword)) {
            whereMap.name = ['like', `%${keyword}%`];
            // 添加到搜索历史
            await this.model('search_history').add({
                keyword: keyword,
                user_id: think.userId,
                add_time: parseInt(new Date().getTime() / 1000)
            });
        }

        if (!think.isEmpty(brandId)) {
            whereMap.brand_id = brandId;
        }

        // 排序
        let orderMap = {};
        if (sort === 'price') {
            // 按价格
            orderMap = {
                retail_price: order
            };
        } else {
            // 按商品添加时间
            orderMap = {
                id: 'desc'
            };
        }

        // 筛选的分类
        let filterCategory = [{
            'id': 0,
            'name': '全部',
            'checked': false
        }];

        const categoryIds = await goodsQuery.where(whereMap).getField('category_id', 10000);
        if (!think.isEmpty(categoryIds)) {
            // 查找二级分类的parent_id
            const parentIds = await this.model('category').where({id: {'in': categoryIds}}).getField('parent_id', 10000);
            // 一级分类
            const parentCategory = await this.model('category').field(['id', 'name']).order({'sort_order': 'asc'}).where({'id': {'in': parentIds}}).select();

            if (!think.isEmpty(parentCategory)) {
                filterCategory = filterCategory.concat(parentCategory);
            }
        }

        // 加入分类条件
        if (!think.isEmpty(categoryId) && parseInt(categoryId) > 0) {
            whereMap.category_id = ['in', await this.model('category').getCategoryWhereIn(categoryId)];
        }

        // 搜索到的商品
        const goodsData = await goodsQuery.where(whereMap).field(['id', 'name', 'list_pic_url', 'retail_price']).order(orderMap).page(page, size).countSelect();
        goodsData.filterCategory = filterCategory.map(function (v) {
            v.checked = (think.isEmpty(categoryId) && v.id === 0) || v.id === parseInt(categoryId);
            return v;
        });
        goodsData.goodsList = goodsData.data;

        return this.success(goodsData);
    }

    /**
     * 商品列表筛选的分类列表
     */
    static async filterAction(ctx) {
        const categoryId = this.get('categoryId');
        const keyword = this.get('keyword');
        const isNew = this.get('isNew');
        const isHot = this.get('isHot');

        const goodsQuery = this.model('goods');

        if (!think.isEmpty(categoryId)) {
            goodsQuery.where({category_id: {'in': await this.model('category').getChildCategoryId(categoryId)}});
        }

        if (!think.isEmpty(isNew)) {
            goodsQuery.where({is_new: isNew});
        }

        if (!think.isEmpty(isHot)) {
            goodsQuery.where({is_hot: isHot});
        }

        if (!think.isEmpty(keyword)) {
            goodsQuery.where({name: {'like': `%${keyword}%`}});
        }

        let filterCategory = [{
            'id': 0,
            'name': '全部'
        }];

        // 二级分类id
        const categoryIds = await goodsQuery.getField('category_id', 10000);
        if (!think.isEmpty(categoryIds)) {
            // 查找二级分类的parent_id
            const parentIds = await this.model('category').where({id: {'in': categoryIds}}).getField('parent_id', 10000);
            // 一级分类
            const parentCategory = await this.model('category').field(['id', 'name']).order({'sort_order': 'asc'}).where({'id': {'in': parentIds}}).select();

            if (!think.isEmpty(parentCategory)) {
                filterCategory = filterCategory.concat(parentCategory);
            }
        }

        return this.success(filterCategory);
    }

    /**
     * 新品首发
     */
    static async newAction(ctx) {
        return this.success({
            bannerInfo: {
                url: '',
                name: '坚持初心，为你寻觅世间好物',
                img_url: 'http://yanxuan.nosdn.127.net/8976116db321744084774643a933c5ce.png'
            }
        });
    }

    /**
     * 人气推荐
     */
    static async hotAction(ctx) {
        return this.success({
            bannerInfo: {
                url: '',
                name: '大家都在买的严选好物',
                img_url: 'http://yanxuan.nosdn.127.net/8976116db321744084774643a933c5ce.png'
            }
        });
    }

    /**
     * 商品详情页的大家都在看的商品
     */
    static async relatedAction(ctx) {
        // 大家都在看商品,取出关联表的商品，如果没有则随机取同分类下的商品
        const model = this.model('goods');
        const goodsId = this.get('id');
        const relatedGoodsIds = await this.model('related_goods').where({goods_id: goodsId}).getField('related_goods_id');
        let relatedGoods = null;
        if (think.isEmpty(relatedGoodsIds)) {
            // 查找同分类下的商品
            const goodsCategory = await model.where({id: goodsId}).find();
            relatedGoods = await model.where({category_id: goodsCategory.category_id}).field(['id', 'name', 'list_pic_url', 'retail_price']).limit(8).select();
        } else {
            relatedGoods = await model.where({id: ['IN', relatedGoodsIds]}).field(['id', 'name', 'list_pic_url', 'retail_price']).select();
        }

        return this.success({
            goodsList: relatedGoods
        });
    }

    /**
     * 在售的商品总数
     */
    static async countAction(ctx) {
        const goodsCount = await this.model('goods').where({is_delete: 0, is_on_sale: 1}).count('id');

        return this.success({
            goodsCount: goodsCount
        });
    }

}

module.exports = goodsController;