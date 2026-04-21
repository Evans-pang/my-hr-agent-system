import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Avatar, Tag, Progress, Table, Statistic, Button, Select, Typography, Space, Divider, message, Modal, Timeline, Input, Form, DatePicker, InputNumber, Tabs, List, Empty, Descriptions, Badge, Radio } from 'antd'
import { UserOutlined, StarOutlined, TrophyOutlined, RiseOutlined, TeamOutlined, BookOutlined, ClockCircleOutlined, CheckCircleOutlined, EyeOutlined, SearchOutlined, FileTextOutlined, EditOutlined, PlusOutlined, DeleteOutlined, RadarChartOutlined, BarChartOutlined, HeartOutlined, HeartFilled, FlagOutlined, FlagFilled } from '@ant-design/icons'
import axios from 'axios'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TabPane } = Tabs
const { TextArea } = Input

interface Talent {
  talentId: string
  name: string
  gender: string
  age: number
  educationLevel: string
  schoolName: string
  major: string
  workYears: number
  positionName: string
  basePosition: string
  skillName: string
  mainSkill: string
  isKeyTalent: number
  status: string
  legalEntity: string
  organizationLocation: string
  performance2023: string
  performance2024: string
  entryDate: string
}

interface TrainingRecord {
  id: number
  talentId: string
  trainingName: string
  trainingType: string
  startDate: string
  endDate: string
  score: number
  status: string
  trainer: string
  description: string
}

interface AssessmentRecord {
  id: number
  talentId: string
  assessmentName: string
  assessmentType: string
  assessmentDate: string
  score: number
  totalScore: number
  ranking: string
  evaluator: string
  comments: string
}

interface StandardProfile {
  id: number
  positionName: string
  positionLevel: string
  coreAbilities: string[]
  requiredSkills: string[]
  knowledgeRequirements: string[]
  projectExperience: string
  educationRequirement: string
  workYearsRequirement: number
  abilityStandards: any
}

