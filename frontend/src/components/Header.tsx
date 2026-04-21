import React, { useState, useEffect } from 'react'
import { Layout, Input, Avatar, Badge, Dropdown, Space, Typography, message } from 'antd'
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Header: AntHeader } = Layout
const { Search } = Input

interface UserInfo {
  username: string
  name: string
  role: string
  avatar?: string
}

const Header: React.FC = () => {
  const [searchValue, setSearchValue] = useState('')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // 从localStorage获取用户信息
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo))
    }
  }, [])

  const handleLogout = () => {
    // 清除登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    message.success('已退出登录')
    navigate('/login')
  }

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'profile':
        navigate('/settings')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'logout':
        handleLogout()
        break
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => handleMenuClick('profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置',
      onClick: () => handleMenuClick('settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => handleMenuClick('logout'),
    },
  ]

  const handleSearch = (value: string) => {
    console.log('搜索:', value)
    if (value.trim()) {
      navigate('/search')
    }
  }

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ flex: 1, maxWidth: 400 }}>
        <Search
          placeholder="全局搜索人才、简历、文档..."
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      <Space size={24}>
        <Badge count={5} size="small">
          <BellOutlined style={{ fontSize: 20, cursor: 'pointer', color: '#666' }} />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar 
              icon={<UserOutlined />} 
              src={userInfo?.avatar}
              style={{ backgroundColor: '#1890ff' }} 
            />
            <Typography.Text strong>{userInfo?.name || '管理员'}</Typography.Text>
            <DownOutlined style={{ fontSize: 12, color: '#999' }} />
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default Header
