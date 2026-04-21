import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Progress, Button, DatePicker, message, Typography, Divider, List, Space } from 'antd'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { DownloadOutlined, ReloadOutlined, FileTextOutlined, EyeOutlined, DownloadOutlined as DownloadIcon, FileExcelOutlined, StarOutlined, RiseOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface ReportData {
  overview: {
    totalAccess: number
    highQualityCount: number
    highQualityRate: number
    avgQualityScore: number
  }
  accessTypeDistribution: Array<{ type: string; typeCode: number; count: number }>
  deptAccessDistribution: Array<{ deptName: string; count: number }>
  qualityScoreDistribution: Array<{ scoreRange: string; label: string; count: number }>
  accessTrend: Array<{ month: string; count: number }>
}

interface FullReport {
  title: string
  generatedAt: string
  summary: {
    totalAccess: number
    highQualityCount: number
    highQualityRate: number
    avgQualityScore: number
    topAccessType: string
    topAccessDept: string
    topPurpose: string
  }
  insights: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B']
const QUALITY_COLORS = ['#52c41a', '#73d13d', '#faad14', '#ff7875', '#f5222d']

const DataReport: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [fullReport, setFullReport] = useState<FullReport | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [overviewRes, fullRes] = await Promise.all([
        axios.get('/api/report/overview'),
        axios.get('/api/report/full')
      ])
      
      if (overviewRes.data.code === 200) {
        setReportData(overviewRes.data.data)
      }
      
      if (fullRes.data.code === 200) {
        setFullReport(fullRes.data.data)
      }
    } catch (error) {
      message.error('获取数据失败')
    }
    setLoading(false)
  }

  const handleExport = () => {
    message.success('报告导出功能开发中')
  }

  // 优质简历覆盖率颜色
  const getCoverageColor = (rate: number) => {
    if (rate >= 70) return '#52c41a'
    if (rate >= 50) return '#faad14'
    return '#ff4d4f'
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4}>简历调取数据分析报告</Title>
          <Text type="secondary">基于数据仪表盘自动生成周期性分析报告，包含简历调取分布情况、优质简历覆盖率等</Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>刷新数据</Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>导出报告</Button>
          </Space>
        </Col>
      </Row>

      {/* 核心指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="简历调取总次数"
              value={reportData?.overview.totalAccess || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="优质简历数量"
              value={reportData?.overview.highQualityCount || 0}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>优质简历覆盖率</div>
                <div style={{ fontSize: 32, fontWeight: 500, color: getCoverageColor(reportData?.overview.highQualityRate || 0) }}>
                  {reportData?.overview.highQualityRate || 0}%
                </div>
              </div>
              <Progress 
                type="circle" 
                percent={reportData?.overview.highQualityRate || 0} 
                width={60}
                strokeColor={getCoverageColor(reportData?.overview.highQualityRate || 0)}
                format={() => ''}
              />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均质量评分"
              value={reportData?.overview.avgQualityScore || 0}
              suffix="分"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="调取类型分布" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData?.accessTypeDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                >
                  {(reportData?.accessTypeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="部门调取分布" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.deptAccessDistribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="deptName" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="简历质量评分分布" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.qualityScoreDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scoreRange" />
                <YAxis />
                <Tooltip formatter={(value, name, props) => [`${value}份`, props.payload.label]} />
                <Bar dataKey="count" fill="#8884d8">
                  {(reportData?.qualityScoreDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={QUALITY_COLORS[index % QUALITY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="调取趋势（近6个月）" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData?.accessTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 数据洞察 */}
      <Card title="智能洞察" loading={loading}>
        <List
          dataSource={fullReport?.insights || []}
          renderItem={(item, index) => (
            <List.Item>
              <Text>{index + 1}. {item}</Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default DataReport
