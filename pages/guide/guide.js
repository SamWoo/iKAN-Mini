// pages/guide/guide.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '使用说明',
    navBg: app.globalData.navBg,
    loading: true,
    tips: '正在加载，请稍后...',
    height: 0,
    article: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 动态获取滚动区域的高度
    this.getHeight()
    // 获取文件信息
    this.getInfo()
  },

  /// 动态获取显示区域的高度
  getHeight: function () {
    let that = this
    // 获取屏幕尺寸
    const windowInfo = wx.getWindowInfo()
    const windowHeight = windowInfo.windowHeight
    // 获取滚动区高度
    wx.createSelectorQuery().select(".nav-bar").boundingClientRect(function (rect) {
      const navBarHeight = rect.height
      that.setData({
        height: (windowHeight - navBarHeight - 10)
      })
    }).exec()
  },

  /// 获取操作说明
  getInfo: function () {
    let that = this;
    // 网络请求资源(已被禁)
    wx.request({
      url: 'https://raw.githubusercontent.com/SamWoo/iKAN/master/README.md',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: res => {
        // console.log('res----->>>>',res.data)
        let data = app.towxml(res.data, 'markdown', {
          theme: 'light',
          events: {      //为元素绑定的事件方法
            tap: e => {
              console.log('tap', e);
            },
            change: e => {
              console.log('todo', e);
            }
          }
        });
        that.setData({
          loading: false,
          article: data
        })
      },
      fail: err => { 
        console.log('err---->>>',err)
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})