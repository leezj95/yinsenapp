// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  let swiperList = [];
  let categList = [];
  let noticeList = [];
  let video = "";
  await cloud.callFunction({ name: "ys_get_categ", data: { level: "L1", limit: 8 } }).then(res => {
    if (res.result.data && res.result.data.length) {
      categList = res.result.data
    }
  })

  await db.collection("page_home").get().then(res => {
    if (res.data && res.data.length) {
      swiperList = res.data[0].swiper;
      noticeList = res.data[0].notice;
      video = res.data[0].video;
    }
  });

  return {
    swiperList,
    categList,
    noticeList,
    video
  }
}