import TabMenu from './data';

Component({
  data: {
    active: 0,
    list: TabMenu,
  },

  methods: {
    init() {
      const page = getCurrentPages().pop();
      const route = page ? page.route.split('?')[0] : '';
      const active = this.data.list.findIndex(
        (item) =>
          (item.url.startsWith('/') ? item.url.substr(1) : item.url) ===
          `${route}`,
      );
      this.setData({ active });
    },
    onChange(event) {
      const _val = event.detail.value;
      const _url = this.data.list[_val || 0].url;
      this.setData({ active: _val });
      wx.switchTab({ url: _url.startsWith('/') ? _url : `/${_url}` });
    },
  },
});
