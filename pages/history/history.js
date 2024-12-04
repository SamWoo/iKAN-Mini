// pages/history/history.js
const util = require('../../utils/util.js')
const app = getApp();
const createRecycleContext = require('miniprogram-recycle-view')
let histories = [],
  ctx;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '浏览历史',
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
    // 获取浏览记录
    this.getHistories()
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

  /// 获取浏览历史记录
  getHistories: function () {
    let temp = wx.getStorageSync('histories')
    histories = temp ? temp.reverse() : []
    if (histories.length) {
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
    ctx.append(histories)
  },

  /// 自定义每个item的尺寸
  itemSizeFunc: function (item, idx) {
    return {
      width: util.rpx2px(750),
      height: util.rpx2px(180)
    }
  },

  /// 点击跳转到播放界面
  bindTap: function (e) {
    let index = e.currentTarget.dataset.index
    let baseUrl = histories[index].api
    let vid = histories[index].vod_id
    let play_index = histories[index].play_index
    let initial_time = histories[index].play_percent * histories[index].duration / 100
    // 组装数据
    const data = {
      "api": baseUrl,
      "id": vid,
      "play_index": play_index,
      "initial_time": initial_time
    }
    // 跳转到播放界面
    wx.navigateTo({
      url: `/pages/video/video?data=${encodeURIComponent(JSON.stringify(data))}`
    })
  },

  /// 长按删除该条数据
  handleLongPress: function (event) {
    let that = this;
    const index = event.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条历史记录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          // 删除操作
          if (index !== -1) {
            histories.splice(index, 1);
            if (!histories.length) {
              that.setData({
                isEmpty: true
              })
            }
            ctx.update(0, histories, res => {
              // 重新保存到缓存中
              wx.setStorage({
                key: "histories",
                data: histories,
                success: res => {
                  wx.showToast({
                    title: '删除成功!',
                    icon: 'success',
                    duration: 1000
                  });
                },
                fail: res => {
                  wx.showToast({
                    title: '删除失败!',
                    icon: 'error',
                    duration: 1000,
                  })
                },
              });
            })
          }
        }
      },
    });
  },

  /// 删除所有记录
  delAll: function (e) {
    wx.showModal({
      title: '温馨提示',
      content: '确认清空浏览历史吗?',
      complete: res => {
        if (res.cancel) return
        histories.splice(0, 999)
        ctx.update(0, histories, (res) => {
          // 重新保存到缓存中
          wx.setStorage({
            key: "histories",
            data: histories,
            success: res => {
              wx.showToast({
                title: '删除成功!',
                icon: 'success',
                duration: 2000
              });
            },
            fail: res => {
              wx.showToast({
                title: '删除失败!',
                icon: 'error',
                duration: 2000
              })
            },
          });
        })
      },
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
    histories = []
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