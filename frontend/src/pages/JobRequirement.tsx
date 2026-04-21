import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Slider, InputNumber, message, Row, Col, Progress, Avatar, Typography, Badge, Tabs } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined, StarOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

interface JobRequirement {
  id: number
  reqId: string
  title: string
  deptName: string
  positionName: string
  requiredSkills: string[]
  workYearsMin: number
  workYearsMax: number
  educationLevel: string
  headcount: number
  priority: number
  status: number
  description: string
  createTime: string
}

interface MatchResult {
  id?: number
  talentId: string
  name: string
  positionName: string
  deptName: string
  workYears: number
  educationLevel: string
  skills: string[]
  isKeyTalent: number
  matchScore: number
  matchReason: string
  status?: number
}

const JobRequirementPage: React.FC = () => {
  const [requirements, setRequirements] = useState<JobRequirement[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [matchModalVisible, setMatchModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentReq, setCurrentReq] = useState<JobRequirement | null>(null)
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [matchLoading, setMatchLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchRequirements()
  }, [])

  const fetchRequirements = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/job/requirements')
      if (res.data.code === 200) {
        setRequirements(res.data.data)
      }
    } catch (error) {
      message.error('获取招聘需求失败')
    }
    setLoading(false)
  }

  const handleCreate = async (values: any) => {
    try {
      const res = await axios.post('/api/job/requirements', values)
      if (res.data.code === 200) {
        message.success('创建成功')
        setModalVisible(false)
        form.resetFields()
        fetchRequirements()
      }
    } catch (error) {
      message.error('创建失败')
    }
  }

  const handleMatch = async (req: JobRequirement) => {
    console.log('handleMatch called with:', req)
    setCurrentReq(req)
    setMatchModalVisible(true)
    setMatchLoading(true)
    try {
      console.log('Calling API with reqId:', req.reqId)
      const res = await axios.post(`/api/job/match/${req.reqId}`)
      console.log('API response:', res.data)
      if (res.data.code === 200) {
        setMatchResults(res.data.data.matches)
        const totalMatches = res.data.data.matches?.length || 0
        const highMatches = res.data.data.highMatchCount || 0
        if (highMatches > 0) {
          message.success(`匹配完成，找到 ${highMatches} 个高匹配候选人（共${totalMatches}个匹配结果）`)
        } else if (totalMatches > 0) {
          message.success(`匹配完成，找到 ${totalMatches} 个匹配候选人（暂无高匹配度候选人）`)
        } else {
          message.warning('未找到匹配的候选人')
        }
      }
    } catch (error: any) {
      console.error('匹配失败:', error)
      console.error('Error response:', error.response)
      message.error('匹配失败: ' + (error.response?.data?.message || error.message))
    }
    setMatchLoading(false)
  }

  const handleViewDetail = (req: JobRequirement) => {
    setCurrentReq(req)
    setDetailModalVisible(true)
  }

  const handleRecommend = async (record: MatchResult) => {
    try {
      // 保存匹配结果到数据库
      const res = await axios.post('/api/job/match-save', {
        reqId: currentReq?.reqId,
        talentId: record.talentId,
        matchScore: record.matchScore,
        matchReason: record.matchReason
      })
      if (res.data.code === 200) {
        message.success(`已成功推荐 ${record.name} 给该职位`)
      }
    } catch (error) {
      message.error('推荐失败')
    }
  }

  const handleViewTalent = (record: MatchResult) => {
    // 打开人才详情页面或弹窗
    Modal.info({
      title: '人才详情',
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          <p><strong>姓名:</strong> {record.name}</p>
          <p><strong>编号:</strong> {record.talentId}</p>
          <p><strong>职位:</strong> {record.positionName}</p>
          <p><strong>部门:</strong> {record.deptName}</p>
          <p><strong>工作年限:</strong> {record.workYears}年</p>
          <p><strong>学历:</strong> {record.educationLevel}</p>
          <p><strong>匹配度:</strong> {record.matchScore}%</p>
          <p><strong>匹配理由:</strong> {record.matchReason}</p>
        </div>
      ),
      onOk() {},
    })
  }

  const getPriorityTag = (priority: number) => {
    const colors = { 3: 'red', 2: 'orange', 1: 'blue' }
    const texts = { 3: '高', 2: '中', 1: '低' }
    return <Tag color={colors[priority as keyof typeof colors]}>{texts[priority as keyof typeof texts]}优先级</Tag>
  }

  const getStatusTag = (status: number) => {
    const colors = { 1: 'processing', 2: 'warning', 3: 'success' }
    const texts = { 1: '招聘中', 2: '已暂停', 3: '已完成' }
    return <Badge status={colors[status as keyof typeof colors] as any} text={texts[status as keyof typeof texts]} />
  }

  const columns = [
    {
      title: '需求编号',
      dataIndex: 'reqId',
      key: 'reqId',
      width: 100
    },
    {
      title: '需求标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: JobRequirement) => (
        <div>
          <Text strong>{text}</Text>
          <div style={{ fontSize: 12, color: '#666' }}>{record.description?.substring(0, 50)}...</div>
        </div>
      )
    },
    {
      title: '部门/职位',
      key: 'dept',
      render: (_: any, record: JobRequirement) => (
        <div>
          <div>{record.deptName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.positionName}</div>
        </div>
      )
    },
    {
      title: '要求',
      key: 'requirement',
      render: (_: any, record: JobRequirement) => (
        <div>
          <div>{record.educationLevel} · {record.workYearsMin}-{record.workYearsMax || '不限'}年</div>
          <div style={{ marginTop: 4 }}>
            {record.requiredSkills?.slice(0, 3).map((skill: string) => (
              <Tag key={skill} size="small" style={{ marginRight: 4 }}>{skill}</Tag>
            ))}
          </div>
        </div>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: number) => getPriorityTag(priority)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => getStatusTag(status)
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: JobRequirement) => (
        <Space>
          <Button type="primary" size="small" icon={<SearchOutlined />} onClick={() => handleMatch(record)}>
            AI匹配
          </Button>
          <Button size="small" onClick={() => handleViewDetail(record)}>详情</Button>
        </Space>
      )
    }
  ]

  const matchColumns = [
    {
      title: '候选人',
      key: 'talent',
      render: (_: any, record: MatchResult) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div><Text strong>{record.name}</Text></div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.talentId}</div>
          </div>
        </Space>
      )
    },
    {
      title: '当前职位',
      key: 'position',
      render: (_: any, record: MatchResult) => (
        <div>
          <div>{record.positionName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.deptName}</div>
        </div>
      )
    },
    {
      title: '匹配度',
      dataIndex: 'matchScore',
      key: 'matchScore',
      width: 150,
      render: (score: number) => (
        <div>
          <Progress percent={score} size="small" status={score >= 80 ? 'success' : score >= 60 ? 'normal' : 'exception'} />
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{score}% 匹配</div>
        </div>
      )
    },
    {
      title: '匹配理由',
      dataIndex: 'matchReason',
      key: 'matchReason',
      render: (reason: string) => (
        <div style={{ fontSize: 12, color: '#666', maxWidth: 300 }}>
          {reason?.split('; ').map((r, i) => (
            <div key={i}><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />{r}</div>
          ))}
        </div>
      )
    },
    {
      title: '标签',
      key: 'tags',
      width: 150,
      render: (_: any, record: MatchResult) => (
        <Space direction="vertical" size="small">
          {record.isKeyTalent === 1 && <Tag color="gold" icon={<StarOutlined />}>关键人才</Tag>}
          <Tag>{record.workYears}年经验</Tag>
          <Tag>{record.educationLevel}</Tag>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: MatchResult) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleRecommend(record)}>推荐</Button>
          <Button size="small" onClick={() => handleViewTalent(record)}>查看</Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={4}>招聘需求管理</Title>
      <Text type="secondary">发布招聘需求，AI自动匹配合适的候选人</Text>

      <Card style={{ marginTop: 24 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                发布需求
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchRequirements}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col>
            <Text type="secondary">共 {requirements.length} 个招聘需求</Text>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={requirements}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 创建需求弹窗 */}
      <Modal
        title="发布招聘需求"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="需求标题" rules={[{ required: true }]}>
            <Input placeholder="例如：高级Java后端工程师" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="deptName" label="部门" rules={[{ required: true }]}>
                <Select 
                  placeholder="选择部门"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                >
                  <Option value="研发中心">研发中心</Option>
                  <Option value="AI实验室">AI实验室</Option>
                  <Option value="产品部">产品部</Option>
                  <Option value="质量部">质量部</Option>
                  <Option value="人力资源部">人力资源部</Option>
                  <Option value="销售部">销售部</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="positionName" label="职位" rules={[{ required: true }]}>
                <Input placeholder="例如：高级Java工程师" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="requiredSkills" label="所需技能">
            <Select 
              mode="tags" 
              placeholder="输入技能，按回车添加"
              getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
            >
              <Option value="Java">Java</Option>
              <Option value="Python">Python</Option>
              <Option value="React">React</Option>
              <Option value="Vue">Vue</Option>
              <Option value="Spring Boot">Spring Boot</Option>
              <Option value="MySQL">MySQL</Option>
              <Option value="Redis">Redis</Option>
              <Option value="TensorFlow">TensorFlow</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workYearsMin" label="最低工作年限">
                <InputNumber min={0} max={20} style={{ width: '100%' }} placeholder="年" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="workYearsMax" label="最高工作年限">
                <InputNumber min={0} max={30} style={{ width: '100%' }} placeholder="年（可选）" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="educationLevel" label="学历要求">
                <Select 
                  placeholder="选择学历"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                >
                  <Option value="博士">博士</Option>
                  <Option value="硕士">硕士</Option>
                  <Option value="本科">本科</Option>
                  <Option value="大专">大专</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="headcount" label="招聘人数" initialValue={1}>
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="priority" label="优先级" initialValue={2}>
            <Slider marks={{ 1: '低', 2: '中', 3: '高' }} min={1} max={3} step={1} />
          </Form.Item>

          <Form.Item name="description" label="需求描述">
            <Input.TextArea rows={4} placeholder="详细描述岗位职责和要求" />
          </Form.Item>
        </Form>
      </Modal>

      {/* AI匹配结果弹窗 */}
      <Modal
        title={`AI匹配结果 - ${currentReq?.title || ''}`}
        open={matchModalVisible}
        onCancel={() => setMatchModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setMatchModalVisible(false)}>关闭</Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>需求：{currentReq?.deptName || ''} · {currentReq?.positionName || ''}</Text>
          <br />
          <Text type="secondary">技能要求：{currentReq?.requiredSkills?.join(', ') || '无'}</Text>
        </div>
        
        <Table
          columns={matchColumns}
          dataSource={matchResults}
          rowKey="talentId"
          loading={matchLoading}
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* 需求详情弹窗 */}
      <Modal
        title="招聘需求详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>
        ]}
      >
        {currentReq && (
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p><strong>需求编号：</strong>{currentReq.reqId}</p>
                <p><strong>需求标题：</strong>{currentReq.title}</p>
                <p><strong>部门：</strong>{currentReq.deptName}</p>
                <p><strong>职位：</strong>{currentReq.positionName}</p>
              </Col>
              <Col span={12}>
                <p><strong>学历要求：</strong>{currentReq.educationLevel || '不限'}</p>
                <p><strong>工作年限：</strong>{currentReq.workYearsMin || 0}-{currentReq.workYearsMax || '不限'}年</p>
                <p><strong>招聘人数：</strong>{currentReq.headcount}人</p>
                <p><strong>优先级：</strong>{getPriorityTag(currentReq.priority)}</p>
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <p><strong>所需技能：</strong></p>
              <div>
                {currentReq.requiredSkills?.map((skill: string) => (
                  <Tag key={skill} style={{ marginRight: 8, marginBottom: 8 }}>{skill}</Tag>
                )) || '无'}
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <p><strong>需求描述：</strong></p>
              <p style={{ color: '#666', lineHeight: 1.8 }}>{currentReq.description || '暂无描述'}</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <p><strong>状态：</strong>{getStatusTag(currentReq.status)}</p>
              <p><strong>创建时间：</strong>{currentReq.createTime ? new Date(currentReq.createTime).toLocaleString() : '-'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default JobRequirementPage