const TalentProfile: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([])
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([])
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null)
  const [loading, setLoading] = useState(false)
  const [performanceModalVisible, setPerformanceModalVisible] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState('all')

  // 简历预览弹窗状态
  const [resumeModalVisible, setResumeModalVisible] = useState(false)
  const [isResumeMarked, setIsResumeMarked] = useState(false)
  const [isResumeFavorited, setIsResumeFavorited] = useState(false)

  // 培训考核录入状态
  const [trainingModalVisible, setTrainingModalVisible] = useState(false)
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false)
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([])
  const [assessmentRecords, setAssessmentRecords] = useState<AssessmentRecord[]>([])
  const [trainingForm] = Form.useForm()
  const [assessmentForm] = Form.useForm()

  // 标准画像管理状态
  const [profileModalVisible, setProfileModalVisible] = useState(false)
  const [standardProfiles, setStandardProfiles] = useState<StandardProfile[]>([])
  const [profileForm] = Form.useForm()
  const [editingProfile, setEditingProfile] = useState<StandardProfile | null>(null)
  const [profileActiveTab, setProfileActiveTab] = useState('list')

  // 雷达图对比状态
  const [compareModalVisible, setCompareModalVisible] = useState(false)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [selectedPosition, setSelectedPosition] = useState('')

  useEffect(() => {
    fetchTalents()
    fetchStandardProfiles()
  }, [])

  useEffect(() => {
    filterTalents()
  }, [searchKeyword, filterType, talents])

  useEffect(() => {
    if (selectedTalent) {
      fetchTrainingRecords(selectedTalent.talentId)
      fetchAssessmentRecords(selectedTalent.talentId)
      checkResumeStatus(selectedTalent.talentId)
    }
  }, [selectedTalent])

  const fetchTalents = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/talent/list?page=1&pageSize=100')
      if (res.data.code === 200) {
        const list = res.data.data?.list || res.data.data || []
        const sortedList = list.sort((a: Talent, b: Talent) => {
          if (a.isKeyTalent === 1 && b.isKeyTalent !== 1) return -1
          if (a.isKeyTalent !== 1 && b.isKeyTalent === 1) return 1
          return a.talentId.localeCompare(b.talentId)
        })
        setTalents(sortedList)
        setFilteredTalents(sortedList)
        if (sortedList.length > 0 && !selectedTalent) {
          setSelectedTalent(sortedList[0])
        }
      }
    } catch (error) {
      message.error('获取人才列表失败')
    }
    setLoading(false)
  }

  const filterTalents = () => {
    let result = [...talents]
    if (filterType === 'key') {
      result = result.filter(t => t.isKeyTalent === 1)
    }
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(t =>
        t.name?.toLowerCase().includes(keyword) ||
        t.positionName?.toLowerCase().includes(keyword) ||
        t.basePosition?.toLowerCase().includes(keyword) ||
        t.skillName?.toLowerCase().includes(keyword) ||
        t.mainSkill?.toLowerCase().includes(keyword) ||
        t.organizationLocation?.toLowerCase().includes(keyword) ||
        t.legalEntity?.toLowerCase().includes(keyword) ||
        t.talentId?.toLowerCase().includes(keyword)
      )
    }
    setFilteredTalents(result)
    if (result.length > 0 && (!selectedTalent || !result.find(t => t.talentId === selectedTalent.talentId))) {
      setSelectedTalent(result[0])
    }
  }

  const fetchTrainingRecords = async (talentId: string) => {
    try {
      const res = await axios.get(`/api/profile/training/${talentId}`)
      if (res.data.code === 200) {
        setTrainingRecords(res.data.data || [])
      }
    } catch (error) {
      console.error('获取培训记录失败:', error)
    }
  }

  const fetchAssessmentRecords = async (talentId: string) => {
    try {
      const res = await axios.get(`/api/profile/assessment/${talentId}`)
      if (res.data.code === 200) {
        setAssessmentRecords(res.data.data || [])
      }
    } catch (error) {
      console.error('获取考核记录失败:', error)
    }
  }

  const fetchStandardProfiles = async () => {
    try {
      const res = await axios.get('/api/profile/standard')
      if (res.data.code === 200) {
        setStandardProfiles(res.data.data || [])
      }
    } catch (error) {
      console.error('获取标准画像失败:', error)
    }
  }

  const checkResumeStatus = async (talentId: string) => {
    try {
      const res = await axios.get(`/api/profile/resume/status/${talentId}`)
      if (res.data.code === 200) {
        setIsResumeMarked(res.data.data?.isMarked || false)
        setIsResumeFavorited(res.data.data?.isFavorited || false)
      }
    } catch (error) {
      console.error('获取简历状态失败:', error)
    }
  }

  const calculateAbilityScores = (talent: Talent) => {
    const workYears = talent.workYears || 0
    const isKeyTalent = talent.isKeyTalent === 1
    const baseScore = Math.min(60 + workYears * 2, 90)
    return [
      { name: '专业能力', score: isKeyTalent ? Math.min(baseScore + 10, 95) : baseScore },
      { name: '工作经验', score: Math.min(50 + workYears * 3, 95) },
      { name: '学历水平', score: talent.educationLevel?.includes('本科') ? 80 : talent.educationLevel?.includes('硕士') ? 90 : 70 },
      { name: '绩效表现', score: talent.performance2024 === 'A' ? 95 : talent.performance2024 === 'B+' ? 85 : talent.performance2024 === 'B' ? 75 : 65 },
    ]
  }

  const parseSkills = (talent: Talent) => {
    const skills: { name: string; level: string; years: number }[] = []
    if (talent.skillName) {
      const skillList = talent.skillName.split(/[,，;；]/).filter(s => s.trim())
      skillList.forEach((skill, index) => {
        skills.push({
          name: skill.trim(),
          level: index < 2 ? '精通' : index < 4 ? '熟练' : '了解',
          years: Math.max(1, (talent.workYears || 0) - index)
        })
      })
    }
    if (skills.length < 3 && talent.mainSkill) {
      skills.push({ name: talent.mainSkill, level: '精通', years: talent.workYears || 1 })
    }
    return skills.slice(0, 6)
  }

  // 简历标记功能
  const handleMarkResume = async () => {
    if (!selectedTalent) return
    try {
      const res = await axios.post('/api/profile/resume/mark', {
        talentId: selectedTalent.talentId,
        isMarked: !isResumeMarked
      })
      if (res.data.code === 200) {
        setIsResumeMarked(!isResumeMarked)
        message.success(isResumeMarked ? '取消标记成功' : '标记简历成功')
      } else {
        message.error(res.data.message || '操作失败')
      }
    } catch (error: any) {
      console.error('标记简历失败:', error)
      message.error(error.response?.data?.message || '操作失败，请检查网络连接')
    }
  }

  // 简历收藏功能
  const handleFavoriteResume = async () => {
    if (!selectedTalent) return
    try {
      const res = await axios.post('/api/profile/resume/favorite', {
        talentId: selectedTalent.talentId,
        isFavorited: !isResumeFavorited
      })
      if (res.data.code === 200) {
        setIsResumeFavorited(!isResumeFavorited)
        message.success(isResumeFavorited ? '取消收藏成功' : '收藏简历成功')
      } else {
        message.error(res.data.message || '操作失败')
      }
    } catch (error: any) {
      console.error('收藏简历失败:', error)
      message.error(error.response?.data?.message || '操作失败，请检查网络连接')
    }
  }

  // 添加培训记录
  const handleAddTraining = async (values: any) => {
    if (!selectedTalent) return
    console.log('培训表单提交数据:', values)
    try {
      // 处理日期格式
      const startDate = values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : null
      const endDate = values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null

      const res = await axios.post('/api/profile/training', {
        talentId: selectedTalent.talentId,
        trainingName: values.trainingName,
        trainingType: values.trainingType,
        startDate: startDate,
        endDate: endDate,
        score: values.score,
        status: values.status,
        trainer: values.trainer || '',
        description: values.description || ''
      })
      if (res.data.code === 200) {
        message.success('添加培训记录成功')
        setTrainingModalVisible(false)
        trainingForm.resetFields()
        fetchTrainingRecords(selectedTalent.talentId)
      } else {
        message.error(res.data.message || '添加失败')
      }
    } catch (error: any) {
      console.error('添加培训记录失败:', error)
      message.error(error.response?.data?.message || '添加失败，请检查网络连接')
    }
  }

  // 添加考核记录
  const handleAddAssessment = async (values: any) => {
    if (!selectedTalent) return
    console.log('考核表单提交数据:', values)
    try {
      // 处理日期格式
      const assessmentDate = values.assessmentDate ? dayjs(values.assessmentDate).format('YYYY-MM-DD') : null

      const res = await axios.post('/api/profile/assessment', {
        talentId: selectedTalent.talentId,
        assessmentName: values.assessmentName,
        assessmentType: values.assessmentType,
        assessmentDate: assessmentDate,
        score: values.score,
        totalScore: values.totalScore,
        ranking: values.ranking,
        evaluator: values.evaluator || '',
        comments: values.comments || ''
      })
      if (res.data.code === 200) {
        message.success('添加考核记录成功')
        setAssessmentModalVisible(false)
        assessmentForm.resetFields()
        fetchAssessmentRecords(selectedTalent.talentId)
      } else {
        message.error(res.data.message || '添加失败')
      }
    } catch (error: any) {
      console.error('添加考核记录失败:', error)
      message.error(error.response?.data?.message || '添加失败，请检查网络连接')
    }
  }

  // 创建/更新标准画像
  const handleSaveProfile = async (values: any) => {
    console.log('表单提交数据:', values)
    try {
      // 构建动态能力标准
      const abilityStandards: Record<string, number> = {}
      if (values.abilityDimensions && values.abilityDimensions.length > 0) {
        values.abilityDimensions.forEach((dim: { name: string; score: number }) => {
          if (dim.name && dim.score !== undefined) {
            abilityStandards[dim.name] = dim.score
          }
        })
      }
      
      const data = {
        positionName: values.positionName,
        positionLevel: values.positionLevel || '',
        coreAbilities: values.coreAbilities?.split(',').map((s: string) => s.trim()) || [],
        requiredSkills: values.requiredSkills?.split(',').map((s: string) => s.trim()) || [],
        knowledgeRequirements: values.knowledgeRequirements?.split(',').map((s: string) => s.trim()) || [],
        projectExperience: values.projectExperience || '',
        educationRequirement: values.educationRequirement || '',
        workYearsRequirement: values.workYearsRequirement || 0,
        abilityStandards: abilityStandards
      }
      console.log('提交到API的数据:', data)

      if (editingProfile) {
        const res = await axios.put(`/api/profile/standard/${editingProfile.id}`, data)
        if (res.data.code === 200) {
          message.success('更新标准画像成功')
        } else {
          message.error(res.data.message || '更新失败')
          return
        }
      } else {
        const res = await axios.post('/api/profile/standard', data)
        if (res.data.code === 200) {
          message.success('创建标准画像成功')
        } else {
          message.error(res.data.message || '创建失败')
          return
        }
      }
      setProfileModalVisible(false)
      profileForm.resetFields()
      setEditingProfile(null)
      setProfileActiveTab('list')
      fetchStandardProfiles()
    } catch (error: any) {
      console.error('保存标准画像失败:', error)
      message.error(error.response?.data?.message || '保存失败')
    }
  }

  // 删除标准画像
  const handleDeleteProfile = async (id: number) => {
    try {
      const res = await axios.delete(`/api/profile/standard/${id}`)
      if (res.data.code === 200) {
        message.success('删除成功')
        fetchStandardProfiles()
      } else {
        message.error(res.data.message || '删除失败')
      }
    } catch (error: any) {
      console.error('删除标准画像失败:', error)
      message.error(error.response?.data?.message || '删除失败')
    }
  }

  // 打开能力对比弹窗
  const openCompareModal = () => {
    setSelectedPosition('')
    setComparisonData(null)
    setCompareModalVisible(true)
  }

  // 获取对比数据
  const handleCompare = async () => {
    if (!selectedTalent || !selectedPosition) {
      message.warning('请选择对比岗位')
      return
    }
    try {
      const res = await axios.get(`/api/profile/compare/${selectedTalent.talentId}?positionName=${selectedPosition}`)
      if (res.data.code === 200) {
        setComparisonData(res.data.data)
      } else {
        message.error(res.data.message || '获取对比数据失败')
      }
    } catch (error) {
      message.error('获取对比数据失败')
    }
  }

  // 雷达图配置
  const getRadarOption = () => {
    if (!comparisonData) return {}
    const { comparison } = comparisonData
    
    // 动态构建雷达图指标
    const indicators = Object.entries(comparison).map(([key, value]: [string, any]) => ({
      name: value.name || key,
      max: 100
    }))
    
    // 动态构建数据值
    const actualValues = Object.entries(comparison).map(([key, value]: [string, any]) => value.actual || 0)
    const standardValues = Object.entries(comparison).map(([key, value]: [string, any]) => value.standard || 0)
    
    return {
      radar: {
        indicator: indicators
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: actualValues,
            name: '实际能力',
            areaStyle: { opacity: 0.3 }
          },
          {
            value: standardValues,
            name: '标准要求',
            areaStyle: { opacity: 0.3 }
          }
        ]
      }],
      legend: {
        data: ['实际能力', '标准要求']
      }
    }
  }

  const talentColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Talent) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{text}</Text>
          {record.isKeyTalent === 1 && <Tag color="gold" icon={<StarOutlined />}>关键</Tag>}
        </Space>
      )
    },
    {
      title: '职位',
      dataIndex: 'positionName',
      key: 'positionName',
    },
    {
      title: '工作年限',
      dataIndex: 'workYears',
      key: 'workYears',
      render: (years: number) => `${years}年`
    },
    {
      title: '学历',
      dataIndex: 'educationLevel',
      key: 'educationLevel',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Talent) => (
        <Button
          type="link"
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedTalent(record)
          }}
        >
          查看画像
        </Button>
      )
    }
  ]

  const currentTalent = selectedTalent || talents[0]
  const abilityScores = currentTalent ? calculateAbilityScores(currentTalent) : []
  const skills = currentTalent ? parseSkills(currentTalent) : []

  return (
    <div>
      <Title level={4}>人才画像</Title>
      <Text type="secondary">基于真实数据展示人才能力、经历与潜力</Text>

      <Row gutter={24} style={{ marginTop: 24 }}>
        {/* 左侧人才列表 */}
        <Col span={8}>
          <Card
            title={
              <div>
                <div style={{ marginBottom: 12 }}>人才列表</div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="搜索姓名、职位、技能..."
                    prefix={<SearchOutlined />}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    allowClear
                  />
                  <Select
                    value={filterType}
                    onChange={setFilterType}
                    style={{ width: '100%' }}
                    placeholder="筛选类型"
                  >
                    <Option value="all">全部人才</Option>
                    <Option value="key">关键人才</Option>
                  </Select>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    共 {filteredTalents.length} 人
                    {searchKeyword && ` (搜索: "${searchKeyword}")`}
                  </Text>
                </Space>
              </div>
            }
            loading={loading}
            bodyStyle={{ padding: '12px' }}
          >
            <Table
              columns={talentColumns}
              dataSource={filteredTalents.slice(0, 10)}
              rowKey="talentId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 右侧人才画像详情 */}
        <Col span={16}>
          {currentTalent && (
            <>
              {/* 操作按钮 */}
              <Card style={{ marginBottom: 16 }}>
                <Space wrap>
                  <Button
                    icon={<FileTextOutlined />}
                    onClick={() => setResumeModalVisible(true)}
                  >
                    简历预览
                  </Button>
                  <Button
                    icon={isResumeMarked ? <FlagFilled /> : <FlagOutlined />}
                    onClick={handleMarkResume}
                    type={isResumeMarked ? 'primary' : 'default'}
                  >
                    {isResumeMarked ? '取消标记' : '标记简历'}
                  </Button>
                  <Button
                    icon={isResumeFavorited ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleFavoriteResume}
                    type={isResumeFavorited ? 'primary' : 'default'}
                  >
                    {isResumeFavorited ? '取消收藏' : '收藏简历'}
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => setTrainingModalVisible(true)}
                  >
                    录入培训
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => setAssessmentModalVisible(true)}
                  >
                    录入考核
                  </Button>
                  <Button
                    icon={<BarChartOutlined />}
                    onClick={() => setProfileModalVisible(true)}
                  >
                    标准画像
                  </Button>
                  <Button
                    icon={<RadarChartOutlined />}
                    onClick={openCompareModal}
                  >
                    能力对比
                  </Button>
                </Space>
              </Card>

              {/* 基本信息 */}
              <Card style={{ marginBottom: 24 }}>
                <Row gutter={24}>
                  <Col span={6} style={{ textAlign: 'center' }}>
                    <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
                    <Title level={5} style={{ marginBottom: 8 }}>{currentTalent.name}</Title>
                    <Space>
                      {currentTalent.isKeyTalent === 1 && <Tag color="gold" icon={<StarOutlined />}>关键人才</Tag>}
                      <Tag color="blue">{currentTalent.status}</Tag>
                    </Space>
                  </Col>
                  <Col span={18}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic title="工作年限" value={`${currentTalent.workYears}年`} prefix={<ClockCircleOutlined />} />
                      </Col>
                      <Col span={8}>
                        <Statistic title="学历" value={currentTalent.educationLevel} prefix={<BookOutlined />} />
                      </Col>
                      <Col span={8}>
                        <div style={{ cursor: 'pointer' }} onClick={() => setPerformanceModalVisible(true)}>
                          <Statistic
                            title="最近1年绩效"
                            value={currentTalent.performance2024 || 'B'}
                            prefix={<TrophyOutlined />}
                            suffix={<EyeOutlined style={{ fontSize: 12, marginLeft: 4 }} />}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Divider />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text type="secondary">职位：</Text>
                        <Text strong>{currentTalent.positionName || currentTalent.basePosition}</Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">部门：</Text>
                        <Text strong>{currentTalent.legalEntity || currentTalent.organizationLocation}</Text>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 8 }}>
                      <Col span={12}>
                        <Text type="secondary">毕业院校：</Text>
                        <Text>{currentTalent.schoolName || '未填写'}</Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">专业：</Text>
                        <Text>{currentTalent.major || '未填写'}</Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>

              {/* 能力评估和技能掌握 */}
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="能力评估" style={{ marginBottom: 24 }}>
                    {abilityScores.map((item, index) => (
                      <div key={index} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text>{item.name}</Text>
                          <Text strong>{item.score}分</Text>
                        </div>
                        <Progress percent={item.score} strokeColor={item.score >= 80 ? '#52c41a' : item.score >= 60 ? '#faad14' : '#ff4d4f'} />
                      </div>
                    ))}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="技能掌握" style={{ marginBottom: 24 }}>
                    {skills.length > 0 ? (
                      skills.map((skill, index) => (
                        <div key={index} style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <Tag color="blue">{skill.name}</Tag>
                            <Tag color={skill.level === '精通' ? 'gold' : skill.level === '熟练' ? 'green' : 'default'}>{skill.level}</Tag>
                          </Space>
                          <Text type="secondary">{skill.years}年经验</Text>
                        </div>
                      ))
                    ) : (
                      <Text type="secondary">暂无技能信息</Text>
                    )}
                  </Card>
                </Col>
              </Row>

              {/* 培训记录和考核记录 */}
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="培训记录" style={{ marginBottom: 24 }}>
                    {trainingRecords.length > 0 ? (
                      <List
                        size="small"
                        dataSource={trainingRecords.slice(0, 5)}
                        renderItem={(item) => (
                          <List.Item>
                            <div style={{ width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text strong>{item.trainingName}</Text>
                                <Tag color={item.status === '已完成' ? 'green' : 'blue'}>{item.status}</Tag>
                              </div>
                              <div style={{ fontSize: 12, color: '#999' }}>
                                {item.startDate} 至 {item.endDate} | 成绩: {item.score}分
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="暂无培训记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="考核记录" style={{ marginBottom: 24 }}>
                    {assessmentRecords.length > 0 ? (
                      <List
                        size="small"
                        dataSource={assessmentRecords.slice(0, 5)}
                        renderItem={(item) => (
                          <List.Item>
                            <div style={{ width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text strong>{item.assessmentName}</Text>
                                <Tag color={item.ranking === '优秀' ? 'gold' : item.ranking === '良好' ? 'green' : 'default'}>{item.ranking}</Tag>
                              </div>
                              <div style={{ fontSize: 12, color: '#999' }}>
                                {item.assessmentDate} | 分数: {item.score}/{item.totalScore}
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="暂无考核记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>

      {/* 简历预览弹窗 */}
      <Modal
        title="简历预览"
        open={resumeModalVisible}
        onCancel={() => setResumeModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setResumeModalVisible(false)}>关闭</Button>
        ]}
      >
        {currentTalent && (
          <div style={{ padding: 24, background: '#fafafa' }}>
            <div style={{ background: '#fff', padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ textAlign: 'center', marginBottom: 32, borderBottom: '2px solid #1890ff', paddingBottom: 16 }}>
                <Title level={3} style={{ marginBottom: 8 }}>{currentTalent.name}</Title>
                <Text type="secondary">{currentTalent.positionName} | {currentTalent.workYears}年工作经验</Text>
              </div>

              <Descriptions title="基本信息" bordered column={2} style={{ marginBottom: 24 }}>
                <Descriptions.Item label="姓名">{currentTalent.name}</Descriptions.Item>
                <Descriptions.Item label="性别">{currentTalent.gender}</Descriptions.Item>
                <Descriptions.Item label="年龄">{currentTalent.age}岁</Descriptions.Item>
                <Descriptions.Item label="学历">{currentTalent.educationLevel}</Descriptions.Item>
                <Descriptions.Item label="毕业院校">{currentTalent.schoolName}</Descriptions.Item>
                <Descriptions.Item label="专业">{currentTalent.major}</Descriptions.Item>
              </Descriptions>

              <Descriptions title="工作信息" bordered column={2} style={{ marginBottom: 24 }}>
                <Descriptions.Item label="当前职位">{currentTalent.positionName}</Descriptions.Item>
                <Descriptions.Item label="基础岗位">{currentTalent.basePosition}</Descriptions.Item>
                <Descriptions.Item label="工作年限">{currentTalent.workYears}年</Descriptions.Item>
                <Descriptions.Item label="入职日期">{currentTalent.entryDate}</Descriptions.Item>
                <Descriptions.Item label="所属部门">{currentTalent.legalEntity}</Descriptions.Item>
                <Descriptions.Item label="组织所在地">{currentTalent.organizationLocation}</Descriptions.Item>
              </Descriptions>

              <Descriptions title="技能特长" bordered column={1} style={{ marginBottom: 24 }}>
                <Descriptions.Item label="主技能">{currentTalent.mainSkill || '未填写'}</Descriptions.Item>
                <Descriptions.Item label="技能列表">{currentTalent.skillName || '未填写'}</Descriptions.Item>
              </Descriptions>

              <Descriptions title="绩效记录" bordered column={2}>
                <Descriptions.Item label="2024年绩效">
                  <Badge status={currentTalent.performance2024 === 'A' ? 'success' : 'default'} text={currentTalent.performance2024 || 'B'} />
                </Descriptions.Item>
                <Descriptions.Item label="2023年绩效">
                  <Badge status={currentTalent.performance2023 === 'A' ? 'success' : 'default'} text={currentTalent.performance2023 || 'B'} />
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 32, padding: 16, background: '#f0f0f0', borderRadius: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  简历生成时间: {dayjs().format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 培训录入弹窗 */}
      <Modal
        title="录入培训记录"
        open={trainingModalVisible}
        onCancel={() => { setTrainingModalVisible(false); trainingForm.resetFields() }}
        onOk={() => trainingForm.submit()}
        width={600}
      >
        <Form form={trainingForm} layout="vertical" onFinish={handleAddTraining}>
          <Form.Item name="trainingName" label="培训名称" rules={[{ required: true, message: '请输入培训名称' }]}>
            <Input placeholder="请输入培训名称" />
          </Form.Item>
          <Form.Item name="trainingType" label="培训类型" rules={[{ required: true, message: '请选择培训类型' }]}>
            <Select placeholder="请选择培训类型">
              <Option value="技术培训">技术培训</Option>
              <Option value="管理培训">管理培训</Option>
              <Option value="业务培训">业务培训</Option>
              <Option value="软技能培训">软技能培训</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="开始日期" rules={[{ required: true, message: '请选择开始日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="结束日期" rules={[{ required: true, message: '请选择结束日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="score" label="培训成绩" rules={[{ required: true, message: '请输入成绩' }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                <Select placeholder="请选择状态">
                  <Option value="已完成">已完成</Option>
                  <Option value="进行中">进行中</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="trainer" label="培训师">
            <Input placeholder="请输入培训师姓名" />
          </Form.Item>
          <Form.Item name="description" label="培训描述">
            <TextArea rows={3} placeholder="请输入培训描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 考核录入弹窗 */}
      <Modal
        title="录入考核记录"
        open={assessmentModalVisible}
        onCancel={() => { setAssessmentModalVisible(false); assessmentForm.resetFields() }}
        onOk={() => assessmentForm.submit()}
        width={600}
      >
        <Form form={assessmentForm} layout="vertical" onFinish={handleAddAssessment}>
          <Form.Item name="assessmentName" label="考核名称" rules={[{ required: true, message: '请输入考核名称' }]}>
            <Input placeholder="请输入考核名称" />
          </Form.Item>
          <Form.Item name="assessmentType" label="考核类型" rules={[{ required: true, message: '请选择考核类型' }]}>
            <Select placeholder="请选择考核类型">
              <Option value="年度考核">年度考核</Option>
              <Option value="季度考核">季度考核</Option>
              <Option value="项目考核">项目考核</Option>
              <Option value="技能考核">技能考核</Option>
            </Select>
          </Form.Item>
          <Form.Item name="assessmentDate" label="考核日期" rules={[{ required: true, message: '请选择考核日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="score" label="考核分数" rules={[{ required: true, message: '请输入分数' }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalScore" label="总分" rules={[{ required: true, message: '请输入总分' }]}>
                <InputNumber min={0} max={200} style={{ width: '100%' }} placeholder="默认100" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="ranking" label="排名等级" rules={[{ required: true, message: '请选择排名等级' }]}>
            <Select placeholder="请选择排名等级">
              <Option value="优秀">优秀</Option>
              <Option value="良好">良好</Option>
              <Option value="合格">合格</Option>
              <Option value="待改进">待改进</Option>
            </Select>
          </Form.Item>
          <Form.Item name="evaluator" label="评估人">
            <Input placeholder="请输入评估人姓名" />
          </Form.Item>
          <Form.Item name="comments" label="评语">
            <TextArea rows={3} placeholder="请输入评语" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 标准画像管理弹窗 */}
      <Modal
        title="标准岗位画像管理"
        open={profileModalVisible}
        onCancel={() => { setProfileModalVisible(false); profileForm.resetFields(); setEditingProfile(null); setProfileActiveTab('list') }}
        width={800}
        footer={null}
      >
        <Tabs activeKey={profileActiveTab} onChange={(key) => {
          setProfileActiveTab(key)
          if (key === 'list') {
            setEditingProfile(null)
            profileForm.resetFields()
          }
        }}>
          <TabPane tab="画像列表" key="list">
            <List
              dataSource={standardProfiles}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EditOutlined />} onClick={() => {
                      setEditingProfile(item)
                      // 将abilityStandards转换为abilityDimensions数组
                      const abilityDimensions = item.abilityStandards ? 
                        Object.entries(item.abilityStandards).map(([name, score]) => ({ name, score: score as number })) : 
                        []
                      profileForm.setFieldsValue({
                        positionName: item.positionName,
                        positionLevel: item.positionLevel,
                        coreAbilities: item.coreAbilities?.join(', '),
                        requiredSkills: item.requiredSkills?.join(', '),
                        knowledgeRequirements: item.knowledgeRequirements?.join(', '),
                        projectExperience: item.projectExperience,
                        educationRequirement: item.educationRequirement,
                        workYearsRequirement: item.workYearsRequirement,
                        abilityDimensions: abilityDimensions.length > 0 ? abilityDimensions : [{ name: '', score: 80 }]
                      })
                      setProfileActiveTab('form')
                    }}>编辑</Button>,
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteProfile(item.id)}>删除</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={`${item.positionName} (${item.positionLevel || '未分级'})`}
                    description={
                      <div>
                        <div>核心能力: {item.coreAbilities?.join(', ') || '未设置'}</div>
                        <div>必备技能: {item.requiredSkills?.join(', ') || '未设置'}</div>
                        <div>学历要求: {item.educationRequirement || '未设置'} | 工作年限: {item.workYearsRequirement || '未设置'}年</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => { setEditingProfile(null); profileForm.resetFields(); setProfileActiveTab('form') }} style={{ marginTop: 16 }}>
              添加新画像
            </Button>
          </TabPane>
          <TabPane tab={editingProfile ? '编辑画像' : '添加画像'} key="form">
            <Form form={profileForm} layout="vertical" onFinish={handleSaveProfile}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="positionName" label="岗位名称" rules={[{ required: true }]}>
                    <Input placeholder="如: Java开发工程师" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="positionLevel" label="岗位级别">
                    <Select placeholder="请选择级别">
                      <Option value="初级">初级</Option>
                      <Option value="中级">中级</Option>
                      <Option value="高级">高级</Option>
                      <Option value="资深">资深</Option>
                      <Option value="专家">专家</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="coreAbilities" label="核心能力要求 (用逗号分隔)">
                <Input placeholder="如: 编程能力,系统设计,问题解决" />
              </Form.Item>
              <Form.Item name="requiredSkills" label="必备技能 (用逗号分隔)">
                <Input placeholder="如: Java,Spring Boot,MySQL" />
              </Form.Item>
              <Form.Item name="knowledgeRequirements" label="知识要求 (用逗号分隔)">
                <Input placeholder="如: 数据结构,算法,设计模式" />
              </Form.Item>
              <Form.Item name="projectExperience" label="项目经验要求">
                <TextArea rows={2} placeholder="描述项目经验要求" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="educationRequirement" label="学历要求">
                    <Select placeholder="请选择学历要求">
                      <Option value="大专">大专</Option>
                      <Option value="本科">本科</Option>
                      <Option value="硕士研究生">硕士研究生</Option>
                      <Option value="博士">博士</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="workYearsRequirement" label="工作年限要求">
                    <InputNumber min={0} max={50} style={{ width: '100%' }} placeholder="年" />
                  </Form.Item>
                </Col>
              </Row>
              <Divider>能力标准评分（可自定义能力维度）</Divider>
              <Form.List name="abilityDimensions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <Row gutter={16} key={field.key} style={{ marginBottom: 8 }}>
                        <Col span={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'name']}
                            rules={[{ required: true, message: '请输入能力名称' }]}
                          >
                            <Input placeholder="如: 编码能力、销售技巧、硬件设计" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'score']}
                            rules={[{ required: true, message: '请输入分数' }]}
                          >
                            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Button type="link" danger onClick={() => remove(field.name)}>
                            删除
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add({ name: '', score: 80 })} block icon={<PlusOutlined />}>
                        添加能力维度
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  {editingProfile ? '更新画像' : '创建画像'}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>

      {/* 能力对比弹窗 */}
      <Modal
        title="人才能力对比分析"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setCompareModalVisible(false)}>关闭</Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>选择对比岗位：</Text>
          <Select
            style={{ width: 200, marginLeft: 8 }}
            placeholder="请选择岗位"
            value={selectedPosition}
            onChange={setSelectedPosition}
          >
            {standardProfiles.map(p => (
              <Option key={p.positionName} value={p.positionName}>{p.positionName}</Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleCompare} style={{ marginLeft: 8 }}>开始对比</Button>
        </div>

        {comparisonData ? (
          <div>
            <Row gutter={24}>
              <Col span={12}>
                <ReactECharts option={getRadarOption()} style={{ height: 300 }} />
              </Col>
              <Col span={12}>
                <Card title="对比分析结果" size="small">
                  {comparisonData.comparison && Object.entries(comparisonData.comparison).map(([key, value]: [string, any]) => (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <Text strong>{value.name || key}</Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>实际: {value.actual}分</Text>
                        <Text>标准: {value.standard}分</Text>
                      </div>
                      <Progress 
                        percent={value.actual} 
                        size="small" 
                        strokeColor={value.actual >= value.standard ? '#52c41a' : '#faad14'}
                      />
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>

            {comparisonData.standardProfile && (
              <Card title="岗位要求详情" size="small" style={{ marginTop: 16 }}>
                <Descriptions column={2}>
                  <Descriptions.Item label="岗位名称">{comparisonData.standardProfile.positionName}</Descriptions.Item>
                  <Descriptions.Item label="岗位级别">{comparisonData.standardProfile.positionLevel}</Descriptions.Item>
                  <Descriptions.Item label="学历要求">{comparisonData.standardProfile.educationRequirement}</Descriptions.Item>
                  <Descriptions.Item label="工作年限">{comparisonData.standardProfile.workYearsRequirement}年</Descriptions.Item>
                  <Descriptions.Item label="核心能力">{comparisonData.standardProfile.coreAbilities?.join(', ')}</Descriptions.Item>
                  <Descriptions.Item label="必备技能">{comparisonData.standardProfile.requiredSkills?.join(', ')}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </div>
        ) : (
          <Empty description="请选择岗位后点击开始对比" />
        )}
      </Modal>

      {/* 绩效详情弹窗 */}
      <Modal
        title="绩效历史记录"
        open={performanceModalVisible}
        onCancel={() => setPerformanceModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPerformanceModalVisible(false)}>关闭</Button>
        ]}
        width={500}
      >
        {currentTalent && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 12 }} />
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>{currentTalent.name}</div>
              <div style={{ color: '#666' }}>{currentTalent.positionName}</div>
            </div>
            <Timeline mode="left">
              {currentTalent.performance2024 && (
                <Timeline.Item
                  label="2024年"
                  color={currentTalent.performance2024 === 'A' ? 'green' : currentTalent.performance2024 === 'C' ? 'red' : 'blue'}
                >
                  <div style={{ fontWeight: 'bold', fontSize: 16 }}>绩效等级：{currentTalent.performance2024}</div>
                  <div style={{ color: '#666', marginTop: 4 }}>
                    {currentTalent.performance2024 === 'A' ? '表现优秀，超出预期' :
                     currentTalent.performance2024 === 'B+' ? '表现良好，符合预期' :
                     currentTalent.performance2024 === 'B' ? '表现合格，达到标准' :
                     currentTalent.performance2024 === 'B-' ? '表现一般，需要改进' :
                     '表现待提升，需重点关注'}
                  </div>
                </Timeline.Item>
              )}
              {currentTalent.performance2023 && (
                <Timeline.Item
                  label="2023年"
                  color={currentTalent.performance2023 === 'A' ? 'green' : currentTalent.performance2023 === 'C' ? 'red' : 'gray'}
                >
                  <div style={{ fontWeight: 'bold', fontSize: 16 }}>绩效等级：{currentTalent.performance2023}</div>
                  <div style={{ color: '#666', marginTop: 4 }}>
                    {currentTalent.performance2023 === 'A' ? '表现优秀，超出预期' :
                     currentTalent.performance2023 === 'B+' ? '表现良好，符合预期' :
                     currentTalent.performance2023 === 'B' ? '表现合格，达到标准' :
                     currentTalent.performance2023 === 'B-' ? '表现一般，需要改进' :
                     '表现待提升，需重点关注'}
                  </div>
                </Timeline.Item>
              )}
            </Timeline>
            <Divider />
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                说明：绩效等级分为A、B+、B、B-、C五个等级，其中A为优秀，C为待提升。
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TalentProfile
