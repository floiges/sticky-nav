const autoprefixer = require("autoprefixer");
const px2rem = require('postcss-pxtorem');

module.exports = {
  plugins: [
		px2rem({
			rootValue: 75,
      unitPrecision: 5, // rem小数位
      propList: ["*"], // 需要转化的属性
      selectorBlackList: [/^body$/, /^figure$/, /^fieldset$/], // 类名黑名单
      replace: true,
      mediaQuery: false, // 允许在媒体查询中转化px
      minPixelValue: 2 // 需要转化的最小px值
		}),
    autoprefixer({
      overrideBrowserslist: ["last 20 versions", "Android >= 4.0"]
    })
  ]
};