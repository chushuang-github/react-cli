// babel.config.js文件
// 注意：一定要是了cross-env库才行
// 开发环境打印development；生产环境打印production
// console.log(process.env.NODE_ENV) 
module.exports = {
  // 使用react官方提供的预设：可以处理js的兼容性问题，也可以编译jsx语法
  // 使用的库：npm install babel-preset-react-app
  // babel-preset-react-app：这个预设必须指定是开发环境 or 生产环境
  // webpack的配置文件里面配置过：mode: 'development'
  // mode: 'development'配置只有在代码运行的时候才能读取到环境变量
  // babel配置运行的时候，是没法根据上面的配置读取处于开发环境 or 生产环境
  // 使用库cross-env，这个库是专门为我们指定环境变量的一个库
  // cross-env库使用：在package.json文件里面scripts定义脚本指令的时候使用
  presets: ["react-app"],
};