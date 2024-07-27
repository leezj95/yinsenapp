// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();

const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
    const title = event.title;
    const categID = event.categID;
    const items = event.items;
    return await db.collection('page_categ').add({ data: { title, categID, items } })
}