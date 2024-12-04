// pages/favourite/favourite.js
const util = require('../../utils/util.js')
const app = getApp();
const createRecycleContext = require('miniprogram-recycle-view')
let favourites = [],
  ctx;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '收藏',
    navBg: app.globalData.navBg,
    height: '',
    isEmpty: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 动态获取滚动区域的高度
    this.getHeight()
    // 获取收藏列表
    this.getFavList()
  },

  // 动态获取显示区域的高度
  getHeight: function () {
    let that = this
    // 获取屏幕尺寸
    const windowInfo = wx.getWindowInfo()
    const windowHeight = windowInfo.windowHeight
    wx.createSelectorQuery().select(".nav-bar").boundingClientRect(res => {
      const navBarHeight = res.height
      that.setData({
        height: (windowHeight - navBarHeight - 10)
      })
    }).exec()
  },

  /// 获取收藏记录
  getFavList: function () {
    let temp = wx.getStorageSync('favourites')
    favourites = temp ? temp.reverse() : []
    if (favourites.length) {
      this.setData({
        isEmpty: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    ctx = createRecycleContext({
      id: 'recycleId',
      dataKey: 'videoList',
      page: this,
      itemSize: this.itemSizeFunc
    })
    // 添加数据
    ctx.append(favourites)
  },

  /// 自定义每个item的尺寸
  itemSizeFunc: function (item, idx) {
    return {
      width: util.rpx2px(750),
      height: util.rpx2px(160)
    }
  },

  /// 点击跳转到播放界面
  bindTap: function (e) {
    let index = e.currentTarget.dataset.index
    let baseUrl = favourites[index].api
    let vid = favourites[index].vod_id
    let play_index = favourites[index].play_index
    // 组装数据
    const data = {
      "api": baseUrl,
      "id": vid,
      "play_index": play_index
    }
    wx.navigateTo({
      url: `/pages/video/video?data=${encodeURIComponent(JSON.stringify(data))}`
    })
  },

  /// 取消收藏
  cancleLike: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index
    wx.showModal({
      title: '温馨提示',
      content: '确认取消收藏吗?',
      complete: (res) => {
        if (res.cancel) {
          return
        }
        if (res.confirm) {
          favourites.splice(index, 1)
          if (!favourites.length) {
            that.setData({
              isEmpty: true
            })
          }
          ctx.update(0, favourites, (res) => {
            // 重新保存到缓存中
            wx.setStorage({
              key: "favourites",
              data: favourites,
              success: res => {
                wx.showToast({
                  title: '取消收藏',
                  icon: 'success',
                  duration: 1000
                });
              },
              fail: res => {
                wx.showToast({
                  title: '取消失败',
                  icon: 'error'
                })
              },
            });
          })
        }
      }
    })
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
    favourites = []
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