// components/image-loader/image-loader.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    // 图片来源
    src: {
      type: String,
      value: ''
    },
    // 占位图
    placeholder: {
      type: String,
      value: ''
    },
    // 加载失败时的占位图
    error: {
      type: String,
      value: ''
    },
    // 是否执行懒加载
    lazyload: {
      type: Boolean,
      value: false
    },
    // 图片的弧度
    radius: {
      type: String,
      value: '0%'
    },
    // 图片拉伸模式
    mode: {
      type: String,
      value: 'aspectFill'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 是否加载完成
    loadFinish: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 加载成功
    _loadSuccess: function (e) {
      this.setData({
        loadFinish: true,
      });
      // 外部调用触发方法
      this.triggerEvent('success', e);
    },
    // 加载失败
    _loadFail: function (e) {
      this.setData({
        loadFinish: true,
        src: this.data.error
      });
      // 外部调用触发方式
      this.triggerEvent('fail', e);
    }
  }
})