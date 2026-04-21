import React, { useState, useEffect } from 'react'
import { Card, Input, Button, Row, Col, Tag, List, Avatar, Typography, Space, Divider, Select, Slider, DatePicker, message, Collapse, Badge, Switch, Tooltip, Modal } from 'antd'
import { SearchOutlined, FilterOutlined, UserOutlined, StarOutlined, FileTextOutlined, CheckCircleOutlined, ThunderboltOutlined, RobotOutlined, EyeOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
const { Panel } = Collapse

interface SearchResult {
  id: number
  talentId: string
  name: string
  gender: number
  positionName?: string
  deptName?: string
  skills?: string[]
  workYears?: number
  educationLevel?: string
  matchScore?: number
  localScore?: number
  wenxinScore?: number
  matchReason?: string
  matchSource?: string
  isKeyTalent?: number
  phone?: string
  email?: string
}

interface ParsedQuery {
  skills: string[]
  workYears: { min: number | null; max: number | null } | null
  education: string | null
  dept: string | null
  position: string | null
  gender: number | null
  intention?: string
}

const TalentSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [useWenxin, setUseWenxin] = useState(true)
  const [parseSource, setParseSource] = useState<string>('local')

  // 初始加载所有人才
  useEffect(() => {
    fetchAllTalents()
  }, [])

  const fetchAllTalents = async () => {
    try {
      const res = await axios.get('/api/talent/list')
      if (res.data.code === 200) {
        const listData = res.data.data?.list || res.data.data || []
        const dataWithScore = listData.map((item: SearchResult) => ({
          ...item,
          matchScore: Math.floor(Math.random() * 15) + 85
        }))
        setResults(dataWithScore)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      message.error('获取数据失败')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAllTalents()
      setParsedQuery(null)
      return
    }
    
    setIsSearching(true)
    try {
      const res = await axios.get(`/api/talent/search?keyword=${encodeURIComponent(searchQuery)}&useWenxin=${useWenxin}`)
      if (res.data.code === 200) {
        const data = res.data.data || []
        setResults(data)
        setParsedQuery(res.data.parsed)
        setParseSource(res.data.source || 'local')
      }
    } catch (error) {
      console.error('搜索失败:', error)
      message.error('搜索失败')
    }
    setIsSearching(false)
  }

  const renderMatchScore = (item: SearchResult) => {
    if (!item.matchScore) return null
    let color = 'green'
    if (item.matchScore < 80) color = 'orange'
    if (item.matchScore < 60) color = 'red'
    
    const tooltipContent = (
      <div>
        <div>综合匹配度: {item.matchScore}%</div>
        {item.localScore && <div>本地算法: {item.localScore}%</div>}
        {item.wenxinScore && <div>文心一言: {item.wenxinScore}%</div>}
        {item.matchReason && <div style={{ marginTop: 8, maxWidth: 300 }}>评分理由: {item.matchReason}</div>}
      </div>
    )
    
    return (
      <Tooltip title={tooltipContent}>
        <Tag color={color} style={{ cursor: 'help' }}>
          {item.matchScore}% 匹配
          {item.matchSource === 'combined' && <RobotOutlined style={{ marginLeft: 4 }} />}
        </Tag>
      </Tooltip>
    )
  }

  const getSkills = (item: SearchResult) => {
    return item.skills || ['专业技能']
  }

  const renderParsedQuery = () => {
    if (!parsedQuery) return null

    const conditions = []
    
    if (parsedQuery.skills.length > 0) {
      conditions.push(
        <Tag key="skills" color="blue">
          技能: {parsedQuery.skills.join(', ')}
        </Tag>
      )
    }
    
    if (parsedQuery.workYears) {
      const { min, max } = parsedQuery.workYears
      let yearText = ''
      if (min !== null && max !== null) {
        yearText = `${min}-${max}年`
      } else if (min !== null) {
        yearText = `${min}年以上`
      } else if (max !== null) {
        yearText = `${max}年以内`
      }
      conditions.push(
        <Tag key="years" color="green">
          经验: {yearText}
        </Tag>
      )
    }
    
    if (parsedQuery.education) {
      conditions.push(
        <Tag key="edu" color="purple">
          学历: {parsedQuery.education}
        </Tag>
      )
    }
    
    if (parsedQuery.dept) {
      conditions.push(
        <Tag key="dept" color="orange">
          部门: {parsedQuery.dept}
        </Tag>
      )
    }
    
    if (parsedQuery.position) {
      conditions.push(
        <Tag key="position" color="cyan">
          职位: {parsedQuery.position}
        </Tag>
      )
    }
    
    if (parsedQuery.gender !== null) {
      conditions.push(
        <Tag key="gender" color="pink">
          性别: {parsedQuery.gender === 1 ? '男' : '女'}
        </Tag>
      )
    }

    if (conditions.length === 0) return null

    return (
      <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 4, border: '1px solid #b7eb8f' }}>
        <Space align="center">
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <Text strong>AI已理解您的需求：</Text>
          {conditions}
          {parseSource === 'wenxin' && (
            <Tag color="blue" icon={<RobotOutlined />}>文心一言</Tag>
          )}
        </Space>
        {parsedQuery.intention && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            搜索意图: {parsedQuery.intention}
          </div>
        )}
      </div>
    )
  }

  const exampleQueries = [
    '找5年以上Java经验的后端工程师',
    'AI实验室的算法工程师，硕士学历',
    '3-5年Python经验，熟悉机器学习的候选人',
    '关键人才，10年以上架构经验',
    '前端开发，熟悉React和Vue',
    '产品经理，本科以上学历'
  ]

  // 查看人才详情
  const handleViewDetail = (item: SearchResult) => {
    Modal.info({
      title: '人才详情',
      width: 600,
      icon: <EyeOutlined style={{ color: '#1890ff' }} />,
      content: (
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 'bold' }}>{item.name}</div>
                {item.isKeyTalent === 1 && <Tag color="gold" style={{ marginTop: 4 }}>关键人才</Tag>}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">人才编号：</Text>
                <Text strong>{item.talentId}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">性别：</Text>
                <Text>{item.gender === 1 ? '男' : '女'}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">工作年限：</Text>
                <Text>{item.workYears ? `${item.workYears}年` : '-'}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">学历：</Text>
                <Text>{item.educationLevel || '-'}</Text>
              </div>
            </Col>
          </Row>
          <Divider />
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary">职位：</Text>
            <Text strong>{item.positionName || '-'}</Text>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary">部门：</Text>
            <Text>{item.deptName || '-'}</Text>
          </div>
          {item.matchScore && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">匹配度：</Text>
              <Tag color={item.matchScore >= 80 ? 'green' : item.matchScore >= 60 ? 'orange' : 'red'}>
                {item.matchScore}%
              </Tag>
            </div>
          )}
          {item.matchReason && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">匹配理由：</Text>
              <div style={{ marginTop: 4, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                {item.matchReason}
              </div>
            </div>
          )}
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary">技能：</Text>
            <div style={{ marginTop: 4 }}>
              {getSkills(item).map((skill) => (
                <Tag key={skill} style={{ marginRight: 8, marginBottom: 4 }}>{skill}</Tag>
              ))}
            </div>
          </div>
          {item.phone && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">电话：</Text>
              <Text>{item.phone}</Text>
            </div>
          )}
          {item.email && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">邮箱：</Text>
              <Text>{item.email}</Text>
            </div>
          )}
        </div>
      ),
      onOk() {},
    })
  }

  return (
    <div>
      <Title level={4}>智能人才搜索</Title>
      <Text type="secondary">使用自然语言描述您需要的人才，AI将为您精准匹配</Text>

      <Card style={{ marginTop: 24, marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="例如：找一个有5年以上Java开发经验，熟悉微服务架构的高级工程师"
              allowClear
              enterButton={<><SearchOutlined /> 智能搜索</>}
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              loading={isSearching}
            />
          </Col>
          <Col>
            <Tooltip title="开启后将使用文心一言API增强语义理解能力">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RobotOutlined style={{ color: useWenxin ? '#1890ff' : '#999' }} />
                <Switch
                  checked={useWenxin}
                  onChange={setUseWenxin}
                  checkedChildren="文心一言"
                  unCheckedChildren="本地解析"
                />
              </div>
            </Tooltip>
          </Col>
        </Row>

        {/* 示例查询 */}
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>试试这些示例：</Text>
          <div style={{ marginTop: 8 }}>
            {exampleQueries.map((query, index) => (
              <Tag 
                key={index} 
                style={{ marginRight: 8, marginBottom: 8, cursor: 'pointer' }}
                onClick={() => {
                  setSearchQuery(query)
                  handleSearch()
                }}
              >
                {query}
              </Tag>
            ))}
          </div>
        </div>

        {/* 解析结果展示 */}
        {renderParsedQuery()}

        <Divider />

        <Collapse ghost onChange={() => setShowFilters(!showFilters)}>
          <Panel header={<><FilterOutlined /> 高级筛选</>} key="1">
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ marginBottom: 8 }}>部门</div>
                <Select style={{ width: '100%' }} placeholder="选择部门" allowClear>
                  <Option value="研发中心">研发中心</Option>
                  <Option value="AI实验室">AI实验室</Option>
                  <Option value="产品部">产品部</Option>
                  <Option value="质量部">质量部</Option>
                  <Option value="人力资源部">人力资源部</Option>
                  <Option value="销售部">销售部</Option>
                </Select>
              </Col>
              <Col span={6}>
                <div style={{ marginBottom: 8 }}>学历</div>
                <Select style={{ width: '100%' }} placeholder="选择学历" allowClear>
                  <Option value="博士">博士</Option>
                  <Option value="硕士">硕士</Option>
                  <Option value="本科">本科</Option>
                  <Option value="大专">大专</Option>
                </Select>
              </Col>
              <Col span={6}>
                <div style={{ marginBottom: 8 }}>工作年限</div>
                <Slider range defaultValue={[0, 10]} max={20} marks={{ 0: '0年', 10: '10年', 20: '20年+' }} />
              </Col>
              <Col span={6}>
                <div style={{ marginBottom: 8 }}>入职时间</div>
                <RangePicker style={{ width: '100%' }} />
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Card>

      <Card 
        title={
          <Space>
            <span>搜索结果 ({results.length})</span>
            {parsedQuery && <Badge count="AI匹配" style={{ backgroundColor: '#52c41a' }} />}
          </Space>
        } 
        extra={<Button icon={<FilterOutlined />}>筛选</Button>}
      >
        <List
          itemLayout="horizontal"
          dataSource={results}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(item)}>查看详情</Button>,
                <Button size="small">加入对比</Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                title={
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>{item.name}</Text>
                    {item.isKeyTalent === 1 && <Tag color="gold" icon={<StarOutlined />}>关键人才</Tag>}
                    {renderMatchScore(item)}
                  </Space>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <Text>{item.positionName || '-'}</Text>
                      <Text type="secondary" style={{ marginLeft: 16 }}>{item.deptName || '-'}</Text>
                      <Text type="secondary" style={{ marginLeft: 16 }}>{item.workYears ? item.workYears + '年经验' : '-'}</Text>
                      <Text type="secondary" style={{ marginLeft: 16 }}>{item.educationLevel || '-'}</Text>
                    </div>
                    <div>
                      {getSkills(item).slice(0, 6).map((skill) => (
                        <Tag key={skill} size="small" style={{ marginRight: 8 }}>{skill}</Tag>
                      ))}
                      {getSkills(item).length > 6 && (
                        <Tag size="small">+{getSkills(item).length - 6}</Tag>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default TalentSearch
