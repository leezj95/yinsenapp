Page({
    data: {
        swiperList: [],
        categList: [],
        noticeList: [],
        video: ""
    },
    /** 模糊搜索 */
    onSearchVal(ev) {
        wx.navigateTo({ url: `/pages/goods/list/index?name=${ev.detail.value}` });
    },
    onLoad() {
        // wx.cloud.callFunction({ name: "ys_get_home_page_data" }).then(res => {
        //     this.setData({ ...res.result })
        // })
    },
    onShow() {
        this.getTabBar().init();
        const searchChild = this.selectComponent('#search-val');
        searchChild.setData({ value: "" })
    }
})