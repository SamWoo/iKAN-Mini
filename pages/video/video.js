// pages/video/video.js
import api from "../../http/api";

const util = require('../../utils/util.js')
const app = getApp();
/// 剧集
let anthologies = [],
  favourites = [],
  histories = [],
  duration = 0,
  currentTime = 0,
  baseUrl = '';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    warn_content: '温馨提示：视频中出现的广告由视频源地址产生，与本软件无关！遇到广告请滑动界面快进跳过，请勿轻信视频中出现的任何广告信息，以免遭遇网络诈骗！切记！切记！切记！！',
    animationData: {},
    navBg: app.globalData.navBg, // 设置NavBar颜色
    height: '',
    topNum: 0,
    scrollTop: false,
    currentIndex: 0,
    initialTime: 0, // 指定视频初始播放位置
    objectFit: 'contain', // 当视频大小与 video 容器大小不一致时，视频的表现形式
    autoPlay: true, // 是否自动播放
    controls: true, // 是否显示默认播放控件
    showSnapshotBtn: true, // 是否显示截屏按钮，仅在全屏时显示
    showScreenLockBtn: true, // 是否显示锁屏按钮，仅在全屏时显示，锁屏后控制栏的操作
    showMuteBtn: true, // 是否显示静音按钮
    showCenterPlayBtn: true, //是否显示视频中间的播放按钮
    enablePlayGesture: true, // 是否开启播放手势，即双击切换播放/暂停
    enableAutoRotation: true, // 是否开启手机横屏时自动全屏，当系统设置开启自动旋转时生效
    enableProgressGesture: true, // 是否开启控制进度的手势
    showCastingBtn: true, // 显示投屏按钮
    playBtnPosition: 'center', // 播放按钮位置
    mode: ['pop', 'push'],
    vod_id: '',
    vod_name: '',
    vod_pic: '',
    vod_play_url: '',
    vod_area: '',
    vod_actor: '',
    vod_class: "",
    vod_director: '',
    vod_remarks: '',
    vod_state: '',
    vod_year: '',
    type_name: '',
    vod_time: '',
    vod_content: '',
    vod_lang: '',
    playUrlList: [],
    isLike: false,
    itemWidth: 0,
    isFull: false, // 是否全屏
    isTap: false, // 全屏时点击video界面
    showPopup: false, // 显示剧集区域
    popupHeight: '', // 弹窗高度
    direction: '', // 全屏时的方向
    isMenuVisible: false, // 播放速度弹窗
    menuDirection: 'left', // menu弹窗弹窗的方向
    menuOptions: [
      { 'label': 'x0.5', 'value': 0.5 },
      { 'label': 'x0.8', 'value': 0.8 },
      { 'label': 'x1.0', 'value': 1.0 },
      { 'label': 'x1.25', 'value': 1.25 },
      { 'label': 'x1.5', 'value': 1.5 },
      { 'label': 'x2.0', 'value': 2.0 },
    ], // 播放速率
    timerId: null, // 定时器id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.videoContext = wx.createVideoContext('myVideo')
    // 清空之前数据记录
    anthologies = [], favourites = [], histories = [];
    // 动态获取滚动区域的高度
    this.getSize()
    // 获取当前视频的相关数据
    const data = JSON.parse(decodeURIComponent(options.data))
    // 获取当前视频资源的baseUrl
    baseUrl = data.api;
    // 获取ID
    let id = data.id;
    // 获取上次退出时保存的播放url
    let play_index = data.play_index || 0;
    // console.log('last_url----->>>', play_index)
    // 获取上次播放的时间
    let time = data.initial_time || 0
    // console.log('time----->>>', time)
    // 更新界面数据
    this.setData({
      vod_id: id,
      currentIndex: play_index,
      initialTime: time,
    });
    // 获取收藏缓存信息
    this.getInfo('favourites');
    // 获取历史记录缓存信息
    this.getInfo('histories');
    // 获取视频详情
    this.getVideoById(baseUrl, id);
    // 提示自动跳到上次播放记录处
    if (time !== 0 && time !== undefined) {
      wx.showToast({
        title: '已自动跳转到上次播放处',
        icon: 'none',
        duration: 2000,
      })
    }
  },

  // 动态获取显示区域的高度
  getSize: function () {
    let that = this
    // 获取屏幕尺寸
    const windowInfo = wx.getWindowInfo()
    const windowHeight = windowInfo.windowHeight
    // 根据文档，先创建一个SelectorQuery对象实例
    let query = wx.createSelectorQuery().in(that)
    query.select('.nav-bar').boundingClientRect()
    query.select('.play-video').boundingClientRect()
    query.select('.warn').boundingClientRect()
    query.select('.anth-wrapper').boundingClientRect()
    // 执行上面所指定的请求，结果会按照顺序存放于一个数组中，在callback的第一个参数中返回
    query.exec(res => {
      let navbarHeight = res[0].height
      let videoHeight = res[1].height
      let warnHeight = res[2].height
      let wrapperWidth = res[3].width
      that.setData({
        height: (windowHeight - navbarHeight - videoHeight - warnHeight - 10),
        itemWidth: util.px2rpx(wrapperWidth) / 4
      })
    })
  },

  /// 获取缓存文件
  getInfo: function (type) {
    let that = this;
    // 先获取storage中的数据
    wx.getStorage({
      key: type,
      success: res => {
        if (type === 'favourites') {
          favourites = res.data
          for (var it of favourites) {
            if (it.vod_id === that.data.vod_id && it.isLike) {
              that.setData({
                isLike: it.isLike
              });
            }
          }
        } else {
          histories = res.data
        }
      },
      fail: res => {
        // console.log('err--->>', res);
      }
    });
  },

  /// 通过ID获取视频详情
  getVideoById: function (url, id) {
    let that = this
    api.getVideoById(url, id).then(res => {
      let info = res.list[0];
      that.handlerPlayUrls(info.vod_play_url);
      that.setData({
        vod_id: info.vod_id,
        vod_name: info.vod_name,
        vod_pic: info.vod_pic,
        vod_play_url: anthologies[that.data.currentIndex].url,
        vod_area: info.vod_area,
        vod_actor: info.vod_actor,
        vod_class: info.vod_class,
        vod_director: info.vod_director,
        vod_year: info.vod_year,
        type_name: info.type_name,
        vod_time: info.vod_time,
        vod_content: info.vod_content,
        vod_lang: info.vod_lang,
        vod_remarks: info.vod_remarks,
        vod_state: info.vod_state,
        playUrlList: anthologies,
      });
    });
  },

  /// 处理剧集
  handlerPlayUrls: function (urls) {
    if (util.isNotEmptyStr(urls)) {
      if (urls.startsWith("https://") && urls.endsWith('m3u8')) {
        anthologies.add({
          "name": "HD",
          "url": urls
        });
      } else {
        let urlList = urls.split("\$\$\$");
        for (var it of urlList) {
          if (it.endsWith('m3u8') || (it.endsWith('m3u8#'))) {
            it.split('#').forEach(s => {
              if (s.endsWith('m3u8')) {
                anthologies.push({
                  "name": s.split('\$')[0],
                  "url": s.split('\$')[1]
                });
              }
            });
          }
        }
      }
    }
  },

  /// 切换视频播放源
  changeVideo: function (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      autoPlay: true,
      currentIndex: index,
      vod_play_url: anthologies[index].url,
      initialTime: 0,
    });
  },

  /// 全屏切换
  fullScreenChange: function (e) {
    let fullScreen = e.detail.fullScreen;
    this.setData({
      isFull: fullScreen,
      direction: e.detail.direction,
      objectFit: fullScreen ? 'fill' : ''
    });
  },

  /// 收藏
  addLike: function (e) {
    if (duration === 0) {
      wx.showToast({
        title: '视频加载中...',
        duration: 1500,
        icon: 'loading'
      })
      return
    }
    let that = this;
    that.animate('.icon-like', [{
      scale: !that.data.isLike ? [0.1, 0.1] : [1.5, 1.5],
      rotate: 0,
      ease: 'ease-out'
    },
    {
      scale: !that.data.isLike ? [1.5, 1.5] : [0.1, 0.1],
      rotate: 0,
      ease: 'ease-in'
    },
    ], 500, function () {
      that.clearAnimation('.icon-like', function () {
        // console.log("清除了.icon-like上的所有动画属性")
      })
    }.bind(that))
    // 切换收藏图标样式
    that.setData({
      isLike: !that.data.isLike,
    });
    // 保存收藏信息
    let info = {
      "api": baseUrl,
      "vod_id": that.data.vod_id,
      "vod_name": that.data.vod_name,
      "vod_pic": that.data.vod_pic,
      "vod_class": that.data.vod_class,
      "vod_lang": that.data.vod_lang,
      "vod_area": that.data.vod_area,
      "vod_year": that.data.vod_year,
      "vod_actor": that.data.vod_actor,
      "isLike": that.data.isLike,
      "play_index": that.data.currentIndex
    };

    if (that.data.isLike) {
      favourites.push(info);
    } else {
      favourites = favourites.filter(it => it.vod_id !== that.data.vod_id)
    }

    // 保存到收藏缓存中
    wx.setStorage({
      key: "favourites",
      data: favourites,
      success: res => {
        wx.showToast({
          title: that.data.isLike ? '收藏成功' : '取消收藏',
          icon: 'none'
        });
      },
      fail: res => {
        wx.showToast({
          title: '收藏失败',
          icon: 'none'
        })
      },
    });
  },

  /// 获取视频元数据
  loadedMetaData: function (e) {
    duration = parseInt(e.detail.duration) // 单位秒
  },

  /// 更新播放时间
  timeUpdate: function (e) {
    currentTime = parseInt(e.detail.currentTime)
  },

  /// 播放完成后自动播放下一集
  playNext: function (e) {
    let nextIndex = this.data.currentIndex + 1
    if (nextIndex >= anthologies.length) {
      wx.showToast({
        title: '没有下一集了!',
        icon: 'none',
        duration: 1500,
      })
      return
    }
    // 有下一集自动播放下一集
    this.setData({
      autoPlay: true,
      currentIndex: nextIndex,
      vod_play_url: anthologies[nextIndex].url,
      initialTime: 0
    });
  },

  /// 播放出错时处理
  playError: function (e) {
    wx.showToast({
      title: '抱歉，当前资源无法正常播放！',
      icon: 'none',
      duration: 3000,
    })
  },

  /// 全屏时点击video界面显示剧集图标
  tapScreen: function (e) {
    let that = this
    const { timerId } = that.data
    if (that.data.isFull) {
      that.setData({
        isTap: true
      })
      // 定时5s后自动隐藏剧集图标
      setTimeout(() => {
        that.setData({
          isTap: false,
        })
      }, 5000);

      // 如果当前右侧弹窗弹出状态则隐藏弹窗
      if (that.data.showPopup) {
        that.setData({
          showPopup: false
        })
      }
      // 如果当前播放速度menu是visible状态则隐藏
      if (that.data.isMenuVisible) {
        that.setData({
          isMenuVisible: false
        })
      }
    }
  },

  /// 点击剧集图标弹出剧集窗口
  showPopup: function (e) {
    let that = this;
    // 获取屏幕尺寸
    const windowInfo = wx.getWindowInfo()
    const windowHeight = windowInfo.windowHeight
    // 根据文档，先创建一个SelectorQuery对象实例
    let query = wx.createSelectorQuery().in(that)
    query.select('.anth-title').boundingClientRect()
    query.exec(res => {
      let titleHeight = res[0].height;
      // 底部偏移量
      const offset = that.data.direction == 'vertical' ? 20 : 40;
      const mH = windowHeight - titleHeight - offset;
      that.setData({
        popupHeight: mH
      })
    })
    // 更新界面
    that.setData({
      isTap: false,
      showPopup: true,
    });
    // 弹窗弹出动画
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-in-out',
    });
    animation.translateX('-30%').step();
    that.setData({
      animationData: animation.export()
    });
  },

  /// 点击弹出区域
  hidePopup: function (e) {
    this.setData({
      showPopup: false
    })
  },

  /// 点击速率图标弹窗menu
  showSpeedMenu: function (e) {
    let that = this
    that.setData({
      isMenuVisible: true,
      isTap: false
    })
    // 定时5s后自动隐藏剧集图标
    // setTimeout(() => {
    //   that.setData({
    //     isMenuVisible: false,
    //   })
    // }, 5000);
  },

  /// 点击不同的速率option
  handleOptionTap: function (e) {
    let index = e.detail.index
    let speed = this.data.menuOptions[index].value
    // console.log('speed----->>>',speed)
    // 调整播放速率
    this.videoContext.playbackRate(speed)
    // 隐藏速率menu
    this.setData({
      isMenuVisible: false
    })
  },

  /// 返回到顶部
  scrollTop: function (e) {
    this.setData({
      topNum: 0
    })
  },

  /// 监听页面滚动事件
  onPageScroll: function (e) {
    this.setData({
      scrollTop: e.scrollTop > 200 ? true : false
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // console.log('i am here .... onready')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // console.log('i am here .... onshow')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // console.log('i am here .....hide');
    // anthologies = [];
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 保存浏览记录到本地文件
    let that = this
    let info = {
      "api": baseUrl,
      "vod_id": that.data.vod_id,
      "vod_name": that.data.vod_name,
      "vod_pic": that.data.vod_pic,
      "vod_class": that.data.vod_class,
      "vod_lang": that.data.vod_lang,
      "vod_area": that.data.vod_area,
      "vod_year": that.data.vod_year,
      "vod_actor": that.data.vod_actor,
      "duration": duration,
      "play_percent": (currentTime / duration * 100).toFixed(2),
      "play_index": that.data.currentIndex
    };
    // 如果播放时长小于1%，退出不保存记录
    if (currentTime < 1) return;
    // 刷新已存在的记录，防止出现多条记录冲突
    let newList = histories.filter(obj => obj.vod_id !==
      info.vod_id)
    newList.push(info)
    // 保存浏览记录到本地缓存
    wx.setStorage({
      key: "histories",
      data: newList,
      success: res => {
        // console.log('save history OK---->', res)
      },
      fail: res => {
        // console.log('err----->', res)
      }
    })
    // 清空数组
    anthologies = [];
    favourites = [];
    histories = [];
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