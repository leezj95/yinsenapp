// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();

const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
    const name = event.name;
    const infos = event.infos;
    const categIds = event.categIds;
    const swiper = event.swiper;
    return await db.collection('goods_list').add({ data: { name, infos, categIds, swiper } })
}