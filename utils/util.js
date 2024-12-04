const Config = require('../config/config.js');

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/// 字符串判空
const isNotEmptyStr = s => {
  if (typeof s == "string" && s.length > 0) {
    return true;
  }
  return false;
}

/**
 * 过滤Tab
 * @param {*} srcArr 指定过滤特定字段数组
 * @param {*} filterArr 需要过滤的数组
 */
const filterTab = (srcArr, filterArr) => {
  let list = [];
  for (let it of filterArr) {
    if (!srcArr.includes(it.type_name)) {
      list.push(it);
    }
  }
  return list;
}

/// rgb --> hex
/**
 * @param {String} color:'rgb(255,0,0)'
 * @return {String} hex:'#000'
 */
const rgb2hex = (color) => {
  let rgb = color.split(',');
  let R = parseInt(rgb[0].split('(')[1]);
  let G = parseInt(rgb[1]);
  let B = parseInt(rgb[2].split(')')[0]);
  let hex = "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  return hex;
}

/// rpx-->px
const rpx2px = (rpx) => (rpx / 750) * wx.getSystemInfoSync().windowWidth

/// px--->rpx
const px2rpx = (px) => (px / wx.getSystemInfoSync().windowWidth) * 750

// 防重复点击按钮
const repeatClicked = (self) => {
  self.setData({
    clicked: true
  })
  setTimeout(() => {
    self.setData({
      clicked: false
    })
  }, 600)
}

module.exports = {
  formatTime,
  isNotEmptyStr,
  filterTab,
  rgb2hex,
  rpx2px,
  px2rpx,
  repeatClicked
}
