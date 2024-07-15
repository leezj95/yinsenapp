// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  // 根据唯一id查询
  const _id = event.id;
  // 根据名称查询
  const name = event.name;
  // 根据下拉菜单查询
  const filterArr = event.dropdownMenu;
  // 当前页数
  const currentPage = event.currentPage;
  if (name) {
    return await db.collection("goods_list").where({ name: db.RegExp({ regexp: name }) }).skip(currentPage).limit(10).get()
  } else if (_id) {
    return await db.collection("goods_list").where({ _id }).skip(currentPage).limit(10).get()
  } else {
    // 使用filter()方法过滤数组中的空字符串
    let resultArr = filterArr.filter((item) => item && item !== "");
    if (resultArr.length) {
      return await db.collection("goods_list").where({ filter: _.all(resultArr) }).skip(currentPage).limit(10).get();
    }
    return await db.collection("goods_list").skip(currentPage).limit(10).get();
  }
}