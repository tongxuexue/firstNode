/**
 * Created by gy on 2018/1/18.
 */
const mysql = require('../../config/mysqlUtil');

class catalogController {

    /**
     * 获取分类栏目数据
     */
    static async indexAction(ctx) {
        //let { id } = ctx.query;
        const categoryId = ctx.params.id;

        // const model = await mysql.execQuery({
        //     sql: 'select * from nideshop_category where parent_id = 0',
        // });

        const data = await mysql.execQuery({
            sql: 'select * from nideshop_category where parent_id = 0 limit 10',
        });

        //const model = this.model('category');
        //const data = await model.limit(10).where({parent_id: 0}).select();

        let currentCategory = null;
        if (categoryId) {
            currentCategory = await mysql.execQuery({
                sql: 'select * from nideshop_category where id = ?',
                args: [categoryId]
            });
            //currentCategory = await model.where({'id': categoryId}).find();
        }

        if (!currentCategory) {
            currentCategory = data[0];
        }

        // 获取子分类数据
        if (currentCategory && currentCategory.id) {

            currentCategory.subCategoryList =  await mysql.execQuery({
                sql: 'select * from nideshop_category where parent_id = ?',
                args: [currentCategory.id]
            });
            //currentCategory.subCategoryList = await model.where({'parent_id': currentCategory.id}).select();
        }

        return this.success({
            categoryList: data,
            currentCategory: currentCategory
        });
    }

    static async  currentAction(ctx) {
        const categoryId = ctx.params.id;
        //const model = this.model('category');

        let currentCategory = null;
        if (categoryId) {
            currentCategory = await mysql.execQuery({
                sql: 'select * from nideshop_category where id = ?',
                args: [categoryId]
            });
            //currentCategory = await model.where({'id': categoryId}).find();
        }
        // 获取子分类数据
        if (currentCategory && currentCategory.id) {
            currentCategory.subCategoryList =  await mysql.execQuery({
                sql: 'select * from nideshop_category where parent_id = ?',
                args: [currentCategory.id]
            });
            //currentCategory.subCategoryList = await model.where({'parent_id': currentCategory.id}).select();
        }

        return this.success({
            currentCategory: currentCategory
        });
    }

}

export default catalogController;