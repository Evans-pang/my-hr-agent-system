import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Input, Upload, Tag, Space, Row, Col, Statistic, Progress, Tabs, List, Avatar, Badge, Typography, Modal, message, Checkbox, Select, Form, Radio, Divider, Descriptions } from 'antd'
import { UploadOutlined, SearchOutlined, FileTextOutlined, EyeOutlined, DownloadOutlined, DeleteOutlined, CheckCircleOutlined, SyncOutlined, RobotOutlined, FileWordOutlined, FileAddOutlined, SendOutlined, MailOutlined, TeamOutlined, CopyOutlined, EditOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import axios from 'axios'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { Search } = Input
const { Option } = Select
const { TextArea } = Input

interface Resume {
  id: number
  talentId: number
  name: string
  position?: string
  source: string
  uploadTime: string
  status: string
  matchScore?: number
  fileName: string
  fileSize?: string
}

interface ResumeTemplate {
  id: string
  name: string
  description: string
  category: string
  sections: string[]
  previewImage?: string
}

const ResumeManage: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [generateModalVisible, setGenerateModalVisible] = useState(false)
  const [templateModalVisible, setTemplateModalVisible] = useState(false)
  const [templateDetailVisible, setTemplateDetailVisible] = useState(false)
  const [batchDownloadModalVisible, setBatchDownloadModalVisible] = useState(false)
  const [pushModalVisible, setPushModalVisible] = useState(false)
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [selectedTalent, setSelectedTalent] = useState<any>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [talents, setTalents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // 批量选择相关
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedResumes, setSelectedResumes] = useState<Resume[]>([])
  
  // 模板相关
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null)
  const [templateForm] = Form.useForm()
  
  // 推送相关
  const [pushForm] = Form.useForm()
  const [pushType, setPushType] = useState('email')

  useEffect(() => {
    fetchResumes()
    fetchTalents()
  }, [])

  const fetchResumes = async () => {
    try {
      const res = await axios.get('/api/resume/list')
      if (res.data.code === 200) {
        setResumes(res.data.data || [])
      }
    } catch (error) {
      console.error('获取简历列表失败:', error)
      // 使用模拟数据
      setResumes([
        { id: 1, talentId: 1, name: '张三', position: '高级Java工程师', source: '智联招聘', uploadTime: '2024-01-15 14:30', status: '已解析', matchScore: 92, fileName: '张三_简历.pdf', fileSize: '1.2MB' },
        { id: 2, talentId: 2, name: '李四', position: 'AI算法工程师', source: 'BOSS直聘', uploadTime: '2024-01-15 10:20', status: '解析中', matchScore: 0, fileName: '李四_简历.pdf', fileSize: '856KB' },
        { id: 3, talentId: 3, name: '王五', position: '产品经理', source: '猎聘网', uploadTime: '2024-01-14 16:45', status: '已解析', matchScore: 85, fileName: '王五_简历.pdf', fileSize: '2.1MB' },
        { id: 4, talentId: 4, name: '赵六', position: '前端工程师', source: '手动上传', uploadTime: '2024-01-14 09:30', status: '待解析', matchScore: 0, fileName: '赵六_简历.docx', fileSize: '680KB' },
      ])
    }
  }

  const fetchTalents = async () => {
    try {
      const res = await axios.get('/api/talent/list')
      if (res.data.code === 200) {
        const listData = res.data.data?.list || res.data.data || []
        setTalents(listData)
      }
    } catch (error) {
      console.error('获取人才列表失败:', error)
    }
  }

  const handlePreview = (record: Resume) => {
    setSelectedResume(record)
    // 找到对应的人才信息
    const talent = talents.find(t => t.id === record.talentId)
    if (talent) {
      setSelectedTalent(talent)
    }
    setPreviewModalVisible(true)
  }

  const handleDownload = async (record: Resume) => {
    try {
      const response = await axios.get(`/api/resume/download-generated/${record.talentId}`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${record.name}_简历.docx`
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

  const handleGenerateResume = async (talentId: number) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/resume/download-generated/${talentId}`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const talent = talents.find(t => t.id === talentId)
      link.download = `${talent?.name || '未知'}_简历.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      message.success('简历生成并下载成功')
      setGenerateModalVisible(false)
    } catch (error) {
      console.error('生成简历失败:', error)
      message.error('生成简历失败')
    }
    setLoading(false)
  }

  const handlePreviewGenerated = async (talentId: number) => {
    try {
      const response = await axios.get(`/api/resume/preview/${talentId}`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('预览失败:', error)
      message.error('预览失败')
    }
  }

  // 标准简历模板数据
  const resumeTemplates: ResumeTemplate[] = [
    {
      id: '1',
      name: '技术类简历模板',
      description: '适用于软件开发、算法工程师等技术岗位，突出项目经验和技术栈',
      category: '技术类',
      sections: ['基本信息', '技术栈', '项目经验', '工作经历', '教育背景', '自我评价']
    },
    {
      id: '2',
      name: '产品类简历模板',
      description: '适用于产品经理、产品运营等岗位，突出产品思维和项目成果',
      category: '产品类',
      sections: ['基本信息', '产品经验', '项目案例', '数据分析', '教育背景', '个人优势']
    },
    {
      id: '3',
      name: '管理类简历模板',
      description: '适用于项目经理、团队管理等岗位，突出管理经验和团队成果',
      category: '管理类',
      sections: ['基本信息', '管理经验', '团队规模', '项目成果', '教育背景', '领导力']
    },
    {
      id: '4',
      name: '销售类简历模板',
      description: '适用于销售、商务等岗位，突出业绩和客户资源',
      category: '销售类',
      sections: ['基本信息', '销售业绩', '客户资源', '行业经验', '教育背景', '个人特质']
    },
    {
      id: '5',
      name: '通用简历模板',
      description: '适用于各类岗位，结构清晰，内容全面',
      category: '通用类',
      sections: ['基本信息', '工作经历', '教育背景', '专业技能', '项目经验', '自我评价']
    }
  ]

  // 选择模板
  const handleSelectTemplate = (template: ResumeTemplate) => {
    setSelectedTemplate(template)
    templateForm.setFieldsValue({
      name: template.name,
      category: template.category,
      sections: template.sections
    })
    setTemplateDetailVisible(true)
  }

  // 导入模板
  const handleImportTemplate = async (values: any) => {
    try {
      // 调用后端API导入模板
      const res = await axios.post('/api/resume/template/import', {
        templateId: selectedTemplate?.id,
        customName: values.customName,
        customSections: values.sections
      })
      
      if (res.data.code === 200) {
        message.success('模板导入成功')
        setTemplateDetailVisible(false)
        setTemplateModalVisible(false)
        templateForm.resetFields()
      } else {
        message.error(res.data.message || '导入失败')
      }
    } catch (error) {
      console.error('导入模板失败:', error)
      message.error('导入失败')
    }
  }

  // 批量下载
  const handleBatchDownload = async () => {
    if (selectedResumes.length === 0) {
      message.warning('请先选择要下载的简历')
      return
    }
    
    setLoading(true)
    try {
      // 逐个下载简历
      let successCount = 0
      for (const resume of selectedResumes) {
        try {
          const response = await axios.get(`/api/resume/download-generated/${resume.talentId}`, {
            responseType: 'blob'
          })
          
          const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${resume.name}_简历.docx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          successCount++
          // 添加短暂延迟避免浏览器阻塞
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (err) {
          console.error(`下载 ${resume.name} 的简历失败:`, err)
        }
      }
      
      message.success(`成功下载 ${successCount}/${selectedResumes.length} 份简历`)
      setBatchDownloadModalVisible(false)
      setSelectedRowKeys([])
      setSelectedResumes([])
    } catch (error) {
      console.error('批量下载失败:', error)
      message.error('批量下载失败')
    }
    setLoading(false)
  }

  // 推送简历
  const handlePushResumes = async (values: any) => {
    if (selectedResumes.length === 0) {
      message.warning('请先选择要推送的简历')
      return
    }
    
    setLoading(true)
    try {
      // 调用后端API推送简历
      const res = await axios.post('/api/resume/push', {
        resumeIds: selectedResumes.map(r => r.id),
        pushType: values.pushType,
        email: values.email,
        platform: values.platform,
        message: values.message
      })
      
      if (res.data.code === 200) {
        // 显示提示说明这是演示环境
        Modal.info({
          title: '推送成功（演示模式）',
          content: (
            <div>
              <p>简历推送请求已发送成功！</p>
              <p>目标：{values.pushType === 'email' ? values.email : values.platform}</p>
              <p>数量：{selectedResumes.length} 份简历</p>
              <p style={{ color: '#999', marginTop: 16 }}>
                注：当前为演示环境，实际邮件/平台推送需要配置SMTP服务器或平台API密钥
              </p>
            </div>
          ),
          onOk: () => {
            setPushModalVisible(false)
            pushForm.resetFields()
            setSelectedRowKeys([])
            setSelectedResumes([])
          }
        })
      } else {
        message.error(res.data.message || '推送失败')
      }
    } catch (error) {
      console.error('推送失败:', error)
      message.error('推送失败')
    }
    setLoading(false)
  }

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: Resume[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
      setSelectedResumes(selectedRows)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/resume/upload',
    headers: {
      authorization: 'authorization-text',
    },
    accept: '.pdf,.doc,.docx',
    multiple: true,
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`)
        fetchResumes()
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`)
      }
    },
  }

  const columns = [
    {
      title: '候选人',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Resume) => (
        <Space>
          <Avatar size="small" icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div><Text strong>{text}</Text></div>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{record.position || '-'}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: '简历文件',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text: string, record: Resume) => (
        <div>
          <div>{text}</div>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{record.fileSize || '-'}</Text></div>
        </div>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          '已解析': 'green',
          '解析中': 'processing',
          '待解析': 'default',
          '解析失败': 'red',
        }
        const iconMap: Record<string, React.ReactNode> = {
          '已解析': <CheckCircleOutlined />,
          '解析中': <SyncOutlined spin />,
          '待解析': null,
          '解析失败': null,
        }
        return <Tag color={colorMap[text]} icon={iconMap[text]}>{text}</Tag>
      },
    },
    {
      title: '匹配度',
      dataIndex: 'matchScore',
      key: 'matchScore',
      render: (score: number) => score > 0 ? <Progress percent={score} size="small" /> : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Resume) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>预览</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record)}>下载</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4}>简历管理</Title>
      <Text type="secondary">智能解析简历，自动提取关键信息</Text>

      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="简历总数"
              value={resumes.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月新增"
              value={resumes.filter(r => r.uploadTime.includes('2024-01')).length}
              prefix={<UploadOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已解析"
              value={resumes.filter(r => r.status === '已解析').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="解析成功率"
              value={98.5}
              suffix="%"
              prefix={<SyncOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 批量操作栏 */}
      {selectedResumes.length > 0 && (
        <Card style={{ marginBottom: 16, background: '#f6ffed' }}>
          <Space>
            <Text>已选择 <Text strong style={{ color: '#52c41a' }}>{selectedResumes.length}</Text> 份简历</Text>
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => setBatchDownloadModalVisible(true)}>
              批量下载
            </Button>
            <Button type="primary" icon={<SendOutlined />} onClick={() => setPushModalVisible(true)}>
              推送简历
            </Button>
            <Button onClick={() => { setSelectedRowKeys([]); setSelectedResumes([]) }}>
              取消选择
            </Button>
          </Space>
        </Card>
      )}

      <Card
        title="简历库"
        extra={
          <Space>
            <Search
              placeholder="搜索候选人姓名"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button icon={<FileAddOutlined />} onClick={() => setTemplateModalVisible(true)}>
              模板导入
            </Button>
            <Button type="primary" icon={<FileWordOutlined />} onClick={() => setGenerateModalVisible(true)}>
              生成简历
            </Button>
            <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
              上传简历
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="全部简历" key="1">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={resumes}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="待解析" key="2">
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={resumes.filter(item => item.status === '待解析')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="解析失败" key="3">
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              暂无解析失败的简历
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 上传简历弹窗 */}
      <Modal
        title="上传简历"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setUploadModalVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={() => setUploadModalVisible(false)}>确定</Button>,
        ]}
        width={600}
      >
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持 PDF、Word 格式，单个文件不超过 10MB
          </p>
        </Upload.Dragger>
        <div style={{ marginTop: 16, padding: 16, background: '#f6ffed', borderRadius: 4 }}>
          <Space>
            <RobotOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary">上传后将自动使用AI解析简历内容</Text>
          </Space>
        </div>
      </Modal>

      {/* 简历预览弹窗 */}
      <Modal
        title="简历预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>关闭</Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => selectedResume && handleDownload(selectedResume)}>下载Word</Button>,
        ]}
        width={800}
      >
        {selectedTalent && (
          <div style={{ padding: 24, background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>个人简历</Title>
            </div>
            
            <div style={{ background: '#fff', padding: 32, borderRadius: 4 }}>
              <Title level={5}>基本信息</Title>
              <div style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}><Text strong>姓名：</Text>{selectedTalent.name}</Col>
                  <Col span={12}><Text strong>性别：</Text>{selectedTalent.gender === 1 ? '男' : '女'}</Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 8 }}>
                  <Col span={12}><Text strong>电话：</Text>{selectedTalent.phone || '-'}</Col>
                  <Col span={12}><Text strong>邮箱：</Text>{selectedTalent.email || '-'}</Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 8 }}>
                  <Col span={12}><Text strong>学历：</Text>{selectedTalent.educationLevel || '-'}</Col>
                  <Col span={12}><Text strong>毕业院校：</Text>{selectedTalent.schoolName || '-'}</Col>
                </Row>
              </div>

              <Divider />

              <Title level={5}>工作经历</Title>
              <div style={{ marginBottom: 16 }}>
                <Text strong>公司：</Text>{selectedTalent.deptName || '-'}<br/>
                <Text strong>职位：</Text>{selectedTalent.positionName || '-'}<br/>
                <Text strong>工作年限：</Text>{selectedTalent.workYears ? selectedTalent.workYears + '年' : '-'}<br/>
                <Text strong>入职时间：</Text>{selectedTalent.entryDate || '-'}
              </div>

              <Divider />

              <Title level={5}>专业技能</Title>
              <div style={{ marginBottom: 16 }}>
                {selectedTalent.skills?.map((skill: string) => (
                  <Tag key={skill} style={{ marginRight: 8, marginBottom: 8 }}>{skill}</Tag>
                )) || <Text type="secondary">暂无技能信息</Text>}
              </div>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Button type="primary" icon={<DownloadOutlined />} onClick={() => selectedResume && handleDownload(selectedResume)}>
                  下载完整简历（Word格式）
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 生成简历弹窗 */}
      <Modal
        title="生成简历"
        open={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        footer={null}
        width={700}
      >
        <List
          header={<div>选择要生成简历的人才</div>}
          dataSource={talents}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" icon={<EyeOutlined />} onClick={() => handlePreviewGenerated(item.id)}>预览</Button>,
                <Button type="primary" icon={<DownloadOutlined />} loading={loading} onClick={() => handleGenerateResume(item.id)}>生成并下载</Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                title={item.name}
                description={`${item.deptName || '-'} | ${item.positionName || '-'} | ${item.educationLevel || '-'}`}
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* 标准简历模板导入弹窗 */}
      <Modal
        title="标准简历模板导入"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          {resumeTemplates.map(template => (
            <Col span={12} key={template.id}>
              <Card
                hoverable
                onClick={() => handleSelectTemplate(template)}
                title={template.name}
                extra={<Tag color="blue">{template.category}</Tag>}
              >
                <p>{template.description}</p>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">包含模块：</Text>
                  <div style={{ marginTop: 4 }}>
                    {template.sections.map((section, idx) => (
                      <Tag key={idx} size="small" style={{ marginBottom: 4 }}>{section}</Tag>
                    ))}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* 模板详情/自定义弹窗 */}
      <Modal
        title="模板自定义"
        open={templateDetailVisible}
        onCancel={() => setTemplateDetailVisible(false)}
        onOk={() => templateForm.submit()}
        width={600}
      >
        <Form form={templateForm} layout="vertical" onFinish={handleImportTemplate}>
          <Form.Item name="name" label="模板名称" rules={[{ required: true }]}>
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          
          <Form.Item name="category" label="模板分类">
            <Select placeholder="请选择分类">
              <Option value="技术类">技术类</Option>
              <Option value="产品类">产品类</Option>
              <Option value="管理类">管理类</Option>
              <Option value="销售类">销售类</Option>
              <Option value="通用类">通用类</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="简历模块">
            <Form.List name="sections">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name]}
                        rules={[{ required: true, message: '请输入模块名称' }]}
                        noStyle
                      >
                        <Input placeholder="模块名称" style={{ width: 200 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加模块
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          
          <Form.Item>
            <Text type="secondary">导入后可在生成简历时使用此模板</Text>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量下载弹窗 */}
      <Modal
        title="批量下载简历"
        open={batchDownloadModalVisible}
        onCancel={() => setBatchDownloadModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setBatchDownloadModalVisible(false)}>取消</Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} loading={loading} onClick={handleBatchDownload}>
            确认下载 ({selectedResumes.length}份)
          </Button>,
        ]}
        width={500}
      >
        <div style={{ padding: 16 }}>
          <p>即将下载以下 <Text strong>{selectedResumes.length}</Text> 份简历：</p>
          <List
            size="small"
            dataSource={selectedResumes.slice(0, 5)}
            renderItem={item => (
              <List.Item>
                <Text>{item.name} - {item.position || '无职位'}</Text>
              </List.Item>
            )}
          />
          {selectedResumes.length > 5 && (
            <Text type="secondary">...还有 {selectedResumes.length - 5} 份简历</Text>
          )}
          <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 4 }}>
            <Text type="secondary">下载文件将以ZIP压缩包形式保存</Text>
          </div>
        </div>
      </Modal>

      {/* 推送简历弹窗 */}
      <Modal
        title="推送简历"
        open={pushModalVisible}
        onCancel={() => setPushModalVisible(false)}
        onOk={() => pushForm.submit()}
        width={600}
      >
        <Form form={pushForm} layout="vertical" onFinish={handlePushResumes}>
          <Form.Item label="推送方式">
            <Radio.Group value={pushType} onChange={(e) => setPushType(e.target.value)}>
              <Radio.Button value="email"><MailOutlined /> 邮件推送</Radio.Button>
              <Radio.Button value="platform"><TeamOutlined /> 协作平台</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          {pushType === 'email' && (
            <Form.Item name="email" label="接收邮箱" rules={[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]}>
              <Input placeholder="请输入接收邮箱" />
            </Form.Item>
          )}
          
          {pushType === 'platform' && (
            <Form.Item name="platform" label="协作平台" rules={[{ required: true }]}>
              <Select placeholder="请选择协作平台">
                <Option value="dingtalk">钉钉</Option>
                <Option value="wechat">企业微信</Option>
                <Option value="feishu">飞书</Option>
                <Option value="lark">Lark</Option>
              </Select>
            </Form.Item>
          )}
          
          <Form.Item name="message" label="附加消息">
            <TextArea rows={3} placeholder="可选：添加附加消息" />
          </Form.Item>
          
          <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <Text type="secondary">将推送 {selectedResumes.length} 份简历</Text>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default ResumeManage
