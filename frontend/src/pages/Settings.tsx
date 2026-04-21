import React, { useState } from 'react'
import { Card, Form, Input, Button, Switch, Select, Tabs, List, Avatar, Tag, Space, Typography, Divider, message, Upload, Row, Col, Alert } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined, BellOutlined, GlobalOutlined, DatabaseOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { Option } = Select

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1')
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [systemForm] = Form.useForm()

  const handleSaveProfile = (values: any) => {
    console.log('保存个人信息:', values)
    message.success('个人信息保存成功')
  }

  const handleChangePassword = (values: any) => {
    console.log('修改密码:', values)
    message.success('密码修改成功')
    passwordForm.resetFields()
  }

  const handleSaveSystem = (values: any) => {
    console.log('保存系统设置:', values)
    message.success('系统设置保存成功')
  }

  const uploadProps: UploadProps = {
    name: 'avatar',
    action: '/api/upload/avatar',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success('头像上传成功')
      } else if (info.file.status === 'error') {
        message.error('头像上传失败')
      }
    },
  }

  return (
    <div>
      <Title level={4}>系统设置</Title>
      <Text type="secondary">管理个人账号和系统配置</Text>

      <Card style={{ marginTop: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="个人设置" key="1" icon={<UserOutlined />}>
            <Row gutter={24}>
              <Col span={8}>
                <Card title="头像设置" style={{ textAlign: 'center' }}>
                  <Avatar size={120} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
                  <div>
                    <Upload {...uploadProps} showUploadList={false}>
                      <Button icon={<UploadOutlined />}>更换头像</Button>
                    </Upload>
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                    支持 JPG、PNG 格式，大小不超过 2MB
                  </Text>
                </Card>

                <Card title="账号信息" style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">账号ID</Text>
                    <div><Text strong>admin_001</Text></div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">角色</Text>
                    <div><Tag color="red">系统管理员</Tag></div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">部门</Text>
                    <div><Text strong>人力资源部</Text></div>
                  </div>
                  <div>
                    <Text type="secondary">注册时间</Text>
                    <div><Text strong>2023-01-15</Text></div>
                  </div>
                </Card>
              </Col>

              <Col span={16}>
                <Card title="基本信息">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveProfile}
                    initialValues={{
                      name: '管理员',
                      email: 'admin@company.com',
                      phone: '13800138000',
                    }}
                  >
                    <Form.Item
                      name="name"
                      label="姓名"
                      rules={[{ required: true, message: '请输入姓名' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' },
                      ]}
                    >
                      <Input prefix={<GlobalOutlined />} placeholder="请输入邮箱" />
                    </Form.Item>
                    <Form.Item
                      name="phone"
                      label="手机号"
                      rules={[{ required: true, message: '请输入手机号' }]}
                    >
                      <Input placeholder="请输入手机号" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                        保存修改
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>

                <Card title="修改密码" style={{ marginTop: 16 }}>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                  >
                    <Form.Item
                      name="oldPassword"
                      label="当前密码"
                      rules={[{ required: true, message: '请输入当前密码' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
                    </Form.Item>
                    <Form.Item
                      name="newPassword"
                      label="新密码"
                      rules={[
                        { required: true, message: '请输入新密码' },
                        { min: 8, message: '密码长度至少8位' },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
                    </Form.Item>
                    <Form.Item
                      name="confirmPassword"
                      label="确认新密码"
                      rules={[
                        { required: true, message: '请确认新密码' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve()
                            }
                            return Promise.reject(new Error('两次输入的密码不一致'))
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                        修改密码
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="安全设置" key="2" icon={<SafetyOutlined />}>
            <Card title="登录安全">
              <List>
                <List.Item
                  actions={[<Switch defaultChecked />]}
                >
                  <List.Item.Meta
                    title="双重认证"
                    description="开启后登录时需要输入手机验证码"
                  />
                </List.Item>
                <List.Item
                  actions={[<Switch defaultChecked />]}
                >
                  <List.Item.Meta
                    title="登录提醒"
                    description="新设备登录时发送邮件提醒"
                  />
                </List.Item>
                <List.Item
                  actions={[<Button type="primary" size="small">查看</Button>]}
                >
                  <List.Item.Meta
                    title="登录设备管理"
                    description="管理已登录的设备"
                  />
                </List.Item>
              </List>
            </Card>

            <Card title="操作日志" style={{ marginTop: 16 }}>
              <List
                dataSource={[
                  { action: '登录系统', time: '2024-01-15 14:30:00', ip: '192.168.1.100', status: 'success' },
                  { action: '修改密码', time: '2024-01-14 09:15:00', ip: '192.168.1.100', status: 'success' },
                  { action: '更新个人信息', time: '2024-01-13 16:45:00', ip: '192.168.1.100', status: 'success' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong>{item.action}</Text>
                        <div><Text type="secondary">IP: {item.ip}</Text></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>{item.time}</div>
                        <Tag color="green" style={{ marginTop: 4 }}>成功</Tag>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>

          <TabPane tab="通知设置" key="3" icon={<BellOutlined />}>
            <Card>
              <List>
                <List.Item
                  actions={[<Switch defaultChecked />]}
                >
                  <List.Item.Meta
                    title="系统通知"
                    description="接收系统更新、维护等通知"
                  />
                </List.Item>
                <List.Item
                  actions={[<Switch defaultChecked />]}
                >
                  <List.Item.Meta
                    title="数据告警"
                    description="数据质量问题告警通知"
                  />
                </List.Item>
                <List.Item
                  actions={[<Switch defaultChecked />]}
                >
                  <List.Item.Meta
                    title="审批提醒"
                    description="待审批事项提醒"
                  />
                </List.Item>
                <List.Item
                  actions={[<Switch />]}
                >
                  <List.Item.Meta
                    title="邮件通知"
                    description="接收邮件形式的通知"
                  />
                </List.Item>
                <List.Item
                  actions={[<Switch defaultChecked />]}
                >
                  <List.Item.Meta
                    title="短信通知"
                    description="接收短信形式的重要通知"
                  />
                </List.Item>
              </List>
            </Card>
          </TabPane>

          <TabPane tab="系统配置" key="4" icon={<DatabaseOutlined />}>
            <Form
              form={systemForm}
              layout="vertical"
              onFinish={handleSaveSystem}
              initialValues={{
                companyName: 'XX科技有限公司',
                systemName: 'HR智能体系统',
                language: 'zh-CN',
                timezone: 'Asia/Shanghai',
                dateFormat: 'YYYY-MM-DD',
              }}
            >
              <Card title="基础配置">
                <Form.Item
                  name="companyName"
                  label="公司名称"
                  rules={[{ required: true, message: '请输入公司名称' }]}
                >
                  <Input placeholder="请输入公司名称" />
                </Form.Item>
                <Form.Item
                  name="systemName"
                  label="系统名称"
                  rules={[{ required: true, message: '请输入系统名称' }]}
                >
                  <Input placeholder="请输入系统名称" />
                </Form.Item>
                <Form.Item
                  name="language"
                  label="系统语言"
                >
                  <Select>
                    <Option value="zh-CN">简体中文</Option>
                    <Option value="zh-TW">繁體中文</Option>
                    <Option value="en-US">English</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="timezone"
                  label="时区"
                >
                  <Select>
                    <Option value="Asia/Shanghai">Asia/Shanghai (GMT+8)</Option>
                    <Option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</Option>
                    <Option value="America/New_York">America/New_York (GMT-5)</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="dateFormat"
                  label="日期格式"
                >
                  <Select>
                    <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                    <Option value="YYYY/MM/DD">YYYY/MM/DD</Option>
                    <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  </Select>
                </Form.Item>
              </Card>

              <Card title="功能配置" style={{ marginTop: 16 }}>
                <List>
                  <List.Item
                    actions={[<Switch defaultChecked />]}
                  >
                    <List.Item.Meta
                      title="启用AI助手"
                      description="开启智能问答和推荐功能"
                    />
                  </List.Item>
                  <List.Item
                    actions={[<Switch defaultChecked />]}
                  >
                    <List.Item.Meta
                      title="自动数据备份"
                      description="每天自动备份系统数据"
                    />
                  </List.Item>
                  <List.Item
                    actions={[<Switch defaultChecked />]}
                  >
                    <List.Item.Meta
                      title="数据脱敏"
                      description="对敏感数据进行脱敏处理"
                    />
                  </List.Item>
                </List>
              </Card>

              <Form.Item style={{ marginTop: 24 }}>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  保存配置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default Settings
