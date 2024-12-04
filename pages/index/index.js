// index.js
import api from "../../http/api";
const util = require('../../utils/util.js')
const Config = require('../../config/config.js');

let pageNum = 1,
  pageCount = 1,
  tid = 0,
  nextTid = 0,
  lastTid = 0;
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: 'iKAN',
    navBg: app.globalData.navBg,
    height: '',
    sHeight: '',
    duration: 100,
    loading: true,
    tips: '正在加载，请稍后...',
    scrollX: true,
    scrollIntoViewId: '', // 初始化为空
    hidden: true, // 加载更多时底部弹出提示框控制位
    loadingData: false, //数据是否正在加载中，避免用户瞬间多次下滑到底部，发生多次数据加载事件
    crossAxisCount: 3,
    mainAxisGap: 8,
    crossAxisGap: 8,
    currentActiveTab: 0,
    videoList: [],
    tabList: [],
    isLoaded: false,
    lastPageData: [], // 上一页数据
    lastPageCount: 1, // 上一类型总页数
    nextPageData: [], // 下一页数据
    nextPageCount: 1, // 下一类型总页数
    imgPlaceHolder: "/static/images/loading.gif", // 占位图
    imgError: "/static/images/default.png", // 错误时占位图
    mode: "aspectFill" // 图片显示模式
  },

   /**
   * 生命周期函数--监听页面加载
   * 页面加载时，获取窗口高度，设置滚动区域的高度，并获取视频分类列表
   * @param {Object} options - 页面加载时接收的参数
   */
  onLoad(options) {
    // 动态获取滚动区域的高度
    this.getHeight()
    // 获取tab
    this.getTabList();
  },

  /// 设置tab的颜色
  setTabStyle: function () {
    wx.setTabBarStyle({
      color: '#FF0000',
      selectedColor: this.data.navBg,
      // backgroundColor: this.data.navBg,
      success: (res) => { },
      fail: (res) => { },
      complete: (res) => { },
    })
  },

  /// 动态获取显示区域的高度
  getHeight: function () {
    let that = this
    // 获取屏幕尺寸
    const windowInfo = wx.getWindowInfo()
    const windowHeight = windowInfo.windowHeight

    // 根据文档，先创建一个SelectorQuery对象实例
    let query = wx.createSelectorQuery().in(that)
    
    // 选择需要测量的元素
    query.select('.nav-bar').boundingClientRect()
    query.select('.search').boundingClientRect()
    query.select('.scroll-nav').boundingClientRect()
    
    // 执行上面所指定的请求，结果会按照顺序存放于一个数组中，在callback的第一个参数中返回
    query.exec(res => {
      let navbarHeight = res[0].height
      let searchHeight = res[1].height
      let tabHeight = res[2].height
      
      // 计算并设置高度
      const mHeight = windowHeight - navbarHeight
      const svHeight = mHeight - searchHeight - tabHeight - 5
      that.setData({
        height: mHeight,
        sHeight: svHeight
      })
    })
  },

  /// 获取视频分类
  getTabList: function () {
    api.getTabList().then(res => {
      let cateList = res.class //.slice(4);
      // 过滤指定tab
      cateList = util.filterTab(Config.TAB_LIST, cateList)
      // 是否显示18禁内容
      if (!app.globalData.showAllTab) cateList = util.filterTab(Config.SEX_TAB, cateList)
      this.setData({
        tabList: cateList,
      });
    }).then(res => {
      // 获取视频列表
      this.getVideoList(0, pageNum);
    }, reject => {
      this.setData({
        loading: false
      })
    });
  },

  //// 获取分类下的视频列表
  getVideoList: function (index, pageNum) {
    // 显示加载控件
    let that = this
    // 获取tid
    tid = that.data.tabList[index].type_id;
    // tab长度
    let len = that.data.tabList.length;
    // 显示加载动画
    that.setData({
      loading: true
    })
    // 获取当前页数据
    api.getVideoList(tid, pageNum).then(res => {
      pageCount = res.pagecount;
      that.setData({
        videoList: res.list,
      }, () => { // 渲染完成后执行
        that.setData({
          loading: false
        })
      });
    }, reject => {
      that.setData({
        loading: false
      })
    });
    // 预加载上一页数据
    let lastIdx = index - 1 > 0 ? index - 1 : 0;
    lastTid = that.data.tabList[lastIdx].type_id;
    that.getLastPageData(lastTid, 1)
    // 预加载下一页数据
    let nextIdx = index + 1 < len ? index + 1 : len - 1;
    nextTid = that.data.tabList[nextIdx].type_id;
    that.getNextPageData(nextTid, 1);
  },

  /// 加载上一页数据
  getLastPageData: function (ltid, pageNum) {
    api.getVideoList(ltid, pageNum).then(res => {
      this.setData({
        lastPageData: res.list,
        lastPageCount: res.pagecount
      })
    })
  },

  /// 加载下一页数据
  getNextPageData: function (ntid, pageNum) {
    api.getVideoList(ntid, pageNum).then(res => {
      this.setData({
        nextPageData: res.list,
        nextPageCount: res.pagecount
      })
    })
  },

  /// 切换tab
  changeTab: function (e) {
    let index = e.currentTarget.dataset.index;
    if (index === this.data.currentActiveTab) return;
    // 更新当前active tab
    this.setData({
      currentActiveTab: index,
      videoList: [],
    });
    pageNum = 1;
    // 重新获取新Tab下的视频列表
    this.getVideoList(index, pageNum);
  },

  /// 滑动页面
  changePage: function (e) {
    // 当前索引值
    let index = e.detail.current;
    // 页码初始化
    pageNum = 1;
    // 页面滑动的业务处理逻辑
    this.handleChange(index)
  },

  // 滑动处理
  handleChange: function (index) {
    let that = this;
    // tab长度
    let len = that.data.tabList.length;
    // 当前的tid
    tid = that.data.tabList[index].type_id;
    let temp = that.data.videoList;
    if (index > that.data.currentActiveTab) { // 下一页
      that.setData({
        videoList: that.data.nextPageData,
        currentActiveTab: index,
        scrollIntoViewId: 'tabItem' + index, // 更新scroll-into-view的目标ID
        lastPageData: temp,
        lastPageCount: pageCount
      })
      // 更新当前pagecount
      pageCount = that.data.nextPageCount
      // 预加载下一页数据
      let nextIdx = index + 1 < len ? index + 1 : len - 1;
      nextTid = that.data.tabList[nextIdx].type_id;
      that.getNextPageData(nextTid, 1);
    } else { // 上一页
      that.setData({
        videoList: that.data.lastPageData,
        currentActiveTab: index,
        scrollIntoViewId: 'tabItem' + index, // 更新scroll-into-view的目标ID
        nextPageData: temp,
        nextPageCount: pageCount
      })
      // 更新当前pagecount
      pageCount = that.data.lastPageCount
      // 预加载上一页数据
      let lastIdx = index - 1 > 0 ? index - 1 : 0;
      lastTid = that.data.tabList[lastIdx].type_id;
      that.getLastPageData(lastTid, 1)
    }
  },

  // 确保导航条也滚动到对应位置
  scrollToNavItem(index) {
    let that = this;
    // 找到对应的导航项元素并滚动到其可视范围内
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select(`.nav-item[data-index="${index}"]`).boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          wx.pageScrollTo({
            scrollTop: 0,
            scrollLeft: res[0].left,
            duration: 300
          });
        }
      });
    }, 300);
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

  ////下拉刷新
  refresh: function (e) {
    // console.log('下拉刷新.....');
  },

  ////加载更多
  loadMore: function (e) {
    var hidden = this.data.hidden,
      loadingData = this.data.loadingData;
    // 如果正在加载，则返回
    if (loadingData) return;
    // 非正在加载则加载下一页
    pageNum += 1;
    // 如果下页码超出总页码，则返回
    if (pageNum > pageCount) {
      wx.showToast({
        title: '没有其他视频了!!',
        icon: 'none'
      });
      return;
    }
    // 页码未超出总页码执行如下流程
    if (hidden) { // 显示底部的加载提示信息
      this.setData({
        hidden: false,
        loadingData: true
      });
      // 加载下一页
      api.getVideoList(tid, pageNum).then(res => {
        this.setData({
          videoList: this.data.videoList.concat(res.list),
          hidden: true,
          loadingData: false,
        });
      });
    }
  },

  /// 跳转到视频详情页
  navToPlay: function (e) {
    // 获取当前视频资源的baseUrl
    let baseUrl = wx.getStorageSync('baseUrl') || app.globalData.baseUrl //Config.BASE_URL
    let id = e.currentTarget.dataset.id;
    // 组装数据
    const data={
      "api":baseUrl,
      "id":id,
    }
    wx.navigateTo({
      url:`/pages/video/video?data=${encodeURIComponent(JSON.stringify(data))}`
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // console.log('-----onReady-------')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // console.log('-----onShow-------')
    this.setData({
      navBg: app.globalData.navBg,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // console.log('-----onHide-------')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    pageCount = 1, pageNum = 1;
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