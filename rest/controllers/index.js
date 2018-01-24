const mysql = require('../../config/mysqlUtil');

class indexController {
    static async indexAction(ctx) {

        const banner = await mysql.execQuery({
            sql: 'select * from nideshop_ad where ad_position_id = 1',
        });

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
            sql: `select * from nideshop_category where parent_id = 0 and name != '推荐'`,
        });
        const newCategoryList = [];
        for (const categoryItem of categoryList) {

            const childCategoryIds = await mysql.execQuery({
                sql: 'select id from nideshop_category where parent_id = ?  limit 10',
                args: categoryItem.id
            });

            let args = '';
            if (childCategoryIds.length > 0) {
                args = childCategoryIds[0].id;
                for(let j = 1; j < childCategoryIds.length ; j++) {
                    args = args + ',' + childCategoryIds[j].id;
                }
            }
            const categoryGoods = await mysql.execQuery({
                sql: 'select id,name,list_pic_url,retail_price from nideshop_goods where category_id in (?) limit 7',
                args: args
            });
            newCategoryList.push({
                id: categoryItem.id,
                name: categoryItem.name,
                goodsList: categoryGoods,
                args: args
            });
        }

        return ctx.success({
            data: {
                banner: banner,
                channel: channel,
                newGoodsList: newGoods,
                hotGoodsList: hotGoods,
                brandList: brandList,
                topicList: topicList,
                categoryList: newCategoryList
            }
        });
    }
}

module.exports = indexController;
//export default indexController;