import React, { useState } from 'react'
import { Form, Input, Button, Card, Checkbox, Typography, Space, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined, MobileOutlined, WechatOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('account')
  const navigate = useNavigate()

  const handleLogin = async (values: any) => {
    setLoading(true)
    try {
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 存储登录信息
      localStorage.setItem('token', 'mock_token_' + Date.now())
      localStorage.setItem('userInfo', JSON.stringify({
        username: values.username,
        name: '管理员',
        role: 'admin',
        avatar: null,
      }))
      
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      message.error('登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  const handleSSOLogin = () => {
    message.info('SSO登录功能开发中')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <SafetyOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title level={4} style={{ marginBottom: 8 }}>HR智能体系统</Title>
          <Text type="secondary">人力资源管理智能平台</Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: 'account',
              label: '账号密码登录',
              children: (
                <Form
                  form={form}
                  name="login"
                  onFinish={handleLogin}
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="用户名"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="密码"
                    />
                  </Form.Item>

                  <Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>记住我</Checkbox>
                      </Form.Item>
                      <a href="#">忘记密码?</a>
                    </div>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      style={{
                        background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
                        border: 'none',
                      }}
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'sso',
              label: '企业SSO登录',
              children: (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      icon={<SafetyOutlined />}
                      size="large"
                      block
                      onClick={handleSSOLogin}
                    >
                      企业微信登录
                    </Button>
                    <Button
                      icon={<WechatOutlined />}
                      size="large"
                      block
                      onClick={handleSSOLogin}
                    >
                      钉钉登录
                    </Button>
                    <Button
                      icon={<MobileOutlined />}
                      size="large"
                      block
                      onClick={handleSSOLogin}
                    >
                      LDAP登录
                    </Button>
                  </Space>
                </div>
              ),
            },
          ]}
        />

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            © 2024 HR智能体系统 · 企业级人力资源管理平台
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login
