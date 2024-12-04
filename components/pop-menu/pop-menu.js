// components/pop-menu.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    options: {
      type: Array,
      value: []
    },
    direction: {
      type: String,
      value: 'bottom', // 默认值，可选'top/bottom/left/right/'
      observer(newVal){
        this.setData({
          menuDirectionClass: newVal
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    menuDirectionClass: 'bottom',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // menu的option点击事件
    handleOptionClick(e) {
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('optiontap', { index })
    },
    // 隐藏menu
    hideMenu() {
      this.setData({
        visible: false
      })
    }
  }
})