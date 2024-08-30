import Toast from 'tdesign-miniprogram/toast/index';


Page({
    data: {
        loading: false,
        visible: false,
        tables: [{ label: "", value: "" }],
        files: [],
        name: "",
        brand: "",
        assCateg: [{ name: "点击关联分类", _id: "" }, { name: "点击关联分类", _id: "" }, { name: "点击关联分类", _id: "" }],
        categsL1: [],
        categsL2: [],
        categsL3: [],
    },
    async onLoad() {
        const res1 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { level: "L1" } });
        if (res1.result.data && res1.result.data.length) {
            this.setData({ categsL1: res1.result.data });
            console.log(res1.result.data[0]._id);
            const res2 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid: res1.result.data[0]._id, level: "L2" } });
            if (res2.result.data && res2.result.data.length) {
                this.setData({ categsL2: res2.result.data });
                const res3 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid: res2.result.data[0]._id, level: "L3" } });
                if (res3.result.data && res3.result.data.length) {
                    this.setData({ categsL3: res3.result.data });
                }
            }
        }
    },
    /**  点击追加一条商品详情信息参数 */
    clickAddParam() {
        var rawList = this.data.tables;
        var lastItem = rawList[rawList.length - 1];
        if (lastItem.label !== "" && lastItem.value !== "") {
            rawList.push({ label: "", value: "" });
            this.setData({ tables: rawList });
        } else {
            Toast({
                context: this,
                selector: '#t-toast',
                message: '请先添加空余值！',
            });
        }

    },
    /** 点击减少一条商品详情信息参数 */
    clickMinusParam(e) {
        var index = e.currentTarget.dataset.index;
        var rawList = this.data.tables;
        rawList = rawList.filter((t, i) => i !== index);
        this.setData({ tables: rawList });
    },
    /**
     * 监听用户输入的商品详情信息参数
     */
    changetables(e) {
        var index = e.currentTarget.dataset.index;
        var key = e.currentTarget.dataset.key;
        var rawList = this.data.tables;
        rawList[index][key] = e.detail.value;
    },
    /** 打开分类选择器 */
    openPicker() {
        this.setData({ visible: true })
    },
    onPickerChange(e) {
        const { value, label } = e.detail;
        const assCateg = [];
        label.forEach((item, index) => {
            if (item) {
                assCateg.push({ name: item, _id: value[index] })
            }
        })
        this.setData({ assCateg, visible: false })
    },
    async onColumnChange(e) {
        const { column, value } = e.detail;
        if (column === 0) {
            const pid = value[column];
            const res2 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid, level: "L2" } });
            console.log(res2);
            if (res2.result.data && res2.result.data.length) {
                this.setData({ categsL2: res2.result.data });
                const res3 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid: res2.result.data[0]._id, level: "L3" } });
                if (res3.result.data && res3.result.data.length) {
                    this.setData({ categsL3: res3.result.data });
                } else {
                    this.setData({ categsL3: [] });
                }
            } else {
                this.setData({ categsL2: [], categsL3: [] });
            }
        }

        if (column === 1) {
            const pid = value[column];
            const res3 = await wx.cloud.callFunction({ name: "ys_get_categ", data: { pid, level: "L3" } });
            if (res3.result.data && res3.result.data.length) {
                this.setData({ categsL3: res3.result.data });
            } else {
                this.setData({ categsL3: [] });
            }
        }
    },
    /** 上传照片到云端 */
    cloudFile(e) {
        const { files } = e.detail;
        let file = { ...files[0], status: 'loading' }
        let _files = [...this.data.files, file];
        this.setData({ files: _files });
        wx.cloud.uploadFile({
            cloudPath: `goods/${file.name}`,
            filePath: file.url,
        }).then(res => {
            _files.map(_file => {
                if (_file.name === file.name) {
                    _file.status = "done";
                    _file.url = res.fileID;
                }
            })
            this.setData({ files: _files });
        })
    },
    /** 删除云端照片 */
    removeCloudFile(e) {
        const { file } = e.detail;
        const files = this.data.files.filter(item => item.name !== file.name);
        wx.cloud.deleteFile({ fileList: [file.url] }).then(() => this.setData({ files: files }))
    },
    changeIpt(e) {
        var key = e.currentTarget.dataset.key;
        this.setData({
            [key]: e.detail.value
        })
    },
    formSubmit(ev) {
      
        this.setData({ loading: true })
        const params = {
            name: this.data.name,
            // brand: this.data.brand,
            infos: this.data.tables,
            categIds: this.data.assCateg.map(item => item._id),
            swiper: this.data.files.map(item => item.url),
        }
        wx.cloud.callFunction({ name: "ys_add_goods", data: params }).then((res) => {
            Toast({
                context: this,
                selector: '#t-toast',
                message: '添加成功',
                theme: 'success',
                direction: 'column',
            });
            this.setData({ loading: false })
        })
    }
})