// pages/playMusic/playMusic.js
import { MUSIC_BASE_URL } from '../../config/config'

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    xmlData: '',
    navBg: app.globalData.navBg,
    playlist: [],
    name: '',
    //设置的默认值
    play: {
      // 当前时间
      currentTime: '00:00',
      // 歌曲总时间
      duration: '00:00',
      // 播放进度
      percent: 0,
      title: '',
      singer: '',
      coverImgUrl: "/static/images/cd.png",
    },
    state: 'paused',
    popupVisible: false,
    currentIndex: app.globalData.currentSongIndex, // 当前播放歌曲的index
    songId: '',
  },
  audioCtx: app.globalAudioCtx,
  src: '',

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取data
    let xList = JSON.parse(decodeURIComponent(options.playlist))
    this.setData({
      playlist: xList,
      currentIndex: options.index
    })
    // 初始化数据
    this.initData(this.data.currentIndex)
    // 更新全局变量
    // app.globalData.currentSongIndex = this.data.currentIndex
    this.updateSharedData(this.data.currentIndex)
  },

  /// 初始化数据
  initData: function (index) {
    let xData = this.data.playlist[this.data.currentIndex]
    let temp = xData.name.replace(' ', '').split('.')
    let info = temp[temp.length - 2].split('-')
    this.setData({
      name: xData.name.replace(' ', '').trim(),
      'play.title': info[1] ?? '未知',
      'play.singer': info[0] ?? "未知"
    })
    // 获取音频信息
    this.fetchXMLData(xData.url);
  },

  /// 请求数据
  fetchXMLData: function (url) {
    // 解析播放页面数据
    wx.request({
      url: MUSIC_BASE_URL + url,
      method: 'GET',
      success: (res) => {
        this.data.xmlData = res.data;
        this.parseAndHandleXML()
      },
      fail: (err) => {
        console.error('Request fail!', err);
      }
    })
  },

  /// 处理xml
  parseAndHandleXML: function () {
    const { xmlData } = this.data;
    const { parseXML } = require('../../utils/parseXML');

    try {
      const xmlDoc = parseXML(xmlData);
      this.src = xmlDoc.getElementsByTagName('source')[0].getAttribute("src");
      // 停止之前的播放
      this.audioCtx.stop()
      //自动播放
      this.playAudio()
    } catch (error) {
      console.error('Failed to parse XML：', error);
    }
  },

  /// 播放音频
  playAudio: function () {
    this.audioCtx.src = this.src  // 音频路径
    this.audioCtx.play()   // 播放音频
    // this.audioCtx.volume = 1  // 音量。范围0~1。默认为 1
    this.setData({
      state: 'running'
    })
  },

  // 手动控制进度
  sliderChange: function (e) {
    var second = e.detail.value * this.audioCtx.duration / 100
    //跳到指定位置
    this.audioCtx.seek(second)
  },

  /// 回退到上一页
  onBack: function (e) {
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    let that = this;
    // 播放失败检测
    that.audioCtx.onError(function () {
      wx.showToast({
        title: '抱歉!此歌曲无法正常播放!',
        icon: 'none',
        duration: 2000,
      })
      // 自动播放下一曲
      if (that.data.currentIndex < that.data.playlist.length) {
        that.setData({
          currentIndex: (that.data.currentIndex + 1)
        })
        that.initData(that.data.currentIndex)
      } else {
        that.audioCtx.stop(); // 停止播放
        // 更新数据
        that.setData({
          currentIndex: 0,
          "play.currentTime": '00:00',
          "play.percent": 0,
          state: 'paused'
        })
      }
      // 更新全局变量
      // app.globalData.currentSongIndex = that.data.currentIndex
      that.updateSharedData(that.data.currentIndex)
      // 返回上一页
      // wx.navigateBack()
    })

    // 当音频开始播放时触发此事件，可用于更新UI或其他相关操作
    that.audioCtx.onPlay(() => {
      // console.log('can play.....')
    })

    // 当音频因为数据不足，需要停下来加载时会触发
    that.audioCtx.onWaiting(()=>{
      // console.log('waiting.....')
    })

    // 播放完成
    that.audioCtx.onEnded(function () {
      that.setData({
        currentIndex: ++that.data.currentIndex
      })
      // 播放下一曲
      that.initData(that.data.currentIndex)
      // 更新全局变量
      // app.globalData.currentSongIndex = that.data.currentIndex
      that.updateSharedData(that.data.currentIndex)
      // console.log('end---->>>',that.data.currentIndex)
    })

    // 自动更新播放进度
    that.audioCtx.onTimeUpdate(function () {
      that.setData({
        //获取总时间
        'play.duration': that.formatTime(that.audioCtx.duration),
        //当前歌曲播放的时长
        'play.currentTime': that.formatTime(that.audioCtx.currentTime),
        'play.percent': that.audioCtx.currentTime / that.audioCtx.duration * 100
      })
    })
    // 设置歌曲信息
    that.setMusicInfo()
  },

  /// 格式化时间
  formatTime: function (time) {
    var minute = Math.floor(time / 60) % 60;
    var second = Math.floor(time) % 60;
    return (minute < 10 ? '0' + minute : minute) + ":" +
      (second < 10 ? '0' + second : second)
  },

  /// 设置歌曲信息
  setMusicInfo: function () {
    this.setData({
      "play.currentTime": '00:00',
      "play.percent": 0
    })
  },

  /// 播放
  onPlay: function (e) {
    this.playAudio()
  },

  /// 暂停
  onPause: function (e) {
    this.pause()
  },

  /// 暂停音频
  pause: function () {
    this.audioCtx.pause() // 暂停音频
    this.setData({
      state: 'paused'
    })
  },

  /// 上一首
  onPre: function (e) {
    this.setData({
      currentIndex: --this.data.currentIndex
    })
    // 更新全局变量
    // app.globalData.currentSongIndex = this.data.currentIndex
    this.updateSharedData(this.data.currentIndex)
    this.playPreSong()
  },

  /// 播放上一曲
  playPreSong: function () {
    // 如果是第一首
    if (this.data.currentIndex < 0) {
      this.audioCtx.stop(); // 停止播放
      this.setData({
        currentIndex: 0,
        state: 'paused'
      })
      // 更新全局变量
      // app.globalData.currentSongIndex = this.data.currentIndex
      this.updateSharedData(this.data.currentIndex)
    } else {
      this.initData(this.data.currentIndex)
    }
    // 更新数据
    this.setData({
      "play.currentTime": '00:00',
      "play.percent": 0,
    })
  },

  /// 下一首
  onNext: function (e) {
    this.setData({
      currentIndex: ++this.data.currentIndex
    })
    // 更新全局变量
    // app.globalData.currentSongIndex = this.data.currentIndex
    this.updateSharedData(this.data.currentIndex)
    this.playNextSong()
  },

  /// 播放下一曲
  playNextSong: function () {
    // 如果是最后一首
    if (this.data.currentIndex >= this.data.playlist.length) {
      this.audioCtx.stop(); // 停止播放
      this.setData({
        currentIndex: 0,
        state: 'paused'
      })
      // 更新全局变量
      // app.globalData.currentSongIndex = this.data.currentIndex
      this.updateSharedData(this.data.currentIndex)
    } else {
      this.initData(this.data.currentIndex)
    }
    // 更新数据
    this.setData({
      "play.currentTime": '00:00',
      "play.percent": 0,
    })
  },

  /// 下载
  onDownload: function (e) {
    // 暂停当前音频播放
    this.pause()
    // 下载音频文件
    this.downloadMusic(this.src)
  },

  /// 收藏
  onFav: function (e) {
    wx.showToast({
      title: '厨子👩🏻‍🍳正抓紧备菜中...😄',
      icon: 'none'
    })
  },

  /// 随机播放
  onRandomPlay: function (e) {
    this.setData({
      currentIndex: Math.floor(Math.random() * 100)
    })
    this.initData(this.data.currentIndex)
    // 更新全局变量
    // app.globalData.currentSongIndex = this.data.currentIndex
    this.updateSharedData(this.data.currentIndex)
  },

  /// 播放列表
  onPlayList: function (e) {
    this.setData({
      popupVisible: true,
      songId: 'songid' + this.data.currentIndex
    });
  },

  /// 隐藏播放列表
  hidePopup: function (e) {
    this.setData({
      popupVisible: false
    });
  },

  /// 切换歌曲
  changeSong: function (e) {
    let index = e.currentTarget.dataset.index
    let songid = e.currentTarget.id
    this.setData({
      currentIndex: index,
      songId: songid
    })
    this.initData(this.data.currentIndex)
    // 更新全局变量
    // app.globalData.currentSongIndex = this.data.currentIndex
    this.updateSharedData(this.data.currentIndex)
  },

  /// 下载音乐文件
  downloadMusic: function (musicUrl) {
    let that = this;
    // 检查用户是否授权访问本地文件系统
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              that.downloadFile(musicUrl);
            },
            fail: () => {
              wx.showToast({
                title: '请授权访问本地文件系统',
                icon: 'none'
              });
            }
          });
        } else {
          that.downloadFile(musicUrl)
        }
      }
    })
  },

  /// 下载文件并保存到本地
  downloadFile: function (musicUrl) {
    const filePath = wx.env.USER_DATA_PATH + '/' + this.data.name
    // 显示加载提示框
    wx.showLoading({
      title: '正在下载',
    });
    // 开始下载文件
    wx.downloadFile({
      url: musicUrl,
      success: (res) => {
        // 下载成功后隐藏加载提示框
        wx.hideLoading();
        wx.getFileSystemManager().saveFile({
          tempFilePath: res.tempFilePath,
          filePath: filePath,
          success: (saveRes) => {
            wx.openDocument({
              filePath: saveRes.savedFilePath,
              showMenu: true
            })
            // 提示
            wx.showToast({
              title: '下载成功!',
              icon: 'success',
              duration: 2000,
            });
          },
          fail: (saveErr) => {
            wx.showToast({
              title: '保存失败!',
              icon: 'error',
              duration: 2000,
            });
          }
        });
      },
      fail: (err) => {
        // 如果下载失败，也应隐藏加载提示框
        wx.hideLoading();
        // 提示
        wx.showToast({
          title: '下载失败!',
          icon: 'none',
          duration: 2000,
        })
      }
    })
  },

  /// 通知音频列表界面更新索引
  updateSharedData: function (data) {
    app.globalData.currentSongIndex = data;
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