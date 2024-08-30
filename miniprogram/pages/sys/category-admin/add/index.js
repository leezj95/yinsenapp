import Toast, { hideToast } from 'tdesign-miniprogram/toast/index';

function getLastIndexOfNonEmpty(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]) return i;
  }
  return -1; // 如果数组中的所有元素都是空值，则返回-1
}

Page({
  data: {
    pickerKeys: {
      label: 'name',
      value: '_id'
    },
    // radioList: ["一级", "二级", "三级"],
    // categList: [],
    visible: false,
    levelVal: "L1",
    parentCateg: {
      id: "",
      name: "",
    },
    category: "",
    loading: false,
    categsL1: [],
    categsL2: [],
    categsL3: [],
  },
  onLoad() {
   this.getCategData();
  },
  async getCategData() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '加载中...',
      theme: 'loading',
      direction: 'column',
    });
    const res1 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { level: "L1" } });
    if (res1.result.data && res1.result.data.length) {
        this.setData({ categsL1: res1.result.data });
        if (res1.result.data[0]._id) {
          const res2 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid: res1.result.data[0]._id, level: "L2" } });
          const categsL2 = res2.result.data;
          if (categsL2 && categsL2.length) {
              categsL2.unshift({name: "——", _id: undefined})
              this.setData({ categsL2 });
              if (res2.result.data[0]._id) {
                const res3 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid: res2.result.data[0]._id, level: "L3" } });
                const categsL3 = res3.result.data;
                if (categsL3 && categsL3.length) {
                    categsL3.unshift({name: "——", _id: undefined})
                    this.setData({ categsL3 });
                }
              }
          }
        }
    }

    hideToast({
      context: this,
      selector: '#t-toast',
    });

  },
  /** 监听单选框选择 */
  // onChangeRadio(e) {
  //   const currentValue = e.detail.value;
  //   this.setData({
  //     levelVal: currentValue,
  //     categList: [],
  //     parentCateg: {
  //       id: "",
  //       name: "",
  //     }
  //   });
  //   if (currentValue != 1) {
  //     // 减一等到父级
  //     const parentLevel = `L${currentValue - 1}`;
  //     wx.cloud.callFunction({
  //       name: "ys_get_categ",
  //       data: {
  //         level: parentLevel
  //       }
  //     }).then(res => {
  //       if (res.result.data && res.result.data.length) {
  //         this.setData({
  //           categList: res.result.data
  //         });
  //       }
  //     })
  //   }
  // },
  /** 打开选择器 */
  async openPicker() {
    await this.getCategData();
    this.setData({ visible: true });
  },
  /** 选择分类 */
  onChangePicker(e) {
    const valueArr = e.detail.value;
    const labelArr = e.detail.label;
    const lastIndex = getLastIndexOfNonEmpty(valueArr);
    if (lastIndex !== 2) {
      this.setData({
        levelVal: `L${lastIndex + 2}`,
        "parentCateg.name": labelArr[lastIndex],
        "parentCateg.id": valueArr[lastIndex]
      });
    }
  },
  async onColumnChange(e) {
    const { column, value } = e.detail;
    if (column === 0) {
        const pid = value[column];
        if (pid) {
          const res2 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid, level: "L2" } });
          const categsL2 = res2.result.data;
          if (categsL2 && categsL2.length) {
              categsL2.unshift({name: "——", _id: undefined})
              this.setData({ categsL2 });
              if (res2.result.data[0]._id) {
                const res3 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid: res2.result.data[0]._id, level: "L3" } });
                const categsL3 = res3.result.data;
                if (categsL3 && categsL3.length) {
                  categsL3.unshift({name: "——", _id: undefined})
                  this.setData({ categsL3 });
                } else {
                    this.setData({ categsL3: [] });
                }
              } else {
                this.setData({ categsL3: [] });
            }
          } else {
              this.setData({ categsL2: [], categsL3: [] });
          }
        } else {
          this.setData({ categsL2: [], categsL3: [] });
      }
    }

    if (column === 1) {
        const pid = value[column];
        if (pid) {
          const res3 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid, level: "L3" } });
          const categsL3 = res3.result.data
          if (categsL3 && categsL3.length) {
              categsL3.unshift({name: "——", _id: undefined})
              this.setData({ categsL3 });
          } else {
              this.setData({ categsL3: [] });
          }
        } else {
          this.setData({ categsL3: [] });
       }
    }
  },
  /** 编辑分类 */
  changeCategory(e) {
    this.setData({ category: e.detail.value });
  },
  /** 提交保存 */
  onFormSubmit() {
    this.setData({ loading: true });
    const data = {
      p_id: this.data.levelVal === "L1" ? null : this.data.parentCateg.id,
      name: this.data.category,
      level: this.data.levelVal
    }
    wx.cloud.callFunction({ name: "ys_add_categ", data }).then((res) => {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '添加成功',
        theme: 'success',
        direction: 'column',
      });
    }).then(() => {
      this.setData({ loading: false, category: "" })
    })
  },
  /** 重置表单 */
  onFormReset() {
    this.setData({
      category: "",
      levelVal: "L1",
      parentCateg: {
        id: "",
        name: "",
      },
    })
  }
})