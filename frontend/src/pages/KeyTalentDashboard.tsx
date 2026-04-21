import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Progress, Statistic, Row, Col, Timeline, Alert, Badge, Tabs } from 'antd'
import { TeamOutlined, WarningOutlined, RiseOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

const { TabPane } = Tabs

interface KeyTalent {
  id: number
  talentId: string
  name: string
  deptName: string
  positionName: string
  workYears: number
  educationLevel: string
  skills: string[]
  performanceLevel: 'A' | 'B' | 'C'
  riskLevel: 'high' | 'medium' | 'low'
  retentionScore: number
  lastProject: string
  careerPlan: string
  joinDate: string
}

const KeyTalentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [keyTalents, setKeyTalents] = useState<KeyTalent[]>([])
  const [stats, setStats] = useState({
    totalKeyTalent: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    avgRetentionScore: 0
  })

  useEffect(() => {
    fetchKeyTalentData()
  }, [])

  const fetchKeyTalentData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/talent/key-talent-dashboard')
      if (res.data.code === 200) {
        setKeyTalents(res.data.data.list)
        setStats(res.data.data.stats)
      }
    } catch (error) {
      console.error('获取关键人才数据失败:', error)
    }
    setLoading(false)
  }

  const getRiskTag = (level: string) => {
    switch (level) {
      case 'high': return <Tag color="red">高风险</Tag>
      case 'medium': return <Tag color="orange">中风险</Tag>
      case 'low': return <Tag color="green">低风险</Tag>
      default: return <Tag>未知</Tag>
    }
  }

  const getPerformanceTag = (level: string) => {
    switch (level) {
      case 'A': return <Tag color="green">A级</Tag>
      case 'B': return <Tag color="blue">B级</Tag>
      case 'C': return <Tag color="orange">C级</Tag>
      default: return <Tag>-</Tag>
    }
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '部门',
      dataIndex: 'deptName',
      key: 'deptName',
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
    },
    {
      title: '绩效等级',
      dataIndex: 'performanceLevel',
      key: 'performanceLevel',
      render: (level: string) => getPerformanceTag(level)
    },
    {
      title: '流失风险',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level: string) => getRiskTag(level)
    },
    {
      title: '留存评分',
      dataIndex: 'retentionScore',
      key: 'retentionScore',
      render: (score: number) => (
        <Progress percent={score} size="small" status={score < 60 ? 'exception' : 'success'} />
      )
    },
    {
      title: '最近项目',
      dataIndex: 'lastProject',
      key: 'lastProject',
    }
  ]

  return (
    <div>
      <Alert
        message="关键人才看板"
        description="关注高码开发人才和AI开发人才全生命周期，持续关注人才流失率并分析流失原因。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="关键人才总数"
              value={stats.totalKeyTalent}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="高风险人才"
              value={stats.highRiskCount}
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="中风险人才"
              value={stats.mediumRiskCount}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均留存评分"
              value={stats.avgRetentionScore}
              suffix="/100"
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="关键人才列表" extra={<Button onClick={fetchKeyTalentData}>刷新数据</Button>}>
        <Table
          columns={columns}
          dataSource={keyTalents}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default KeyTalentDashboard
