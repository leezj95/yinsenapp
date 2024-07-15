Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList: [],
    name: "",
    imgDetail: "",
    tabActive: 0,
    goodsInfo: []
  },
  onLoad(options) {
    wx.cloud.callFunction({ name: "ys_get_goods_page_data", data: { currentPage: 0, id: options.id } }).then(res => {
      if (res.result?.data && res.result.data.length) {
        const { swiper, name, imgDetail, goodsInfo } = res.result?.data[0];
        this.setData({ swiperList: swiper, name, imgDetail, goodsInfo })
      }
    })
  },
  onTabsChange(event) {
    this.setData({ tabActive: event.detail.value });
  }
})