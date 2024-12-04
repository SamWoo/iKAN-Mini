const BASE_URL = "";
const REQUEST_TIMEOUT = 60 * 1000; // 请求超时时间
const TAB_LIST = ['电影', '动漫', '演员', '新闻资讯', '综艺', '电影资讯', '娱乐新闻', '资讯', '公告', '预告片', '头条', '写真热舞', '电视剧', '体育赛事', '影视资讯', '预告资讯', '明星资讯', '帮助', 'VIP福利', '写真美女', '展会美女', '同性', '萌宝', '其他伦理', '同性片', '未分类', '电影片', '连续剧', '综艺片', '动漫片', '剧集', '新马泰动漫', '求片留言', '港台明星', '内地明星'];
const SEX_TAB = ['伦理片', '台湾伦理', '美女写真', '日本写真', '西方写真', '国产写真', '港台三级', '韩国伦理', '西方伦理', '日本伦理', '两性课堂', '里番动漫', '福利', '倫理片', '倫理', '伦理',];
const SRCS = [];
// 音乐资源基地址
const MUSIC_BASE_URL = "https://www.kumeiwp.com";
// 音乐搜索基地址
const MUSIC_SEARCH_URL = "https://www.kumeiwp.com/index/search/data?page=1&limit=50&scope=all";

module.exports = {
  BASE_URL,
  REQUEST_TIMEOUT,
  TAB_LIST,
  SRCS,
  MUSIC_BASE_URL,
  MUSIC_SEARCH_URL,
  SEX_TAB
}