// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();

const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const p_id = event.pid;
  const level = event.level;
  const value = event.value;
  const limit = event.limit;
  if (limit) {
    return await db.collection('goods_categ_list').where({ level: db.RegExp({ regexp: level }), value, p_id }).limit(limit).get()
  }
  return await db.collection('goods_categ_list').where({ level: db.RegExp({ regexp: level }), value, p_id }).get()
}