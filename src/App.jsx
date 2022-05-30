import React, { Suspense } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import { Button } from 'antd'
// import Home from './page/Home'
// import About from './page/About'

// 路由懒加载技术
const Home = React.lazy(() => import(/* webpackChunkName: 'home' */'./page/Home'))
const About = React.lazy(() => import(/* webpackChunkName: 'about' */'./page/About'))

export default function App() {
  return (
    <div>
      <h2>App</h2>
      <Button type='primary'>Primary</Button>

      <ul>
        <li><Link to='/home'>Home</Link></li>
        <li><Link to='/about'>About</Link></li>
      </ul>

      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route path='/home' element={<Home />} />
          <Route path='/about' element={<About />} />
        </Routes>
      </Suspense>
    </div>
  )
}