// react18
import React from 'react'
import ReactDOM from 'react-dom/client'
// 使用BrowserRouter，刷新页面可能会出现问题
import { HashRouter } from 'react-router-dom'
import App from './App'
import 'antd/dist/antd.less'

const root = ReactDOM.createRoot(document.getElementById('app'))
root.render(
  <HashRouter>
    <App />
  </HashRouter>
)
