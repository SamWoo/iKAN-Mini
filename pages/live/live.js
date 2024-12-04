// pages/live/live.js
const app = getApp()
import channels from '../../config/channel';
import source from '../../config/channel'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: "电视直播",
    navBg: app.globalData.navBg, // 设置NavBar颜色
    heigth: 0,
    tabList: [],
    currentActiveTab: 0,
    objectFit: 'contain', // 当视频大小与 video 容器大小不一致时，视频的表现形式
    autoPlay: true, // 是否自动播放
    controls: true, // 是否显示默认播放控件
    showSnapshotBtn: true, // 是否显示截屏按钮，仅在全屏时显示
    showScreenLockBtn: true, // 是否显示锁屏按钮，仅在全屏时显示，锁屏后控制栏的操作
    showMuteBtn: true, // 是否显示静音按钮
    enablePlayGesture: true, // 是否开启播放手势，即双击切换播放/暂停
    enableAutoRotation: true, // 是否开启手机横屏时自动全屏，当系统设置开启自动旋转时生效
    enableProgressGesture: false, // 是否开启控制进度的手势
    showCastingBtn: true, // 显示投屏按钮
    playBtnPosition:'center',
    channelList: [],
    channel_name: "CCTV-1",
    live_url: "http://ottrrs.hl.chinamobile.com/PLTV/88888888/224/3221226016/index.m3u8",
    currentLeftIndex: 0,
    currentRightIndex: 0,
    rightItemWidth: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取channel区高度
    this.getHeight();
    // 获取tab
    this.getTabList();
    this.setData({
      videoCtx: wx.createVideoContext('myVideo', this)
    });
  },

  /// 动态获取channel区的高度
  getHeight: function () {
    let that = this
    // 获取屏幕尺寸
    const windowInfo = wx.getWindowInfo()
    const windowHeight = windowInfo.windowHeight
    // 根据文档，先创建一个SelectorQuery对象实例
    let query = wx.createSelectorQuery().in(that)
    query.select('.nav-bar').boundingClientRect()
    query.select('.display').boundingClientRect()
    query.select('.scroll-nav').boundingClientRect()
    query.select('.nav-right').boundingClientRect()
    // 获取尺寸数据
    query.exec(res => {
      that.setData({
        height: (windowHeight - res[0].height - res[1].height - res[2].height - 4),
        rightItemWidth: (res[3].width - 3 * 4 - 12) / 4
      })
    })
  },

  /// 获取Tab
  getTabList: function () {
    let mList = []
    // 获取tab
    source.forEach(it => {
      mList.push(it.category)
    });
    // 更新界面
    this.setData({
      tabList: mList,
      channelList: source[0].channel
    })
  },

  /// 切换Tab
  changeTab: function (e) {
    let index = e.currentTarget.dataset.index
    if (index === this.data.currentActiveTab) return
    // 更新当前 active tab
    this.setData({
      currentActiveTab: index,
      channelList: source[index].channel,
      currentLeftIndex: 0,
      currentRightIndex: 0,
      channel_name: source[index].channel[0].name,
      live_url: source[index].channel[0].urls[0]
    })
  },

  /// 左导航点击事件
  bindLeftItemTap: function (e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      currentLeftIndex: index,
      currentRightIndex: 0,
      channel_name: this.data.channelList[index].name,
      live_url: this.data.channelList[index].urls[0]
    })
  },

  /// 右导航点击事件
  bindRightItemTap: function (e) {
    const { index } = e.currentTarget.dataset;
    let leftIndex = this.data.currentLeftIndex;
    this.setData({
      currentRightIndex: index,
      channel_name: this.data.channelList[leftIndex].name,
      live_url: this.data.channelList[leftIndex].urls[index]
    })
  },

  /// 全屏切换
  fullScreenChange: function (e) {
    let isFull = e.detail.fullScreen;
    if (isFull) {
      this.setData({
        objectFit: 'fill'
      });
    }
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
    // console.log('tv show.......')
    this.data.videoCtx.play()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // console.log('tv hide.....')
    this.data.videoCtx.stop()
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