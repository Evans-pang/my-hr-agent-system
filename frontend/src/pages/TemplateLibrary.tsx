import React, { useState } from 'react'
import { Card, Row, Col, Input, Button, Tag, List, Avatar, Space, Typography, Tabs, Badge, Modal, Form, Select, message } from 'antd'
import { SearchOutlined, PlusOutlined, FileTextOutlined, CopyOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, FileWordOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { Option } = Select
const { TabPane } = Tabs
const { TextArea } = Input

const TemplateLibrary: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [form] = Form.useForm()

  const templates = [
    {
      id: '1',
      name: '劳动合同模板',
      category: '合同协议',
      type: 'word',
      description: '标准劳动合同模板，适用于全职员工',
      tags: ['合同', '入职'],
      usageCount: 156,
      updateTime: '2024-01-10',
      author: 'HR部门',
    },
    {
      id: '2',
      name: '离职申请表',
      category: '表单',
      type: 'word',
      description: '员工离职申请标准表单',
      tags: ['离职', '表单'],
      usageCount: 89,
      updateTime: '2024-01-08',
      author: 'HR部门',
    },
    {
      id: '3',
      name: '绩效考核表',
      category: '考核',
      type: 'excel',
      description: '季度绩效考核评估表',
      tags: ['绩效', '考核'],
      usageCount: 234,
      updateTime: '2024-01-05',
      author: 'HR部门',
    },
    {
      id: '4',
      name: '面试评估表',
      category: '招聘',
      type: 'word',
      description: '候选人面试评估记录表',
      tags: ['招聘', '面试'],
      usageCount: 312,
      updateTime: '2024-01-12',
      author: '招聘组',
    },
    {
      id: '5',
      name: '培训记录表',
      category: '培训',
      type: 'excel',
      description: '员工培训参与记录表',
      tags: ['培训', '记录'],
      usageCount: 178,
      updateTime: '2024-01-03',
      author: '培训组',
    },
    {
      id: '6',
      name: '薪酬调整审批表',
      category: '薪酬',
      type: 'word',
      description: '员工薪酬调整审批流程表单',
      tags: ['薪酬', '审批'],
      usageCount: 67,
      updateTime: '2024-01-15',
      author: '薪酬组',
    },
  ]

  const categories = [
    { name: '全部', count: 45 },
    { name: '合同协议', count: 12 },
    { name: '表单', count: 15 },
    { name: '考核', count: 8 },
    { name: '招聘', count: 6 },
    { name: '培训', count: 4 },
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'word':
        return <FileWordOutlined style={{ fontSize: 48, color: '#1890ff' }} />
      case 'excel':
        return <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a' }} />
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
      default:
        return <FileTextOutlined style={{ fontSize: 48, color: '#666' }} />
    }
  }

  const handlePreview = (template: any) => {
    setSelectedTemplate(template)
    setPreviewModalVisible(true)
  }

  const handleDownload = async (template: any) => {
    try {
      const response = await axios.get(`/api/template/download/${template.id}`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      const fileName = `${template.name}.docx`
      
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      message.success('下载成功')
    } catch (error) {
      console.error('下载失败:', error)
      message.error('下载失败')
    }
  }

  const handleCreate = (values: any) => {
    console.log('创建模板:', values)
    message.success('模板创建成功')
    setCreateModalVisible(false)
    form.resetFields()
  }

  return (
    <div>
      <Title level={4}>模板库</Title>
      <Text type="secondary">标准化文档模板，提升HR工作效率</Text>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={5}>
          <Card title="模板分类" size="small">
            <List
              dataSource={categories}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '12px 0' }}
                  actions={[<Badge count={item.count} style={{ backgroundColor: '#1890ff' }} />]}
                >
                  <Text>{item.name}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={19}>
          <Card
            title={
              <Space>
                <Search
                  placeholder="搜索模板名称"
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                />
              </Space>
            }
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                新建模板
              </Button>
            }
          >
            <Tabs defaultActiveKey="1">
              <TabPane tab="全部模板" key="1">
                <List
                  grid={{ gutter: 16, column: 3 }}
                  dataSource={templates}
                  renderItem={(item) => (
                    <List.Item>
                      <Card
                        hoverable
                        actions={[
                          <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreview(item)}>预览</Button>,
                          <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(item)}>下载</Button>,
                          <Button type="link" icon={<CopyOutlined />}>复制</Button>,
                        ]}
                      >
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          {getFileIcon(item.type)}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <Text strong style={{ fontSize: 16 }}>{item.name}</Text>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                          <Tag color="blue">{item.category}</Tag>
                        </div>
                        <Paragraph type="secondary" style={{ marginTop: 8, textAlign: 'center' }} ellipsis={{ rows: 2 }}>
                          {item.description}
                        </Paragraph>
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>使用 {item.usageCount} 次</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{item.updateTime}</Text>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </TabPane>

              <TabPane tab="我的模板" key="2">
                <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                  <FileTextOutlined style={{ fontSize: 48 }} />
                  <p>暂无个人模板</p>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                    创建模板
                  </Button>
                </div>
              </TabPane>

              <TabPane tab="最近使用" key="3">
                <List
                  itemLayout="horizontal"
                  dataSource={templates.slice(0, 3)}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreview(item)}>预览</Button>,
                        <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(item)}>下载</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={getFileIcon(item.type)}
                        title={item.name}
                        description={
                          <Space>
                            <Tag>{item.category}</Tag>
                            <Text type="secondary">使用 {item.usageCount} 次</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Modal
        title="新建模板"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item
            name="category"
            label="所属分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="contract">合同协议</Option>
              <Option value="form">表单</Option>
              <Option value="assessment">考核</Option>
              <Option value="recruitment">招聘</Option>
              <Option value="training">培训</Option>
              <Option value="salary">薪酬</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="type"
            label="文件类型"
            rules={[{ required: true, message: '请选择文件类型' }]}
          >
            <Select placeholder="请选择文件类型">
              <Option value="word">Word 文档</Option>
              <Option value="excel">Excel 表格</Option>
              <Option value="pdf">PDF 文档</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="模板描述"
          >
            <TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="模板预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>关闭</Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => selectedTemplate && handleDownload(selectedTemplate)}>下载模板</Button>,
        ]}
        width={700}
      >
        {selectedTemplate && (
          <div>
            <div style={{ textAlign: 'center', padding: 40, background: '#f5f5f5', borderRadius: 4, marginBottom: 24 }}>
              {getFileIcon(selectedTemplate.type)}
              <div style={{ marginTop: 16 }}>
                <Title level={5}>{selectedTemplate.name}</Title>
              </div>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{selectedTemplate.category}</Tag>
              </div>
            </div>
            <div>
              <Title level={5}>模板信息</Title>
              <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                <p><Text strong>描述：</Text>{selectedTemplate.description}</p>
                <p><Text strong>标签：</Text>{selectedTemplate.tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>)}</p>
                <p><Text strong>使用次数：</Text>{selectedTemplate.usageCount}</p>
                <p><Text strong>更新时间：</Text>{selectedTemplate.updateTime}</p>
                <p><Text strong>作者：</Text>{selectedTemplate.author}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TemplateLibrary
