// pages/my/my.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '我的',
    navBg: '',
    isLogin: false,
    userInfo: {},
    showPopup: false,
    word: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    that.getOneWord().then(res => {
      // console.log('word----->>>', res)
      that.setData({
        navBg: app.globalData.navBg,
        isLogin: app.globalData.isLogin,
        userInfo: wx.getStorageSync('userInfo') || {
          avatarUrl: '/static/images/avatar.gif',
          nickname: '🔥螺丝没有粉🔥',
          signature: res ??'🚀点击左侧图像可自行修改用户信息!!!🔥🐘'
        }
      });
    })
  },

  /// 获取每日一言
  getOneWord: function () {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://v1.hitokoto.cn/',
        method: 'GET',
        success: res => {
          // console.log('res---->>', res.data.hitokoto)
          resolve(res.data.hitokoto);
        },
        fail: err => {
          console.log('err--->>>', err)
          reject('');
        },
        complete: res => { }
      })
    })

  },

  /// 登录
  login: function () {
    let that = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: 'http://127.0.0.1:3000/user/login',
          method: 'POST',
          data: {
            code: res.code
          },
          success: res => {
            if (res.data.code === 200) {
              wx.showToast({
                title: '登录成功!',
                duration: 1500,
                icon: 'none'
              })
              app.globalData.isLogin = true
              app.globalData.userInfo.avatar = res.data.data.avatar
              app.globalData.userInfo.nickname = res.data.data.nickname
              app.globalData.userInfo.signature = res.data.data.signature
              // 刷新界面数据
              that.setData({
                isLogin: app.globalData.isLogin,
                ['userInfo.avatar']: app.globalData.userInfo.avatar,
                ['userInfo.nickname']: app.globalData.userInfo.nickname,
                ['userInfo.signature']: app.globalData.userInfo.signature,
              })

              app.globalData.token = res.data.token
              // 将token保存到数据缓存中
              wx.setStorage({
                key: 'token',
                data: res.data.token,
              })
            }
          }
        })
      }
    })
  },

  /// 长按VIP图标显示全部tab
  showAllTab: function (e) {
    app.globalData.showAllTab = !app.globalData.showAllTab;
    // 重新加载首页
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  /// 跳转到收藏界面
  navTo: function (e) {
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '请先登录！！',
        duration: 1500,
        icon: 'none'
      })
      return
    } else {
      let path = e.currentTarget.dataset.path;
      wx.navigateTo({
        url: '/pages/' + path + '/' + path,
      });
    }

  },

  /// 个人信息设置
  onTapUserInfo: function (e) {
    this.setData({
      showPopup: true
    })
  },

  /// 取消
  bindCancelTap: function () {
    this.setData({
      showPopup: false
    });
  },

  /// 确认
  bindConfirmTap: function () {
    // 这里添加提交修改的逻辑，如调用接口更新数据
    wx.setStorageSync('userInfo', this.data.userInfo);
    this.setData({
      showPopup: false
    });
  },

  /// 获取图像信息
  bindAvatarTap: function () {
    wx.chooseMedia({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
      },
    });
  },

  bindNicknameInput: function (e) {
    this.setData({
      'userInfo.nickname': e.detail.value
    });
  },

  bindSignatureInput: function (e) {
    this.setData({
      'userInfo.signature': e.detail.value
    });
  },

  /// 测试
  toTest: function (e) {
    wx.navigateTo({
      url: '',
    });
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
    });
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
    // console.log('--->>>unload------',app.globalData.showAllTab)
    wx.setStorageSync('showAllTab', app.globalData.showAllTab)
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