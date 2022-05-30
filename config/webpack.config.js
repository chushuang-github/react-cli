// webpack.config.js合并配置
const path = require('path')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
// 提前样式成单独文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 压缩样式文件
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
// 压缩js
const TerserWebpackPlugin = require('terser-webpack-plugin')
// 图片压缩
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

// package.json里面，有这两个指令，使用cross-env库给NODE_ENV赋值了，所以是可以区分是开发环境，还是生产环境的
// "dev": "cross-env NODE_ENV=development webpack serve --config ./config/webpack.config.js",
// "build": "cross-env NODE_ENV=production webpack --config ./config/webpack.config.js"
// process.env.NODE_ENV：获取node运行时候，进程上面环境变量的一个东西
// 获取corss-env定义的环境变量
const isProduction = process.env.NODE_ENV === 'production'

const getStyleLoaders = (preProcessor) => {
  // [].filter(Boolean)：过滤掉数组中为undefined的项
  return [
    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            'postcss-preset-env', // 能解决大多数样式兼容性问题
          ],
        },
      },
    },
    preProcessor && {
      loader: preProcessor,
      options:
        preProcessor === 'less-loader'
          ? {
              // react自定义脚手架，里面进行antd的自定义主题
              lessOptions: {
                modifyVars: {
                  // 其他主题色：https://ant.design/docs/react/customize-theme-cn
                  '@primary-color': '#1DA57A', // 全局主色
                },
                javascriptEnabled: true,
              },
            }
          : {},
    },
  ].filter(Boolean)
}

module.exports = {
  entry: './src/main.js',
  output: {
    path: isProduction ? path.resolve(__dirname, '../dist') : undefined,
    filename: isProduction
      ? 'static/js/[name].[contenthash:10].js'
      : 'static/js/[name].js',
    chunkFilename: isProduction
      ? 'static/js/[name].[contenthash:10].chunk.js'
      : 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/js/[hash:10][ext][query]',
    clean: true,
  },
  module: {
    rules: [
      {
        oneOf: [
          // 处理样式
          {
            test: /\.css$/,
            use: getStyleLoaders(),
          },
          {
            test: /\.less$/,
            use: getStyleLoaders('less-loader'),
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoaders('sass-loader'),
          },
          {
            test: /\.styl$/,
            use: getStyleLoaders('stylus-loader'),
          },
          // 处理图片 (asset可以将图片转成base64格式)
          {
            test: /\.(png|jpe?g|gif|svg)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
              },
            },
          },
          // 处理其它文件 (asset/resource是将文件原封不动的输出)
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource',
          },
          {
            test: /\.(jsx|js)$/,
            include: path.resolve(__dirname, '../src'),
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              plugins: [
                !isProduction && 'react-refresh/babel', // 开启jsx的HMR功能
              ].filter(Boolean),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules',
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        '../node_modules/.cache/.eslintcache'
      ),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    // 将public下面的资源复制到dist目录去（除了index.html）
    isProduction &&
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, '../public'),
            to: path.resolve(__dirname, '../dist'),
            toType: 'dir',
            noErrorOnMissing: true, // 不生成错误
            globOptions: {
              // 忽略文件(public下面的index.html文件会通过HtmlWebpackPlugin插件引入)
              ignore: ['**/index.html'],
            },
            info: {
              // 跳过terser压缩js
              minimized: true,
            },
          },
        ],
      }),
    isProduction &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:10].css',
        chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
      }),
    !isProduction && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // react、react-dom、react-router-dom一起打包成一个js文件
        react: {
          // test写的是匹配包的路径，windows或mac系统表示路径的斜杠是不同的
          // 正则表达式'\\'表示'\'，[\\/]正则表示匹配'\' or '/' ([ab]就表示a或b)
          // .表示任意字符；*表示0个或多个；?表示0个或一个
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          // react、react-dom、react-router-dom一起打包成一个js文件，这个js文件的名字
          name: 'chunk-react',
          priority: 40
        },
        // antd单独打包
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          // react、react-dom、react-router-dom一起打包成一个js文件，这个js文件的名字
          name: 'chunk-antd',
          priority: 30
        },
        // 剩下的node_modules单独打包
        libs: {
          test: /[\\/]node_modules[\\/]/,
          name: 'chunk-libs',
          // 权重最低，优先考虑前面内容
          priority: 10
        }
      }
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`,
    },
    // 是否需要压缩
    // 为true表示需要压缩，minimizer配置会生效；为false表示不需要压缩，minimizer配置不生效
    minimize: isProduction,
    // 压缩的操作
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserWebpackPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              [
                'svgo',
                {
                  plugins: [
                    'preset-default',
                    'prefixIds',
                    {
                      name: 'sortAttrs',
                      params: {
                        xmlnsOrder: 'alphabetical',
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
  },
  resolve: {
    // 自动补全文件扩展名，让jsx可以使用(引入文件，这些文件扩展名可以省略)
    extensions: ['.jsx', '.js', '.json'],
  },
  devServer: {
    open: true,
    host: 'localhost',
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true, // 解决react-router刷新404问题
  },
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  performance: false, // 关闭性能分析，提示速度
}
