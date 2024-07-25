Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgProp: { width: '100%', height: '100%', shape: 'round', lazy: true },
    scrollTop: 0,
    sideBarIndex: "",
    sideBarList: [],
    pageContent: [],
    loading: false
  },
  getData(categID) {
    const that = this;
    that.setData({ loading: true, pageContent: [] })
    wx.cloud.callFunction({ name: "ys_get_categ_page_data", data: { categID } }).then(res => {
      if (res.result.data && res.result.data.length) {
        that.setData({ pageContent: res.result.data, loading: false })
      } else {
        that.setData({ loading: false, pageContent: [] })
      }
    })
  },
  onLoad() {
    wx.showLoading({ title: '数据加载中' })
    const that = this;
    wx.cloud.callFunction({ name: "ys_get_categ", data: { level: "L1" } }).then(res => {
      if (res.result.data && res.result.data.length) {
        const defaultID = res.result.data[0]._id
        that.setData({ sideBarList: res.result.data, sideBarIndex: defaultID })
      }
    }).finally(() => {
      wx.hideLoading()
      that.getData(that.data.sideBarIndex)
    })
  },
  onShow() {
    this.getTabBar().init();
    const searchChild = this.selectComponent('#search-val');
    searchChild.setData({ value: "" })
  },
  onPageScroll(ev) {
    const { scrollTop } = ev.detail;
    const threshold = 50; // 下一个标题与顶部的距离
    if (scrollTop < threshold) {
      this.setData({ sideBarIndex: 0 });
      return;
    }

    const index = this.offsetTopList.findIndex((top) => top > scrollTop && top - scrollTop <= threshold);

    if (index > -1) {
      this.setData({ sideBarIndex: index });
    }
  },
  onSideBarChange(ev) {
    const { value } = ev.detail;
    const that = this;
    that.setData({ sideBarIndex: value, scrollTop: 0 }, () => that.getData(that.data.sideBarIndex));
  },
  onClickToGoodList(ev) {
    wx.navigateTo({ url: `/pages/goods/list/index?categ=${ev.currentTarget.dataset.value}` });
  },
  onSearchVal(ev) {
    wx.navigateTo({ url: `/pages/goods/list/index?name=${ev.detail.value}` });
  },
})