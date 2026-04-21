import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, DatePicker, Select, Button, Space, Empty } from 'antd'
import {
  UserOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilterOutlined,
  ReloadOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import axios from 'axios'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

interface DashboardStats {
  totalCount: number
  newHires: number
  resignations: number
  avgTenure: number
  keyTalentCount: number
  educationDistribution: Array<{ name: string; value: number }>
  deptDistribution: Array<{ name: string; value: number }>
  positionDistribution: Array<{ name: string; value: number }>
  yearsDistribution: Array<{ name: string; value: number }>
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCount: 0,
    newHires: 0,
    resignations: 0,
    avgTenure: 0,
    keyTalentCount: 0,
    educationDistribution: [],
    deptDistribution: [],
    positionDistribution: [],
    yearsDistribution: [],
  })
  
  // 筛选条件
  const [filters, setFilters] = useState({
    dept: 'all',
    position: 'all',
    education: 'all',
    workYears: 'all',
    dateRange: null as any,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [filters])

  const fetchDashboardData = () => {
    // 构建查询参数
    const params = new URLSearchParams()
    if (filters.dept !== 'all') params.append('dept', filters.dept)
    if (filters.position !== 'all') params.append('position', filters.position)
    if (filters.education !== 'all') params.append('education', filters.education)
    if (filters.workYears !== 'all') params.append('workYears', filters.workYears)
    
    // 添加入职日期筛选参数
    if (filters.dateRange && filters.dateRange.length === 2) {
      const startDate = filters.dateRange[0]?.format('YYYY-MM-DD')
      const endDate = filters.dateRange[1]?.format('YYYY-MM-DD')
      if (startDate) params.append('entryDateStart', startDate)
      if (endDate) params.append('entryDateEnd', endDate)
    }
    
    axios.get(`/api/talent/dashboard/stats?${params.toString()}`).then(res => {
      if (res.data.code === 200) {
        setStats(res.data.data)
      }
    }).catch((err) => {
      console.error('获取仪表盘数据失败:', err)
    })
  }

  const handleReset = () => {
    setFilters({
      dept: 'all',
      position: 'all',
      education: 'all',
      workYears: 'all',
      dateRange: null,
    })
  }

  // 地域分布图表配置（使用organization_location数据）
  const deptChartOption = {
    title: { text: '地域分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: stats.deptDistribution?.map(d => d.name) || [],
    },
    yAxis: { type: 'value' },
    series: [{
      data: stats.deptDistribution?.map(d => d.value) || [],
      type: 'bar',
      itemStyle: { color: '#1890ff' },
    }],
  }

  // 学历分布图表配置
  const eduChartOption = {
    title: { text: '学历分布', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: stats.educationDistribution || [],
    }],
  }

  // 职位分布图表配置
  const positionChartOption = {
    title: { text: '职位分布', left: 'center' },
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      formatter: function(params: any) {
        const data = params[0];
        return `${data.name}<br/>人数: ${data.value}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: stats.positionDistribution?.map(d => d.name) || [],
      axisLabel: {
        width: 100,
        overflow: 'truncate',
        ellipsis: '...',
        interval: 0,
        fontSize: 11
      },
      triggerEvent: true
    },
    series: [{
      data: stats.positionDistribution?.map(d => ({ 
        value: d.value, 
        name: d.name 
      })) || [],
      type: 'bar',
      itemStyle: { color: '#52c41a' },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}'
      }
    }],
  }

  // 工作年限分布图表配置
  const yearsChartOption = {
    title: { text: '工作年限分布', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: stats.yearsDistribution || [],
    }],
  }

  return (
    <div>
      {/* 多维度筛选区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap style={{ width: '100%' }}>
          <span style={{ fontWeight: 'bold', marginRight: 8 }}>
            <FilterOutlined /> 多维度筛选：
          </span>
          
          <Select
            style={{ width: 150 }}
            placeholder="选择地域"
            value={filters.dept}
            onChange={(value) => setFilters({ ...filters, dept: value })}
            allowClear
          >
            <Option value="all">全部地域</Option>
            <Option value="西安">西安</Option>
            <Option value="南京">南京</Option>
            <Option value="深圳">深圳</Option>
            <Option value="成都">成都</Option>
            <Option value="大连">大连</Option>
            <Option value="北京">北京</Option>
            <Option value="长沙">长沙</Option>
            <Option value="武汉">武汉</Option>
            <Option value="上海">上海</Option>
            <Option value="杭州">杭州</Option>
          </Select>

          <Select
            style={{ width: 150 }}
            placeholder="选择职位级别"
            value={filters.position}
            onChange={(value) => setFilters({ ...filters, position: value })}
            allowClear
          >
            <Option value="all">全部职位</Option>
            <Option value="初级">初级</Option>
            <Option value="中级">中级</Option>
            <Option value="高级">高级</Option>
            <Option value="专家">专家</Option>
            <Option value="管理">管理</Option>
          </Select>

          <Select
            style={{ width: 150 }}
            placeholder="选择学历"
            value={filters.education}
            onChange={(value) => setFilters({ ...filters, education: value })}
            allowClear
          >
            <Option value="all">全部学历</Option>
            <Option value="博士">博士</Option>
            <Option value="硕士">硕士</Option>
            <Option value="本科">本科</Option>
            <Option value="大专">大专</Option>
          </Select>

          <Select
            style={{ width: 150 }}
            placeholder="工作年限"
            value={filters.workYears}
            onChange={(value) => setFilters({ ...filters, workYears: value })}
            allowClear
          >
            <Option value="all">全部年限</Option>
            <Option value="0-1">1年以下</Option>
            <Option value="1-3">1-3年</Option>
            <Option value="3-5">3-5年</Option>
            <Option value="5-10">5-10年</Option>
            <Option value="10+">10年以上</Option>
          </Select>

          <RangePicker
            placeholder={['入职开始日期', '入职结束日期']}
            value={filters.dateRange}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
          />

          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置筛选
          </Button>
        </Space>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="员工总数"
              value={stats.totalCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, color: '#52c41a' }}>
              <ArrowUpOutlined /> 12% 较上月
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月入职"
              value={stats.newHires}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, color: '#52c41a' }}>
              <ArrowUpOutlined /> 5人 较上月
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月离职"
              value={stats.resignations}
              prefix={<UserDeleteOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div style={{ marginTop: 8, color: '#ff4d4f' }}>
              <ArrowDownOutlined /> 3人 较上月
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均工龄"
              value={stats.avgTenure}
              suffix="年"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, color: '#999' }}>
              → 持平
            </div>
          </Card>
        </Col>
      </Row>

      {/* 空数据提示 */}
      {stats.totalCount === 0 && (
        <Card style={{ marginBottom: 24 }}>
          <Empty
            image={<InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
              <div>
                <p style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
                  未找到符合条件的数据
                </p>
                <p style={{ fontSize: 14, color: '#999' }}>
                  请尝试调整筛选条件或重置筛选
                </p>
              </div>
            }
          >
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleReset}>
              重置筛选条件
            </Button>
          </Empty>
        </Card>
      )}

      {/* 图表区域 - 有数据时显示 */}
      {stats.totalCount > 0 && (
        <>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="地域分布">
                {stats.deptDistribution?.length > 0 ? (
                  <ReactECharts option={deptChartOption} style={{ height: 300 }} />
                ) : (
                  <Empty description="暂无地域分布数据" style={{ padding: '60px 0' }} />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="学历分布">
                {stats.educationDistribution?.length > 0 ? (
                  <ReactECharts option={eduChartOption} style={{ height: 300 }} />
                ) : (
                  <Empty description="暂无学历分布数据" style={{ padding: '60px 0' }} />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card title="职位分布">
                {stats.positionDistribution?.length > 0 ? (
                  <ReactECharts option={positionChartOption} style={{ height: 300 }} />
                ) : (
                  <Empty description="暂无职位分布数据" style={{ padding: '60px 0' }} />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="工作年限分布">
                {stats.yearsDistribution?.length > 0 ? (
                  <ReactECharts option={yearsChartOption} style={{ height: 300 }} />
                ) : (
                  <Empty description="暂无工作年限分布数据" style={{ padding: '60px 0' }} />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  )
}

export default Dashboard
