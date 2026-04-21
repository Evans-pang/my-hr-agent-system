import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Badge, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  SearchOutlined,
  BarChartOutlined,
  AimOutlined,
  FileTextOutlined,
  SafetyOutlined,
  SolutionOutlined,
  PieChartOutlined,
  EditOutlined,
  CrownOutlined,
} from '@ant-design/icons'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed: propCollapsed, onCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const siderRef = useRef<HTMLDivElement>(null)
  
  const collapsed = propCollapsed !== undefined ? propCollapsed : internalCollapsed
  const setCollapsed = (value: boolean) => {
    setInternalCollapsed(value)
    onCollapse?.(value)
  }

  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      label: '数据仪表盘',
      icon: <DashboardOutlined />,
      path: '/dashboard',
    },
    {
      key: 'job-requirement',
      label: '招聘需求',
      icon: <SolutionOutlined />,
      path: '/job-requirement',
    },
    {
      key: 'talent-pool',
      label: '人才库',
      icon: <TeamOutlined />,
      path: '/talent-pool',
      badge: 234,
    },
    {
      key: 'search',
      label: '智能搜索',
      icon: <SearchOutlined />,
      path: '/search',
    },
    {
      key: 'profile',
      label: '人才画像',
      icon: <BarChartOutlined />,
      path: '/profile',
    },
    {
      key: 'inventory',
      label: '人才盘点',
      icon: <AimOutlined />,
      path: '/inventory',
    },
    {
      key: 'resume',
      label: '简历管理',
      icon: <FileTextOutlined />,
      path: '/resume',
    },
    {
      key: 'governance',
      label: '数据治理',
      icon: <SafetyOutlined />,
      path: '/governance',
      badge: 3,
    },
    {
      key: 'report',
      label: '数据报告',
      icon: <PieChartOutlined />,
      path: '/report',
    },
    {
      key: 'resume-optimize',
      label: '简历优化',
      icon: <EditOutlined />,
      path: '/resume-optimize',
    },
    {
      key: 'key-talent',
      label: '关键人才',
      icon: <CrownOutlined />,
      path: '/key-talent',
    },
  ]

  const currentKey = menuItems.find((item: any) => location.pathname === item?.path)?.key as string || 'dashboard'

  // 点击外部关闭展开的子菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (siderRef.current && !siderRef.current.contains(event.target as Node)) {
        setOpenKeys([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMenuClick = (key: string, path: string) => {
    navigate(path)
    // 在移动端或窄屏下点击后自动收起
    if (window.innerWidth < 768) {
      setCollapsed(true)
    }
  }

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

  // 渲染菜单项
  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item: any) => {
      if (item.badge) {
        return {
          ...item,
          label: (
            <span>
              {item.label}
              <Badge count={item.badge} size="small" style={{ marginLeft: 8 }} />
            </span>
          ),
          onClick: () => handleMenuClick(item.key, item.path),
        }
      }
      return {
        ...item,
        onClick: () => handleMenuClick(item.key, item.path),
      }
    })
  }

  return (
    <Sider
      ref={siderRef}
      trigger={null}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      collapsedWidth={80}
      style={{
        background: '#001529',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: collapsed ? 16 : 18,
        fontWeight: 'bold',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        padding: collapsed ? '0 8px' : '0 16px',
      }}>
        {collapsed ? '🤖' : '🤖 HR智能体'}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[currentKey]}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        style={{ 
          borderRight: 0,
          paddingTop: 8,
        }}
        items={renderMenuItems(menuItems)}
      />
      
      {/* 折叠/展开按钮 */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 12,
          cursor: 'pointer',
          padding: '8px 0',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '→' : '← 收起菜单'}
      </div>
    </Sider>
  )
}

export default Sidebar
