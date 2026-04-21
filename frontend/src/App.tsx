import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout, Spin } from 'antd'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TalentList from './pages/TalentList'
import TalentSearch from './pages/TalentSearch'
import TalentProfile from './pages/TalentProfile'
import TalentInventory from './pages/TalentInventory'
import ResumeManage from './pages/ResumeManage'
import DataGovernance from './pages/DataGovernance'
import JobRequirement from './pages/JobRequirement'
import DataReport from './pages/DataReport'
import ResumeOptimize from './pages/ResumeOptimize'
import KeyTalentDashboard from './pages/KeyTalentDashboard'
import './App.css'

const { Content } = Layout

// 路由守卫组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// 主布局组件
const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [siderWidth, setSiderWidth] = useState(200)

  // 监听侧边栏折叠状态
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
        setSiderWidth(0)
      } else {
        setSiderWidth(collapsed ? 80 : 200)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [collapsed])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <div style={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        bottom: 0, 
        zIndex: 100,
        transition: 'all 0.2s'
      }}>
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      </div>
      
      <Layout style={{ 
        marginLeft: siderWidth, 
        transition: 'all 0.2s',
        minHeight: '100vh'
      }}>
        <Header />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5', minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/talent-pool" element={<TalentList />} />
            <Route path="/search" element={<TalentSearch />} />
            <Route path="/profile" element={<TalentProfile />} />
            <Route path="/inventory" element={<TalentInventory />} />
            <Route path="/resume" element={<ResumeManage />} />
            <Route path="/governance" element={<DataGovernance />} />
            <Route path="/job-requirement" element={<JobRequirement />} />
            <Route path="/report" element={<DataReport />} />
            <Route path="/resume-optimize" element={<ResumeOptimize />} />
            <Route path="/key-talent" element={<KeyTalentDashboard />} />
          </Routes>
        </Content>
      </Layout>
      
    </Layout>
  )
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟应用初始化
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
