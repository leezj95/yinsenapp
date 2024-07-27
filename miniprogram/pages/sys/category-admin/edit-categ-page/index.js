import Toast, { hideToast } from 'tdesign-miniprogram/toast/index';
Page({
    data: {
        loading: false,
        options: [],
        visible: false,
        title: "",
        assCateg: { name: "点击关联组织", _id: "" },
        subItems: [],
        spare: {
            files: [],
            label: "",
            assCateg: { name: "点击关联组织", _id: "" },
        },
        pickerKey: "",
    },
    /** 打开分类选择器 */
    openPicker(e) {
        Toast({
            context: this,
            selector: '#t-toast',
            message: '加载中...',
            theme: 'loading',
            direction: 'column',
        });
        wx.cloud.callFunction({ name: "ys_get_categ", data: { level: "L" } }).then(res => {
            if (res.result.data && res.result.data.length) {
                this.setData({ options: res.result.data.map(item => ({ ...item, name: `${item.level}---${item.name}` })) });
                hideToast({ context: this, selector: '#t-toast' });
            }
        }).then(() => this.setData({ visible: true, pickerKey: e.currentTarget.dataset.value }))
    },
    /** 选择父级分类 */
    onPickerChange(e) {
        const { pickerKey, options } = this.data;
        this.setData({
            [pickerKey]: options.filter(item => item._id == e.detail.value[0])[0]
        });
    },
    /** 上传照片到云端 */
    cloudFile(e) {
        const { files } = e.detail;
        let file = { ...files[0], status: 'loading' }
        this.setData({ "spare.files": [file] });
        wx.cloud.uploadFile({
            cloudPath: `goods/${file.name}`,
            filePath: file.url,
        }).then(res => {
            file.status = "done";
            file.url = res.fileID;
            this.setData({ "spare.files": [file] });
        })
    },
    /** 删除云端照片 */
    removeCloudFile(e) {
        const { file } = e.detail;
        wx.cloud.deleteFile({ fileList: [file.url] }).then(() => this.setData({ "spare.files": [] }))
    },
    changeIptName(e) {
        this.setData({
            [e.currentTarget.dataset.value]: e.detail.value
        })
    },
    clickAdd() {
        const { label, assCateg, files } = this.data.spare;
        if (files.length <= 0) {
            return Toast({
                context: this,
                selector: '#t-toast',
                message: '请上传图片',
                theme: 'warning',
            });
        } else if (label == "") {
            return Toast({
                context: this,
                selector: '#t-toast',
                message: '请输入名称',
                theme: 'warning',
            });
        } else if (assCateg._id == "") {
            return Toast({
                context: this,
                selector: '#t-toast',
                message: '请选择关联组织',
                theme: 'warning',
            });
        }
        const newItem = this.data.subItems;
        newItem.push({ label, file: files[0], assCateg });
        this.setData({ subItems: newItem, "spare.files": [], "spare.assCateg": { name: "点击关联组织", _id: "" } });
    },

    cleanInput(e) {
        this.setData({ "spare.label": "" });
    },
    /** 提交保存 */
    submit() {
        this.setData({ loading: true })
        const data = {
            title: this.data.title,
            categID: this.data.assCateg._id,
            items: this.data.subItems.map(item => ({ label: item.label, img: item.file.url, categID: item.assCateg._id }))
        }
        wx.cloud.callFunction({ name: "ys_add_categ_page_data", data }).then((res) => {
            Toast({
                context: this,
                selector: '#t-toast',
                message: '添加成功',
                theme: 'success',
                direction: 'column',
            });
            this.setData({ loading: false })
        })
    },
})