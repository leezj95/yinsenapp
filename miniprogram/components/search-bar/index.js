// components/search-bar/index.js
Component({
  data: {
    value: ""
  },
  methods: {
    onChange: function (ev) {
      this.setData({ value: ev.detail.value })
    },
    onClickSearch: function () {
      this.triggerEvent("search", { value: this.data.value })
    }
  }
})