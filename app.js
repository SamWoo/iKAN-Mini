// app.js
import Macaron from './config/macaron'
App({
  // 引入`towxml3.0`解析方法
  towxml:require('/towxml/index'),
  globalAudioCtx: null,
  onLaunch() {
    this.globalAudioCtx = wx.createInnerAudioContext();
    // 强制开启调试模式
    wx.setEnableDebug({
      enableDebug: true,
    })
    /*
    // 检查用户是否登录
    this.checkLogin(res => {
      console.log('isLogin: ', res.isLogin)
      // 未登录 --> login
      if (!res.isLogin) {
        // 执行登录操作
        wx.showModal({
          title: '提示',
          content: '请先登录',
          complete: (res) => {
            if (res.cancel) {
              return
            }

            if (res.confirm) {
              wx.switchTab({
                url: '/pages/my/my',
              })
            }
          }
        })
      } else {
        this.globalData.isLogin = res.isLogin
        this.globalData.userInfo.avatar = res.data.avatar
        this.globalData.userInfo.nickname = res.data.nickname
        this.globalData.userInfo.signature = res.data.signature
      }
    })
    // */
  },



  /// 停止音频播放
  stopGlobalAudio: function () {
    if (this.globalAudioCtx && this.globalAudioCtx.isPlaying) {
      this.globalAudioCtx.stop();
    }
  },

  /// 全局变量
  globalData: {
    navBg: wx.getStorageSync('themeColor') || Macaron[Math.floor(Math.random() * Macaron.length)],//"#0883aa",
    baseUrl: 'http://json.heimuer.xyz/api.php/provide/vod',
    token: null,
    isLogin: true, // false,
    showAllTab: wx.getStorageSync('showAllTab') || false, // 是否显示全部tab
    currentSongIndex: 0
  },

  /// 检查用户登录状态
  checkLogin: function (callback) {
    // 从缓存中取出Token
    let token = wx.getStorageSync('token')
    console.log('check-token: ', token)
    if (token) {
      // this.globalData.token = token
      // 发送请求验证Token是否存在
      wx.request({
        url: 'http://127.0.0.1:3000/user/checkLogin',
        header: {
          "Authorization": token
        },
        success: res => {
          console.log('check---->>>>', res)
          callback(res.data)
        },
        fail: res => {
          console.log('fail---->', res)
          callback({
            isLogin: false
          })
        }
      })
    } else {
      callback({
        isLogin: false
      })
    }
  },
})