// pages/setting/setting.js
const util = require('../../utils/util.js');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '设置',
    navBg: '',
    scanResult: '',
    rgb: 'rgb(0,154,97)',
    pick: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log('color--->>>',app.globalData.navBg)
    this.setData({
      navBg: app.globalData.navBg,
    });
  },

  showColorPannel: function (e) {
    this.setData({
      pick: true,
    });
  },

  // 取色结果回调
  pickColor: function (e) {
    let rgb = e.detail.color;
    app.globalData.navBg = util.rgb2hex(rgb),
    this.setData({
      rgb: rgb,
      navBg: app.globalData.navBg
    });
    // 保存主题色到缓存
    wx.setStorageSync("themeColor", app.globalData.navBg)
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