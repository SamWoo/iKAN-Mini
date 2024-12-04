// pages/music/music.js
const app = getApp();
import { MUSIC_BASE_URL } from '../../config/config'
let pageCount = 0, pageNum = 1, keyword = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '音乐',
    navBg: app.globalData.navBg,
    loading: true,
    tips: '正在加载，请稍后...',
    height: '',
    sHeight: '',
    inputValue: '',
    isFocus: false,
    xmlData: '',
    songs: [],
    currentIndex: app.globalData.currentSongIndex, // 当前播放歌曲的index
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 动态获取滚动区域的高度
    this.getHeight();
    // 获取xml数据
    this.fetchXMLData(pageNum);
  },

  /// 动态获取显示区域的高度
  getHeight: function () {
    let that = this
    // 获取屏幕尺寸
    const windowInfo = wx.getWindowInfo()
    const windowHeight = windowInfo.windowHeight
    // 根据文档，先创建一个SelectorQuery对象实例
    let query = wx.createSelectorQuery().in(that)
    query.select('.nav-bar').boundingClientRect()
    query.select('.search-row').boundingClientRect()
    // 执行上面所指定的请求，结果会按照顺序存放于一个数组中，在callback的第一个参数中返回
    query.exec(res => {
      let navbarHeight = res[0].height
      let searchHeight = res[1].height
      const mHeight = windowHeight - navbarHeight
      const svHeight = mHeight - searchHeight - 5
      that.setData({
        height: mHeight,
        sHeight: svHeight
      })
    })
  },

  /// 获取xml数据
  fetchXMLData: function (page) {
    try {
      let that = this;
      wx.request({
        url: MUSIC_BASE_URL + '/cate/1-' + page + '.html',
        method: 'GET',
        success: (res) => {
          // 隐藏加载控件
          if (pageNum == 1) that.setData({ loading: false })
          // 解析数据
          this.data.xmlData = res.data;
          this.parseAndHandleXML();
        },
        fail: (err) => {
          console.log('Request fail!', err);
        }
      })
    } catch (error) {
      console.log('err---->>>', error)
    }
  },

  /// 处理xml
  parseAndHandleXML: function () {
    const { xmlData } = this.data;
    const { parseXML } = require('../../utils/parseXML');

    try {
      const xmlDoc = parseXML(xmlData);
      const els = xmlDoc.getElementsByClassName('f14')
      // 解析
      let names = [];
      const regex = /伴奏/;
      for (let i = 0; i < els.length; i++) {
        let name = els[i].textContent.trim();
        // 剔除含有伴奏的信息
        if (regex.test(name)) continue;
        let url = els[i].getElementsByTagName('a')[0].getAttribute("href");
        let obj = { ['name']: name, ['url']: url }
        names.push(obj)
      }
      this.setData({
        songs: this.data.songs.concat(names)
      })
      // 获取总页码
      if (pageCount == 0) {
        pageCount = xmlDoc.getElementsByClassName('pageRemark')[0].getElementsByTagName('b')[0].textContent
      }
      // 如果当前页数据量不足20条则加载更多
      if (this.data.songs.length < 20) this.loadMore()
    } catch (error) {
      console.error('Failed to parse XML：', error);
    }
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
    this.fetchXMLData(pageNum);
  },

  /// 点击跳转到播放界面
  playMusic: function (e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      currentIndex: index
    })
    // 更新全局变量
    app.globalData.currentSongIndex = this.data.currentIndex
    // 跳转播放界面
    wx.navigateTo({
      url: '/pages/playMusic/playMusic?index=' + index + '&playlist=' + encodeURIComponent(JSON.stringify(this.data.songs)),
    })
  },

  /// 输入框的值该改变 就会触发的事件
  handleInput: function (e) {
    // 1 获取输入框的值 解构
    var value = e.detail.value;
    // 2 检验合法性（判断是不是全是空格）
    if (!value.trim()) {
      // 当值为空时则清楚内容并且隐藏按键
      this.setData({
        isFocus: false
      })
      // 值不合法
      return;
    }
    this.setData({
      isFocus: true,
      inputValue: value.trim(),
    });
  },

  /// 搜索动作
  handleSearch: function (e) {
    // 获取输入框内容
    keyword = this.data.inputValue;
    // 空值直接返回
    if (!keyword) {
      wx.showToast({
        title: '输入的是空字符!',
        icon: 'error',
        duration: 2000
      })
      return;
    }

    // 更新界面
    this.setData({
      inputValue: "",
      isFocus: false,
    });

    // 跳转到搜索结果页面
    wx.navigateTo({
      url: '/pages/searchMusic/searchMusic?kw=' + keyword,
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
    this.setData({
      navBg: app.globalData.navBg,
      currentIndex: app.globalData.currentSongIndex
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    app.globalAudioCtx.stop() // 关停当前播放的音频
    // app.globalAudioCtx.offEnded() // 移除音频自然播放至结束的事件的监听函数
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时取消监听
    this.pageEventChannel && this.pageEventChannel.off('update')
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