import Toast from 'tdesign-miniprogram/toast/index';

Page({
    data: {
        options: [],
        visible: false,
        level: 0,
        parentCategory: { name: "点击选择父级分类" },
        category: "",
        loading: false
    },
    /** 层级选择器 */
    onChangeLevel(e) {
        const currentValue = e.detail.value;
        this.setData({ level: currentValue });
        if (currentValue != 0) {
            wx.cloud.callFunction({ name: "ys_get_categ", data: { level: "L" + currentValue } }).then(res => {
                if (res.result.data && res.result.data.length) {
                    this.setData({ options: res.result.data });
                }
            })
        }
    },
    /** 打开分类选择器 */
    openPicker() {
        if (this.data.level != 0) this.setData({ visible: true });
    },
    /** 选择父级分类 */
    onPickerChange(e) {
        this.setData({ parentCategory: this.data.options.filter(item => item.value == e.detail.value[0])[0] });
    },
    /** 编辑分类 */
    changeCategory(e) {
        this.setData({ category: e.detail.value })
    },
    /** 提交保存 */
    submit() {
        this.setData({ loading: true })
        const data = {
            p_id: this.data.level == 0 ? null : this.data.parentCategory._id,
            name: this.data.category,
            level: `L${this.data.level + 1}`
        }
        wx.cloud.callFunction({ name: "ys_add_categ", data }).then((res) => {
            Toast({
                context: this,
                selector: '#t-toast',
                message: '添加成功',
                theme: 'success',
                direction: 'column',
            });
        })
    },

    cleanInput() {
        this.setData({ category: "", level: 0, parentCategory: { name: "点击选择父级分类" }, loading: false, options: [] })
    }
})