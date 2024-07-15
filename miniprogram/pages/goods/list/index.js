function treeToArr(list, _arr = []) {
  const arr = _arr;
  for (let i = 0; i < list.length; i++) {
    arr.push(list[i]);
    if (list[i].children && list[i].children.length) {
      treeToArr(list[i].children, arr)
    }
  }
  return arr
}
function buildTree(data, parentId = null) {
  let tree = [];
  data.forEach((node) => {
    if (node.p_id === parentId) {
      let children = buildTree(data, node._id);
      if (children.length) {
        node.children = children;
      }
      tree.push(node);
    }
  });
  return tree;
}
Page({
  data: {
    prod: {
      label: '全部',
      value: '',
      options: [],
    },
    categ: {
      options: [],
      value: [],
      label: "全部分类"
    },
    brand: {
      label: '全部',
      value: '',
      options: [],
    },
    goodsList: [],
    loading: false,
    finished: false,
    finishedText: "",
  },
  /** 获取类型数据 */
  getTypeData(type) {
    const that = this;
    wx.cloud.callFunction({ name: "ys_get_type", data: { type } }).then(res => {
      if (res.result.data && res.result.data.length) {
        const defaulItem = res.result.data[0]
        that.setData({ [`${type}.options`]: res.result.data, [`${type}.vaue`]: defaulItem.value, [`${type}.label`]: defaulItem.label })
      }
    })
  },
  /** 获取分类数据 */
  async getCategData(val) {
    const that = this;
    const res = await wx.cloud.callFunction({ name: "ys_get_categ", data: { level: "L" } });
    if (res.result.data && res.result.data.length) {
      const curItem = res.result.data.filter(item => item.value === val);
      let newValue = val ? val.split("-") : [res.result.data[0].value];
      for (let i = 0; i < newValue.length; i++) {
        newValue[i] = newValue[i - 1] ? newValue[i - 1] + "-" + newValue[i] : newValue[i];
      }
      that.setData({
        "categ.options": buildTree(res.result.data),
        "categ.value": newValue,
        "categ.label": curItem.length ? curItem[0].name : "全部分类"
      });
    }
    return await Promise.resolve();
  },
  /** 获取商品列表数据 */
  getGoodsList(currentPage = 0, params) {
    const that = this;
    // 第一次加载数据
    if (currentPage == 0) {
      this.setData({ loading: true, goodsList: [], finished: false });
    }
    wx.cloud.callFunction({ name: "ys_get_goods_page_data", data: { currentPage, ...params } }).then(res => {
      if (res.result?.data && res.result.data.length) {
        const oldData = that.data.goodsList;
        const newData = oldData.concat(res.result.data);
        that.setData({ goodsList: newData, finished: false })
        if (res.result.data.length < 10) {
          that.setData({
            loading: false,
            finished: true, //隐藏加载中。。
            finishedText: "没有更多啦！" //所有数据都加载完了
          });
        }
      } else {
        that.setData({
          loading: false, // 隐藏加载中。。
          finished: true,
          finishedText: "没有更多啦！"
        });
      }
    })
  },
  /** 生命周期函数--监听页面加载 */
  onLoad(options) {
    const defaultName = options.name;
    const defaultCateg = options.categ;
    this.setData({ loading: true });
    this.getTypeData("prod");
    this.getTypeData("brand");
    this.getCategData(defaultCateg).then(() => {
      let params = {};
      if (defaultName && defaultName != "") {
        params = { name: defaultName };
        const searchChild = this.selectComponent('#search-val');
        searchChild.setData({ value: defaultName })
      } else {
        params = { dropdownMenu: [...this.data.categ.value] }
      }
      this.getGoodsList(0, params)
    })
  },
  /** 页面上拉触底事件的处理函数 */
  onScrolltolower() {
    const that = this;
    if (!that.data.finished) {
      const len = that.data.goodsList.length;
      const searchChild = that.selectComponent('#search-val');
      const name = searchChild.data.value;
      const { categ, prod, brand } = that.data;
      that.setData({ loading: true, finished: true }, () => {
        that.getGoodsList(len, { name, dropdownMenu: [...categ.value, prod.value, brand.value] })
      })
    }
  },
  /** 单选框选择 */
  onChangeRadio(ev) {
    const key = ev.currentTarget.dataset.key;
    const item = this.data[key].options.filter(item => item.value == ev.detail.value);
    const child = this.selectComponent(`#dropdown-${key}`);
    const searchChild = this.selectComponent('#search-val');
    child.closeDropdown();
    searchChild.setData({ value: "" })
    this.setData({ [`${key}.value`]: item[0].value, [`${key}.label`]: item[0].label }, () => {
      this.getGoodsList(0, { dropdownMenu: [...this.data.categ.value, this.data.prod.value, this.data.brand.value] })
    });
  },
  /** 树选择 */
  onChangeTree(ev) {
    const { level, value } = ev.detail;
    const nextVal = value.splice(0, level + 1);
    this.setData({ "categ.value": nextVal });
  },
  /** 树选择确认按钮 */
  onConfirmCateg(ev) {
    const { value, options } = this.data.categ;
    const arr = treeToArr(options, [])
    const filterArr = arr.filter(item => item.value == value[value.length - 1]);
    const searchChild = this.selectComponent('#search-val');
    searchChild.setData({ value: "" })
    this.setData({ "categ.label": filterArr.length ? filterArr[0].name : "全部分类" });
    this.getGoodsList(0, { dropdownMenu: [...value, this.data.prod.value, this.data.brand.value] })
  },
  /** 树选择重置按钮 */
  onResetCateg(ev) {
    this.setData({ "categ.value": [], "categ.label": "全部分类" });
    const child = this.selectComponent('#dropdown-categ');
    const searchChild = this.selectComponent('#search-val');
    child.closeDropdown();
    searchChild.setData({ value: "" });
    this.getGoodsList(0, { dropdownMenu: [this.data.prod.value, this.data.brand.value] })
  },
  /** 模糊搜索 */
  onSearchVal(ev) {
    const searchName = ev.detail.value;
    this.setData({
      "prod.value": this.data.prod.options[0].value,
      "prod.label": this.data.prod.options[0].label,
      "categ.value": [],
      "categ.label": "全部分类",
      "brand.value": this.data.brand.options[0].value,
      "brand.label": this.data.brand.options[0].label,
    });
    if (searchName != "") {
      this.getGoodsList(0, { name: searchName })
    }
  },
  onClickToDetail(ev) {
    wx.navigateTo({ url: `/pages/goods/detail/index?id=${ev.currentTarget.dataset.id}` });
  }
})