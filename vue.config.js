module.exports = {
  // 設定publicPath，当env为production时变更为sticky-nav，
  // 因为Github Pages部署完成之后的网址为 https://floiges.github.io/sticky-nav/，因此根目录为sticky-nav
  publicPath: process.env.NODE_ENV === 'production' ? '/sticky-nav' : '/',
};