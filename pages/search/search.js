// pages/search/search.js
import Macaron from '../../config/macaron'

const fs = wx.getFileSystemManager();
const app = getApp();

// 全局变量
let pageCount = 0,
  pageNum = 1,
  keyword = '',
  searchRecords = [],
  filePath = `${wx.env.USER_DATA_PATH}/records.txt`;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '影视搜索',
    navBg: app.globalData.navBg,
    height: '',
    inputValue: '',
    isFocus: false,
    records: [],
    isEmpty: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 动态获取滚动区域的高度
    this.getHeight()
    // 读取记录文件
    this.readSearchRecords()
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
    query.select('.record').boundingClientRect()

    // 执行上面所指定的请求，结果会按照顺序存放于一个数组中，在callback的第一个参数中返回
    query.exec(res => {
      let navbarHeight = res[0].height
      let recordHeight = res[1].height
      that.setData({
        height: (windowHeight - navbarHeight - recordHeight - 20)
      })
    })
  },

  // 读取记录文件
  readSearchRecords: function () {
    let that = this;
    try {
      fs.readFile({
        filePath: filePath,
        encoding: 'utf8',
        position: 0,
        success: res => {
          searchRecords = res.data.split(',').slice(0, -1);
          // console.log('init--->>>',searchRecords)
          this.data.records = searchRecords.map((it, index) => ({
            text: it,
            color: this.generateRandomColor()
            // color: this.getMacaronColor() 
          }));
          that.setData({
            records: this.data.records,
            isEmpty: false
          });
        },
        fail: res => {
          // wx.showToast({
          //   title: '暂无搜索记录',
          //   icon: 'none',
          //   duration: 1500
          // });
          // 新建记录文件
          fs.writeFile({
            filePath: filePath,
            encoding: 'utf-8',
            position: 0,
            success: res => {
              // console.log('文件创建成功!');
            },
            fail: res => {
              // console.log('文件创建失败!');
            }
          });
        }
      });
    } catch (e) {
      console.error(e);
    }
  },

  /// 获取随机颜色
  generateRandomColor: function () {
    // 生成0-255之间的随机整数
    const red = Math.floor(Math.random() * 250).toString(16);
    const green = Math.floor(Math.random() * 250).toString(16);
    const blue = Math.floor(Math.random() * 250).toString(16);

    // 确保每个通道都是两位数，如果不足两位则前面补0
    const fullRed = ('0' + red).slice(-2);
    const fullGreen = ('0' + green).slice(-2);
    const fullBlue = ('0' + blue).slice(-2);

    // 返回#开头的六位十六进制颜色代码
    return '#' + fullRed + fullGreen + fullBlue;
  },

  /// 获取Macaron多巴胺色彩
  getMacaronColor: () => Macaron[Math.floor(Math.random() * Macaron.length)],

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
    // 将关键字加入列表中
    searchRecords.push(keyword)
    // 除去重复的关键字
    searchRecords = Array.from(new Set(searchRecords));
    /// 更新当前界面
    this.data.records = searchRecords.map((it, index) => ({
      text: it,
      color: this.generateRandomColor()
      // color: this.getMacaronColor() 
    }));

    this.setData({
      inputValue: "",
      isFocus: false,
      records: this.data.records,
      isEmpty: false
    });
    // 跳转到搜索结果页面
    wx.navigateTo({
      url: '/pages/searchResult/searchResult?kw=' + keyword,
    })
  },

  /// 删除所有的记录
  deleteAll: function (e) {
    wx.showToast({
      title: '删除所有记录',
    })
    this.setData({
      records: [],
      isEmpty: true
    });
    // 清空从文件中读取的记录
    searchRecords = []
  },

  /// 点击记录item搜索框自动填充并显示搜索按钮
  clickItem: function (e) {
    this.setData({
      isFocus: true,
      inputValue: e.currentTarget.dataset.item
    })
    this.handleSearch(e)
  },

  /// 删除当前点击的搜索记录
  delItem: function (e) {
    let index = e.currentTarget.dataset.index
    // console.log('index--->>', index)
    // 删除指定index元素
    this.data.records.splice(index, 1)
    searchRecords.splice(index, 1)
    // 更新数据
    this.setData({
      records: this.data.records
    })
  },

  /// 保存数据到缓存
  saveRecords: function () {
    // 保存记录到文件
    let str = '';
    for (var it of searchRecords) {
      str += it + ',';
    }
    fs.writeFile({
      filePath: filePath,
      encoding: 'utf8',
      data: str,
      success: res => {
        // console.log('保存成功!')
      },
      fail: res => {
        // console.log('保存失败!')
      }
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // console.log('---hide----')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // console.log('---unload----')
    // 保存数据
    this.saveRecords()
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

  },


})