// pages/searchResult/searchResult.js
import api from "../../http/api";

const app = getApp();

let pageNum = 1, pageCount = 1, keyword = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    navBg: app.globalData.navBg,
    height: '',
    loading: true,
    tips: '正在加载，请稍后...',
    hidden: true,
    loadingData: false, //数据是否正在加载中，避免用户瞬间多次下滑到底部，发生多次数据加载事件
    crossAxisCount: 3,
    mainAxisGap: 8,
    crossAxisGap: 8,
    currentActiveTab: 0,
    videoList: [],
    isEmpty: false,
    imgPlaceHolder: "/static/images/loading.gif", // 占位图
    imgError: "/static/images/default.png", // 错误时占位图
    mode: "aspectFill" // 图片显示模式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 动态获取滚动区域的高度
    this.getHeight()
    let that = this
    // 获取搜索关键字
    keyword = options.kw;
    that.setData({
      title: '与"' + keyword + '"相关'
    });
    // 服务器获取数据
    api.searchVideoByKw(keyword, pageNum).then(res => {
      pageCount = res.pagecount;
      // console.log('res---->>>>',res.list)
      that.setData({
        videoList: res.list,
        isEmpty: res.list.length === 0
      }, () => {// 渲染完成后执行
        that.setData({
          loading: false
        })
      });
    });
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

  /// 加载完成
  bindSuccess: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index
  },

  /// 加载失败
  bindFail: function (e) {
    // console.log('图片加载失败',e)
  },

  /// 缩略图加载出错时显示默认图片
  loadError: function (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      [`videoList[${index}].vod_pic`]: '../../static/images/default.png'
    });
  },

  ////加载更多
  loadMore: function (e) {
    pageNum += 1;
    if (pageNum > pageCount) {
      wx.showToast({
        title: '没有更多视频了!!',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    var hidden = this.data.hidden,
      loadingData = this.data.loadingData;
    if (hidden) {
      this.setData({
        hidden: false,
      });
    }
    if (loadingData) return;
    this.setData({
      loadingData: true,
    });

    // 加载下一页
    api.searchVideoByKw(keyword, pageNum).then(res => {
      this.setData({
        videoList: this.data.videoList.concat(res.list),
        hidden: true,
        loadingData: false,
      });
    });
  },

  /// 跳转到视频详情页
  navToPlay: function (e) {
    // 获取当前视频资源的baseUrl
    let baseUrl = wx.getStorageSync('baseUrl') || app.globalData.baseUrl //Config.BASE_URL
    let id = e.currentTarget.dataset.id;
    // 组装数据
    const data = {
      "api": baseUrl,
      "id": id,
    }
    // 跳转到播放界面
    wx.navigateTo({
      url: `/pages/video/video?data=${encodeURIComponent(JSON.stringify(data))}`
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
    // 清空上次数据
    pageNum = 1, pageCount = 1;
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