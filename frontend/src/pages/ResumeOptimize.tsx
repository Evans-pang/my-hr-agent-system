import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Upload, message, Row, Col, Typography, Divider, List, Progress } from 'antd'
import { UploadOutlined, FileTextOutlined, PlusOutlined, DownloadOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

interface ResumeOptimizeTask {
  id: number
  taskId: string
  talentId: string
  talentName: string
  targetPosition: string
  targetClient: string
  originalContent: string
  optimizedContent: string
  optimizeScore: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createTime: string
  optimizeSuggestions: string[]
}

const ResumeOptimize: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [taskList, setTaskList] = useState<ResumeOptimizeTask[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState<ResumeOptimizeTask | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTaskList()
  }, [])

  const fetchTaskList = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/resume/optimize-tasks')
      if (res.data.code === 200) {
        setTaskList(res.data.data)
      }
    } catch (error) {
      message.error('获取任务列表失败')
    }
    setLoading(false)
  }

  const handleCreate = async (values: any) => {
    try {
      const res = await axios.post('/api/resume/optimize', values)
      if (res.data.code === 200) {
        message.success('创建优化任务成功')
        setModalVisible(false)
        form.resetFields()
        fetchTaskList()
      }
    } catch (error) {
      message.error('创建失败')
    }
  }

  const handlePreview = (task: ResumeOptimizeTask) => {
    setCurrentTask(task)
    setPreviewModalVisible(true)
  }

  const handleDownload = async (taskId: string) => {
    try {
      const res = await axios.get(`/api/resume/optimize-download/${taskId}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `optimized-resume-${taskId}.docx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('下载成功')
    } catch (error) {
      message.error('下载失败')
    }
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending': return <Tag color="default">待处理</Tag>
      case 'processing': return <Tag color="processing">优化中</Tag>
      case 'completed': return <Tag color="success">已完成</Tag>
      case 'failed': return <Tag color="error">失败</Tag>
      default: return <Tag>未知</Tag>
    }
  }

  const columns = [
    {
      title: '任务编号',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 120,
    },
    {
      title: '人才姓名',
      dataIndex: 'talentName',
      key: 'talentName',
    },
    {
      title: '目标岗位',
      dataIndex: 'targetPosition',
      key: 'targetPosition',
    },
    {
      title: '目标客户',
      dataIndex: 'targetClient',
      key: 'targetClient',
    },
    {
      title: '优化评分',
      dataIndex: 'optimizeScore',
      key: 'optimizeScore',
      render: (score: number) => (
        score > 0 ? <Progress percent={score} size="small" status={score >= 80 ? 'success' : 'normal'} /> : '-'
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ResumeOptimizeTask) => (
        <Space>
          {record.status === 'completed' && (
            <>
              <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
                预览
              </Button>
              <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(record.taskId)}>
                下载
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card 
        title="外部简历优化" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建优化任务
          </Button>
        }
      >
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          针对客户及特定岗位需求，自动进行简历美化，提升简历竞争力，为招投标提供支持。
        </Paragraph>
        
        <Table
          columns={columns}
          dataSource={taskList}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 创建优化任务弹窗 */}
      <Modal
        title="新建简历优化任务"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="talentId"
            label="选择人才"
            rules={[{ required: true, message: '请选择人才' }]}
          >
            <Select 
              placeholder="选择需要优化简历的人才"
              getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
            >
              <Option value="T000001">张三 - 高级Java工程师</Option>
              <Option value="T000002">李四 - AI算法工程师</Option>
              <Option value="T000003">王五 - 产品经理</Option>
            </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="targetPosition"
                label="目标岗位"
                rules={[{ required: true, message: '请输入目标岗位' }]}
              >
                <Input placeholder="例如：高级架构师" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetClient"
                label="目标客户"
                rules={[{ required: true, message: '请输入目标客户' }]}
              >
                <Input placeholder="例如：某银行客户" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="requirements"
            label="客户需求描述"
            rules={[{ required: true, message: '请输入客户需求' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请描述客户对人才的具体要求，如技能要求、项目经验、行业背景等"
            />
          </Form.Item>

          <Form.Item
            name="highlightPoints"
            label="重点突出内容"
          >
            <TextArea 
              rows={3} 
              placeholder="请描述需要在简历中重点突出的内容，如特定项目经验、技术专长等"
            />
          </Form.Item>

          <Form.Item
            name="style"
            label="简历风格"
            initialValue="professional"
          >
            <Select getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}>
              <Option value="professional">专业严谨型</Option>
              <Option value="technical">技术深度型</Option>
              <Option value="business">业务导向型</Option>
              <Option value="concise">简洁明了型</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览弹窗 */}
      <Modal
        title="优化后简历预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>关闭</Button>,
          currentTask?.status === 'completed' && (
            <Button 
              key="download" 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => currentTask && handleDownload(currentTask.taskId)}
            >
              下载优化简历
            </Button>
          )
        ]}
      >
        {currentTask && (
          <div style={{ maxHeight: 600, overflow: 'auto', padding: '0 16px' }}>
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>优化信息</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>人才：</strong>{currentTask.talentName}</p>
                  <p><strong>目标岗位：</strong>{currentTask.targetPosition}</p>
                </Col>
                <Col span={12}>
                  <p><strong>目标客户：</strong>{currentTask.targetClient}</p>
                  <p><strong>优化评分：</strong>{currentTask.optimizeScore}/100</p>
                </Col>
              </Row>
            </div>

            <Divider />

            <div style={{ marginBottom: 24 }}>
              <Title level={4}>优化建议</Title>
              <List
                dataSource={currentTask.optimizeSuggestions || []}
                renderItem={(item, index) => (
                  <List.Item>
                    <Text>{index + 1}. {item}</Text>
                  </List.Item>
                )}
              />
            </div>

            <Divider />

            <div>
              <Title level={4}>优化后内容预览</Title>
              <div style={{ 
                background: '#f5f5f5', 
                padding: 16, 
                borderRadius: 4,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: 14,
                lineHeight: 1.8
              }}>
                {currentTask.optimizedContent || '暂无内容'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ResumeOptimize
