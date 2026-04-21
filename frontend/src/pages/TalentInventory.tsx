import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Tag, Button, Statistic, Select, Tabs, List, Avatar, Space, Typography, message } from 'antd'
import { TeamOutlined, RiseOutlined, FallOutlined, WarningOutlined, UserOutlined, AimOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

interface InventoryItem {
  id: number
  talentId: string
  name: string
  positionName: string
  legalEntity: string
  organizationLocation: string
  performance: string
  potential: string
  category: string
  risk: string
  workYears: number
  educationLevel: string
  isKeyTalent: number
}

const TalentInventory: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('2024Q1')

  useEffect(() => {
    fetchInventoryData()
  }, [selectedPeriod])

  const fetchInventoryData = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/talent/inventory?period=${selectedPeriod}`)
      if (res.data.code === 200) {
        setInventoryData(res.data.data)
      }
    } catch (error) {
      message.error('获取盘点数据失败')
    }
    setLoading(false)
  }

  // 统计各分类人数
  const categoryStats = {
    star: inventoryData.filter(d => d.category === '明星员工').length,
    core: inventoryData.filter(d => d.category === '核心骨干').length,
    expert: inventoryData.filter(d => d.category === '专家人才').length,
    potential: inventoryData.filter(d => d.category === '潜力人才').length,
    stable: inventoryData.filter(d => d.category === '稳定贡献').length,
    skilled: inventoryData.filter(d => d.category === '熟练员工').length,
    improve: inventoryData.filter(d => d.category === '待提升').length,
    observe: inventoryData.filter(d => d.category === '待观察').length,
    problem: inventoryData.filter(d => d.category === '问题员工').length,
  }

  // 统计数据
  const totalCount = inventoryData.length
  const coreTalentCount = inventoryData.filter(d => d.category === '明星员工' || d.category === '核心骨干').length
  const promotionCount = inventoryData.filter(d => d.potential === '高').length
  const riskCount = inventoryData.filter(d => d.risk !== '无').length

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: InventoryItem) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{text}</Text>
          {record.isKeyTalent === 1 && <Tag color="gold">关键</Tag>}
        </Space>
      ),
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
    },
    {
      title: '部门/地区',
      key: 'dept',
      render: (_: any, record: InventoryItem) => (
        <span>{record.legalEntity || record.organizationLocation || '未知'}</span>
      ),
    },
    {
      title: '绩效',
      dataIndex: 'performance',
      key: 'performance',
      render: (text: string) => (
        <Tag color={text === 'A' ? 'red' : text === 'B+' ? 'orange' : text === 'B' ? 'blue' : 'default'}>
          {text}
        </Tag>
      ),
    },
    {
      title: '潜力',
      dataIndex: 'potential',
      key: 'potential',
      render: (text: string) => (
        <Tag color={text === '高' ? 'green' : text === '中' ? 'blue' : 'default'}>
          {text}
        </Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          '明星员工': 'red',
          '核心骨干': 'orange',
          '专家人才': 'green',
          '潜力人才': 'cyan',
          '稳定贡献': 'blue',
          '熟练员工': 'default',
          '待提升': 'warning',
          '待观察': 'default',
          '问题员工': 'error',
        }
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>
      },
    },
    {
      title: '风险',
      dataIndex: 'risk',
      key: 'risk',
      render: (text: string) => (
        text !== '无' ? <Tag color="error">{text}</Tag> : <Tag color="success">无</Tag>
      ),
    },
  ]

  return (
    <div>
      <Title level={4}>人才盘点</Title>
      <Text type="secondary">定期评估人才现状，识别关键人才与发展需求</Text>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="盘点人数"
              value={totalCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="核心人才"
              value={coreTalentCount}
              prefix={<AimOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="晋升储备"
              value={promotionCount}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="风险预警"
              value={riskCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 人才盘点表 */}
      <Card
        title="人才盘点表"
        extra={
          <Space>
            <Select value={selectedPeriod} onChange={setSelectedPeriod} style={{ width: 120 }}>
              <Option value="2024Q1">2024 Q1</Option>
              <Option value="2024Q2">2024 Q2</Option>
              <Option value="2024Q3">2024 Q3</Option>
              <Option value="2024Q4">2024 Q4</Option>
            </Select>
            <Button type="primary" onClick={fetchInventoryData} loading={loading}>
              发起盘点
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="grid">
          <TabPane tab="九宫格视图" key="grid">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" title={<Text type="danger">明星员工</Text>} extra={<Text strong>{categoryStats.star}人</Text>}>
                  <Text type="secondary">高绩效-高潜力</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<Text style={{ color: '#1890ff' }}>核心骨干</Text>} extra={<Text strong>{categoryStats.core}人</Text>}>
                  <Text type="secondary">高绩效-中潜力</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<Text style={{ color: '#52c41a' }}>专家人才</Text>} extra={<Text strong>{categoryStats.expert}人</Text>}>
                  <Text type="secondary">高绩效-低潜力</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<Text style={{ color: '#faad14' }}>潜力人才</Text>} extra={<Text strong>{categoryStats.potential}人</Text>}>
                  <Text type="secondary">中绩效-高潜力</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<Text>稳定贡献</Text>} extra={<Text strong>{categoryStats.stable}人</Text>}>
                  <Text type="secondary">中绩效-中潜力</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<Text>熟练员工</Text>} extra={<Text strong>{categoryStats.skilled}人</Text>}>
                  <Text type="secondary">中绩效-低潜力</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<Text type="warning">待提升</Text>} extra={<Text strong>{categoryStats.improve}人</Text>}>
                  <Text type="secondary">低绩效-高潜力</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<Text type="secondary">待观察</Text>} extra={<Text strong>{categoryStats.observe}人</Text>}>
                  <Text type="secondary">低绩效-中潜力</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<Text type="danger">问题员工</Text>} extra={<Text strong>{categoryStats.problem}人</Text>}>
                  <Text type="secondary">低绩效-低潜力</Text>
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="列表视图" key="list">
            <Table
              columns={columns}
              dataSource={inventoryData}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="部门分析" key="dept">
            <Text>部门分析功能开发中...</Text>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default TalentInventory
