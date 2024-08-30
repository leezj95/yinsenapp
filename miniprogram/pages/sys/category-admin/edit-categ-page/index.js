import Toast, {
  hideToast
} from 'tdesign-miniprogram/toast/index';

const defaultAssCateg = { id: "", name: "" };
  
Page({
  data: {
    gridConfig: {
      column: 1
    },
    loading: false,
    visible: false,
    title: "",
    assCateg: defaultAssCateg,
    subItems: [{
      files: [],
      title: "",
      assCateg: defaultAssCateg,
    }],
    pickerIndex: null,
    categsL1: [],
    categsL2: [],
    categsL3: [],
  },
  async onLoad() {
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
  },
  /** 点击追加一条子集 */
  clickAddSub() {
    var rawList = this.data.subItems;
    var lastItem = rawList[rawList.length - 1];
    if (lastItem.files.length && lastItem.title !== "" && lastItem.assCateg.id !== "") {
      rawList.push({
        files: [],
        label: "",
        assCateg: defaultAssCateg
      });
      this.setData({
        subItems: rawList
      });
    } else {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请先添加空余值！',
      });
    }
  },
  /** 点击减少一条子集 */
  clickMinusSub(e) {
    var index = e.currentTarget.dataset.index;
    var subItems = this.data.subItems;
    subItems = subItems.filter((t, i) => i !== index);
    this.setData({ subItems });
  },
  /** 监听输入框标题 */
  changeIptTitle(e) {
    const index = e.currentTarget.dataset.index;
    if (index !== null) {
      let subItems = this.data.subItems;
      subItems[index].title = e.detail.value;
      this.setData({ subItems });
    } else {
      this.setData({ title: e.detail.value })
    }
  },
  /** 打开分类选择器 */
  openPicker(e) {
    this.setData({ visible: true, pickerIndex: e.currentTarget.dataset.index })
  },
  /** 选择分类 */
  onChangePicker(e) {
    const labelArr = e.detail.label.filter(val => val !== undefined && val !== '——');
    const valueArr = e.detail.value.filter(val => val !== undefined && val !== '——');
    if (this.data.pickerIndex !== null) {
      let subItems = this.data.subItems;
      subItems[this.data.pickerIndex].assCateg = { name: labelArr[labelArr.length -1], id: valueArr[valueArr.length -1] };
      this.setData({ subItems: subItems })
    } else {
      this.setData({ assCateg: { name: labelArr[labelArr.length -1], id: valueArr[valueArr.length -1] } })
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
  /** 上传照片到云端 */
  addCloudFile(e) {
    const { files } = e.detail;
    const index = e.currentTarget.dataset.index;
    let subItems = this.data.subItems; 
    let file = { ...files[0], status: 'loading' };
    subItems[index].files = [file];
    this.setData({subItems});
    wx.cloud.uploadFile({ cloudPath: `goods/${file.name}`, filePath: file.url }).then(res => {
      file.status = "done";
      file.url = res.fileID;
      subItems[index].files = [file];
      this.setData({subItems});
    }).catch(() => {
      subItems[index].files = [];
      this.setData({ subItems });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '上传失败',
        theme: 'error',
      });
    })
  },
  /** 删除云端照片 */
  removeCloudFile(e) {
    const { file } = e.detail;
    const index = e.currentTarget.dataset.index;
    let subItems = this.data.subItems;
    subItems[index].files = [];
    wx.cloud.deleteFile({
      fileList: [file.url]
    }).then(() => this.setData({ subItems }))
  },
  /** 提交保存 */
  onFormSubmit() {
    this.setData({ loading: true });
    const data = {
      title: this.data.title,
      categID: this.data.assCateg.id,
      items: this.data.subItems.map(item => ({
        title: item.title,
        img: item.files[0].url,
        categID: item.assCateg.id
      }))
    }
    wx.cloud.callFunction({ name: "ys_add_categ_page_data", data }).then((res) => {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '添加成功',
        theme: 'success',
        direction: 'column',
      });
    }).then(() => {
      this.setData({
        loading: false,
        title: "",
        assCateg: defaultAssCateg,
        subItems: [{
          files: [],
          title: "",
          assCateg: defaultAssCateg,
        }],
        pickerIndex: null,
      })
    })
  },
  /** 重置表单 */
  onFormReset() {
    const deleteFiles = this.data.subItems.map(item => item.files[0].url)
    wx.cloud.deleteFile({ fileList: deleteFiles }).then(() => {
      this.setData({
        title: "",
        assCateg: defaultAssCateg,
        subItems: [{
          files: [],
          title: "",
          assCateg: defaultAssCateg,
        }],
        pickerIndex: null,
      })
    })
  }
})