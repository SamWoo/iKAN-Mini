// 封装请求接口
import {
  request
} from './request'

export default {
  login: (data) => request('/api/user/login', 'POST', data),
  checkLogin: () => request('/api/user/checkLogin', 'GET'),
  getTabList: () => request('?ac=list', 'GET'),
  getVideoList: (tid, pageNum) => request('?ac=videolist&pagesize=12&t=' + tid + '&pg=' + pageNum, 'GET'),
  getVideoById: (url, id) => request(`${url}?ac=videolist&ids=` + id, 'GET'),
  searchVideoByKw: (kw, pageNum) => request('?ac=videolist&pagesize=12&wd=' + kw + '&pg=' + pageNum, 'GET'),
}