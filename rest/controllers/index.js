const mysql = require('../../config/mysqlUtil');

class indexController {
    static async indexAction(ctx) {

        const banner = await mysql.execQuery({
            sql: 'select * from nideshop_ad where ad_position_id = 1',
        });

        console.log(banner)

        const channel = await mysql.execQuery({
            sql: 'select * from nideshop_channel order by sort_order asc',
        });

        const newGoods = await mysql.execQuery({
            sql: 'select id,name,list_pic_url,retail_price from nideshop_goods where is_new = 1 limit 4',
        });

        const hotGoods = await mysql.execQuery({
            sql: 'select id,name,list_pic_url,retail_price,goods_brief from nideshop_goods where is_hot = 1 limit 3',
        });

        const brandList = await mysql.execQuery({
            sql: 'select * from nideshop_brand where is_new = 1  order by new_sort_order asc limit 4',
        });

        const topicList = await mysql.execQuery({
            sql: 'select * from nideshop_topic limit 3',
        });

        const categoryList = await mysql.execQuery({
            sql: `select * from nideshop_category where parent_id = 0 and name = "推荐" limit 3`,

        });

        //const channel = await this.model('channel').order({sort_order: 'asc'}).select();
        //const newGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({is_new: 1}).limit(4).select();
        //const hotGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price', 'goods_brief']).where({is_hot: 1}).limit(3).select();
        //const brandList = await this.model('brand').where({is_new: 1}).order({new_sort_order: 'asc'}).limit(4).select();
        //const topicList = await this.model('topic').limit(3).select();

        //const categoryList = await this.model('category').where({parent_id: 0, name: ['<>', '推荐']}).select();
        const newCategoryList = [];

        for (const categoryItem of categoryList) {

            const childCategoryIds = await mysql.execQuery({
                sql: 'select id from nideshop_category where parent_id = ? and id = 100',
                args: [categoryItem.id]
            });

            const categoryGoods = await mysql.execQuery({
                sql: 'select id,name,list_pic_url,retail_price from nideshop_goods where category_id = ? limit 7',
                args: [['IN', childCategoryIds]]
            });
            //const childCategoryIds = await this.model('category').where({parent_id: categoryItem.id}).getField('id', 100);
            //const categoryGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({category_id: ['IN', childCategoryIds]}).limit(7).select();
            newCategoryList.push({
                id: categoryItem.id,
                name: categoryItem.name,
                goodsList: categoryGoods
            });
        }

        return ctx.body = {
            banner: banner,
            channel: channel,
            newGoodsList: newGoods,
            hotGoodsList: hotGoods,
            brandList: brandList,
            topicList: topicList,
            categoryList: newCategoryList
        };
        // return this.success({
        //     banner: banner,
        //     channel: channel,
        //     newGoodsList: newGoods,
        //     hotGoodsList: hotGoods,
        //     brandList: brandList,
        //     topicList: topicList,
        //     categoryList: newCategoryList
        // });
    }
}

export default indexController;