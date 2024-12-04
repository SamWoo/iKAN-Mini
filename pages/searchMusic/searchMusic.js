// pages/searchMusic/searchMusic.js
import { MUSIC_SEARCH_URL } from '../../config/config'
const app = getApp();
let keyword = '', pageNum = 1, pageCount = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    navBg: app.globalData.navBg,
    loading: true,
    tips: '正在加载，请稍后...',
    height: '',
    songs: [],
    isEmpty: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 动态获取滚动区域的高度
    this.getHeight();
    // 获取搜索关键字
    keyword = options.kw;
    this.setData({
      title: '与"' + keyword + '"相关'
    });
    // 请求数据
    this.fetch(pageNum, keyword)
  },

  // 动态获取显示区域的高度
  getHeight: function () {
    let that = this
    // 获取屏幕尺寸
    const windowInfo = wx.getWindowInfo()
    const windowHeight = windowInfo.windowHeight
    // 根据文档，先创建一个SelectorQuery对象实例
    let query = wx.createSelectorQuery().in(that)
    query.select('.nav-bar').boundingClientRect()
    // 执行上面所指定的请求，结果会按照顺序存放于一个数组中，在callback的第一个参数中返回
    query.exec(res => {
      let navbarHeight = res[0].height
      const mHeight = windowHeight - navbarHeight
      that.setData({
        height: mHeight,
      })
    })
  },

  /// 获取数据
  fetch: function (page, key) {
    let that = this;
    wx.request({
      url: MUSIC_SEARCH_URL + "&page=" + page + "&word=" + key,
      method: 'GET',
      success: (res) => {
        // 隐藏加载控件
        if (page == 1) that.setData({ loading: false })
        let xData = res.data.data;
        pageCount = Math.floor(res.data.count / 50);
        let names = [];
        const regex = /伴奏/;
        for (let i = 0; i < xData.length; i++) {
          let title = xData[i].title
          // 剔除含有伴奏的信息
          if (regex.test(title)) continue;
          // 使用正则表达式提取title和href值
          var name = title.match(/title="(.*?)"/)[1].trim();
          var url = title.match(/href="(.*?)"/)[1];
          let obj = { ['name']: name, ['url']: url }
          names.push(obj)
        }
        // 此句是为下面isEmpty判空服务
        that.data.songs = that.data.songs.concat(names)
        // 刷新页面
        that.setData({
          songs: that.data.songs,
          isEmpty: that.data.songs.length === 0
        })
        // 如果当前页数据量不足20条则加载更多
        if (that.data.songs.length < 20) that.loadMore()
      },
      fail: (err) => {
        console.error('Failed error!', err);
      }
    })
  },

  // 加载更多数据
  loadMore: function () {
    pageNum++;
    if (pageNum > pageCount) {
      wx.showToast({
        title: '没有其他资源了!!',
        icon: 'none'
      });
      return;
    };
    // 加载下一页
    this.fetch(pageNum, keyword);
  },

  /// 点击跳转到播放界面
  playMusic: function (e) {
    let index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '/pages/playMusic/playMusic?index=' + index + '&playlist=' + encodeURIComponent(JSON.stringify(this.data.songs)),
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
    pageNum = 1;
    pageCount = 0;
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