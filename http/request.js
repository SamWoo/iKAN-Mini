// 封装统一请求
const Config = require('../config/config.js');

module.exports = {
  /**
   * url: 请求的接口地址
   * methodType: 请求方法
   * data: 传递的参数
   */

  request: function (url, methodType, data) {
    let baseUrl = wx.getStorageSync('baseUrl') || getApp().globalData.baseUrl //Config.BASE_URL
    // 全路径
    let realUrl = url.startsWith('http') ? `${url}` : `${baseUrl}${url}`;
    // console.log('realUrl--->>>',url)
    // 获取Token或Cookie
    // let cookie = wx.getStorageSync('cookie') || '';
    // 显示加载控件
    // wx.showLoading({
    //   title: '加载中...',
    // });
    return new Promise((resolve, reject) => {
      // 发起请求
      try {
        let requestTask = null
        requestTask = wx.request({
          url: realUrl,
          method: methodType,
          data,
          header: {
            'content-type': 'application/json',
            // 'Cookie': `${cookie}`,
          },
          timeout: Config.REQUEST_TIMEOUT,
          success: (res) => {
            // console.log("返回数据:", res.statusCode);
            // 如果后端有统一的错误处理可以使用下面这个
            if (res.statusCode == 200) {
              resolve(res.data);
            } else {
              wx.showToast({
                title: '请求错误!!',
                icon: 'none'
              });
              reject('请求错误!!');
            }
          },
          complete: (res) => {
            // console.log('2.requestId------>>>',res)
          },
          fail: (err) => {
            // 超时取消请求
            requestTask.abort()
            // console.log('id--->>>', requestTask)
            wx.showToast({
              title: '请求错误!',
              icon: 'none',
            });
            reject('请求错误!');
          }
        })
        // console.log('task------>>>', requestTask)
      } catch (error) {
        console.log('err----->>>',error)
        requestTask.abort()
        wx.showToast({
          title: '未知错误!',
          icon: 'none',
        });
      }
    });
  },
}