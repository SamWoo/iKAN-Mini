// pages/resource/resource.js
const config = require('../../config/config')
const app = getApp()
let srcs = [], baseUrl = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '影视资源',
    navBg: app.globalData.navBg,
    height: '',
    items: [],
    actions: ['手动添加', '本地导入', '网络获取'],
    showModal: false,
    name: '',
    address: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 动态获取滚动区域的高度
    this.getHeight()
    this.getLocalSrc()
  },

  // 动态获取显示区域的高度
  getHeight: function () {
    let that = this
    // 获取屏幕尺寸
    const windowInfo = wx.getWindowInfo()
    const windowHeight = windowInfo.windowHeight
    // 获取滚动区高度
    wx.createSelectorQuery().select(".nav-bar").boundingClientRect(function (rect) {
      const navBarHeight = rect.height
      that.setData({
        height: (windowHeight - navBarHeight - 10)
      })
    }).exec()
  },

  /// 从本地缓存中读取资源站点信息
  getLocalSrc: function () {
    // 重置终端资源 ---start----
    // wx.setStorageSync('srcs', [])
    // wx.setStorageSync('srcs', config.SRCS)
    // ---end-----

    baseUrl = wx.getStorageSync('baseUrl')
    srcs = wx.getStorageSync('srcs') || []
    if (srcs.length === 0) {
      wx.showToast({
        title: '本地无缓存文件',
        icon: 'none',
        duration: 2000
      })
      return
    }
    // 将当前缓存中的baseUrl在列表中标记为选中
    srcs.forEach(obj => {
      obj.checked = obj.url === baseUrl
    })
    // 刷新界面数据
    this.setData({
      items: srcs
    })
  },

  /// 从服务器获取影视资源
  getVideoSrc: function () {
    let that = this
    wx.request({
      url: 'http://127.0.0.1:3000/video/src',
      success: res => {
        let data = res.data
        data.forEach(obj => {
          obj.checked = obj.url === baseUrl
        })
        srcs = srcs.concat(data)
        that.setData({
          items: srcs
        })
        // 将数据保存到本地缓存
        wx.setStorageSync('srcs', srcs)
      },
      fail: res => {
        wx.showToast({
          title: '服务器开小差了!',
          icon: 'none',
          duration: 2000
        })
      },
    })
  },

  /// 删除所有记录
  delAll: function (e) {
    wx.showModal({
      title: '温馨提示',
      content: '确认要清空所有资源吗?',
      complete: (res) => {
        if (res.cancel) return
        if (res.confirm) {
          this.setData({
            items: []
          })
          // 重新保存到缓存中
          srcs = []
          wx.setStorage({
            key: "srcs",
            data: srcs,
            success: res => {
              wx.showToast({
                title: '删除成功!',
                icon: 'none',
                duration: 2000
              });
            },
            fail: res => {
              wx.showToast({
                title: '删除失败!',
                icon: 'none',
                duration: 2000
              })
            },
          });
        }
      }
    })
  },

  /// 切换选项
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    const items = this.data.items
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].url === e.detail.value
    }
    // 刷新当前界面数据
    this.setData({
      items
    })

    // 保存选中的数据到本地缓存
    wx.setStorageSync('baseUrl', e.detail.value)
    // 跳转到首页刷新数据源
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  /// 点击添加按钮弹出对话框
  showChoice: function (e) {
    let that = this
    wx.showActionSheet({
      itemList: this.data.actions,
      success: res => {
        switch (res.tapIndex) {
          case 0:
            that.showDialog()
            break
          case 1:
            // 从本地存储设备读取文件
            that.importLocalFile()
            break
          case 2:
            that.getVideoSrc()
            break
          default:
            break
        }
      },
      fail: res => {
        // console.log('fail......', res)
      },
    })
  },

  /// 手动添加资源
  // 名称输入框输入监听
  nameInput: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  // 地址输入框输入监听
  addressInput: function (e) {
    this.setData({
      address: e.detail.value
    })
  },

  // 确定添加
  modalConfirm: function (e) {
    let name = this.data.name;
    let address = this.data.address;

    // 地址名称为空
    if (name == '' || name == null || name == undefined) {
      wx.showToast({
        title: '名称不能为空!',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 地址栏的值为空
    if (address == '' || address == null || address == undefined) {
      wx.showToast({
        title: '地址栏不能为空!',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 校验输入的地址值是否符合网址
    var reg = /^([hH][tT]{2}[pP][sS]:\/\/)/;
    if (!reg.test(address)) {
      wx.showToast({
        title: '输入的地址格式不对，请重新输入!',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    // 字段不为空值，写入缓存
    srcs.push({
      'name': this.data.name,
      "url": this.data.address
    });
    // 写入本地缓存
    wx.setStorage({
      key: "srcs",
      data: srcs,
      success: res => {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
        // 刷新当前界面
        wx.reLaunch({
          url: '/pages/resource/resource',
        })
      },
      fail: res => {
        wx.showToast({
          title: '保存失败',
          icon: 'error',
          duration: 2000
        })
      }
    })

    // 复位showModal的值
    this.setData({
      showModal: false,
      name: '',
      address: ''
    })
  },

  // 取消添加
  modalCancel: function (e) {
    this.setData({
      name: '',
      address: '',
      showModal: false
    })
  },

  /// 从本地选择文件导入
  importLocalFile: function () {
    let that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json', 'txt'],
      success: res => {
        wx.getFileSystemManager().readFile({
          filePath: res.tempFiles[0].path,
          encoding: 'utf8',
          position: 0,
          success: res => {
            let data = JSON.parse(res.data)
            // 过滤掉已存在的地址
            if (srcs.length !== 0) {
              // 在现有的srcs中提取出所有urls
              const urls = srcs.map(obj => obj.url)
              // 对导入进来的数据的url进行过滤，已存在的剔除，不存在的保留下来
              // 直接通过filter过滤然后返回新数组
              data = data.filter(obj => !urls.includes(obj.url))
            } else {
              data.forEach(obj => {
                obj.checked = obj.url === baseUrl
              })
            }
            // 更新srcs值
            srcs = srcs.concat(data)
            // 将数据保存到本地缓存
            wx.setStorageSync('srcs', srcs)
            // 刷新数据界面
            that.setData({
              items: srcs
            })

            // 提示导入成功
            wx.showToast({
              title: '导入成功!',
              icon: 'success',
              duration: 2000
            });
          },
          fail: res => {
            // console.log('err--->>') 
          }
        })
      },
      fail: res => {
        wx.showToast({
          title: '文件读取失败!',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  /// 打开新增资源对话框
  showDialog: function () {
    this.setData({
      showModal: true,
      name: '',
      address: ''
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // console.log('onReady-------------------------->>>>')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // console.log('onShow-------------------------->>>>')
    this.setData({
      navBg: app.globalData.navBg,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // console.log('onHide-------------------------->>>>')
    // srcs = []
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // console.log('onUnLoad-------------------------->>>>')
    srcs = []
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