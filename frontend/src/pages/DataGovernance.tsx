import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Tag, Button, Progress, Statistic, Tabs, List, Badge, Typography, Space, Alert, Timeline, Modal, Form, Input, Select, message, Spin, Empty } from 'antd'
import { SafetyOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, SyncOutlined, DatabaseOutlined, FileTextOutlined, SecurityScanOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

const DataGovernance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1')
  const [checkModalVisible, setCheckModalVisible] = useState(false)
  const [ruleModalVisible, setRuleModalVisible] = useState(false)
  const [checkLoading, setCheckLoading] = useState(false)
  const [qualityData, setQualityData] = useState<any>(null)
  const [dataIssues, setDataIssues] = useState<any[]>([])
  const [form] = Form.useForm()

  // 页面加载时获取数据质量信息
  useEffect(() => {
    fetchQualityData()
  }, [])

  const fetchQualityData = async () => {
    try {
      const response = await axios.get('/api/governance/quality')
      if (response.data.code === 200) {
        setQualityData(response.data.data)
        if (response.data.data?.issues) {
          setDataIssues(response.data.data.issues)
        }
      }
    } catch (error) {
      console.error('获取数据质量信息失败:', error)
    }
  }

  const getQualityStats = () => {
    if (qualityData) {
      return [
        { label: '数据完整度', value: qualityData.completeness, status: qualityData.completeness >= 90 ? 'good' : 'warning' },
        { label: '数据准确性', value: qualityData.accuracy, status: qualityData.accuracy >= 90 ? 'good' : 'warning' },
        { label: '数据一致性', value: qualityData.consistency, status: qualityData.consistency >= 90 ? 'good' : 'warning' },
        { label: '数据及时性', value: qualityData.timeliness, status: qualityData.timeliness >= 90 ? 'good' : 'warning' },
      ]
    }
    return [
      { label: '数据完整度', value: 94.5, status: 'good' },
      { label: '数据准确性', value: 98.2, status: 'good' },
      { label: '数据一致性', value: 96.8, status: 'good' },
      { label: '数据及时性', value: 89.3, status: 'warning' },
    ]
  }

  const qualityStats = getQualityStats()

  const columns = [
    {
      title: '问题类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: '涉及字段',
      dataIndex: 'field',
      key: 'field',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '问题数量',
      dataIndex: 'count',
      key: 'count',
      render: (count: number) => <Badge count={count} style={{ backgroundColor: '#ff4d4f' }} />,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          high: 'red',
          medium: 'orange',
          low: 'blue',
        }
        const textMap: Record<string, string> = {
          high: '高',
          medium: '中',
          low: '低',
        }
        return <Tag color={colorMap[text]}>{textMap[text]}</Tag>
      },
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
          pending: { color: 'default', text: '待处理', icon: <WarningOutlined /> },
          processing: { color: 'processing', text: '处理中', icon: <SyncOutlined spin /> },
          resolved: { color: 'success', text: '已解决', icon: <CheckCircleOutlined /> },
        }
        const status = statusMap[text]
        return <Tag color={status.color} icon={status.icon}>{status.text}</Tag>
      },
    },
    {
      title: '处理建议',
      dataIndex: 'suggestion',
      key: 'suggestion',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {record.status !== 'resolved' && (
            <Button type="link" size="small" onClick={() => handleProcessIssue(record)}>处理</Button>
          )}
          {record.status === 'pending' && (
            <Button type="link" size="small" onClick={() => handleIgnoreIssue(record)}>忽略</Button>
          )}
        </Space>
      ),
    },
  ]

  const operationLogs = [
    {
      time: '2024-01-15 14:30:00',
      operator: '系统管理员',
      action: '执行数据质量检查',
      result: 'success',
      detail: '发现 39 处数据问题',
    },
    {
      time: '2024-01-14 09:15:00',
      operator: '张三',
      action: '修复缺失值',
      result: 'success',
      detail: '补充 15 条手机号码',
    },
    {
      time: '2024-01-13 16:45:00',
      operator: '李四',
      action: '更新数据规则',
      result: 'success',
      detail: '修改身份证号校验规则',
    },
    {
      time: '2024-01-12 11:20:00',
      operator: '系统管理员',
      action: '数据备份',
      result: 'success',
      detail: '完成全量数据备份',
    },
  ]

  const handleCreateRule = (values: any) => {
    console.log('创建规则:', values)
    message.success('规则创建成功')
    setRuleModalVisible(false)
    form.resetFields()
  }

  // 处理问题
  const handleProcessIssue = (record: any) => {
    Modal.confirm({
      title: '处理数据问题',
      content: `确定要处理"${record.field}"的${record.type}问题吗？`,
      onOk: () => {
        // 更新问题状态为处理中
        setDataIssues(prev => prev.map(item => 
          item.id === record.id ? { ...item, status: 'processing' } : item
        ))
        message.success('已开始处理')
        
        // 模拟处理完成
        setTimeout(() => {
          setDataIssues(prev => prev.map(item => 
            item.id === record.id ? { ...item, status: 'resolved' } : item
          ))
          message.success('问题处理完成')
        }, 2000)
      }
    })
  }

  // 忽略问题
  const handleIgnoreIssue = (record: any) => {
    Modal.confirm({
      title: '忽略数据问题',
      content: `确定要忽略"${record.field}"的${record.type}问题吗？`,
      onOk: () => {
        // 从列表中移除
        setDataIssues(prev => prev.filter(item => item.id !== record.id))
        message.success('已忽略该问题')
      }
    })
  }

  const handleStartCheck = async () => {
    setCheckLoading(true)
    try {
      const response = await axios.post('/api/governance/check')
      if (response.data.code === 200) {
        message.success('数据质量检查已开始')
        const taskId = response.data.data.taskId
        
        // 轮询检查结果
        const pollResult = async () => {
          try {
            const resultResponse = await axios.get(`/api/governance/check-result/${taskId}`)
            if (resultResponse.data.code === 200) {
              const taskData = resultResponse.data.data
              if (taskData.status === 'completed') {
                message.success('数据质量检查完成')
                setQualityData(taskData.results)
                if (taskData.results?.issues) {
                  setDataIssues(taskData.results.issues)
                }
                setCheckLoading(false)
                setCheckModalVisible(false)
              } else {
                // 继续轮询
                setTimeout(pollResult, 1000)
              }
            }
          } catch (error) {
            console.error('获取检查结果失败:', error)
            setCheckLoading(false)
          }
        }
        pollResult()
      }
    } catch (error) {
      console.error('启动检查失败:', error)
      message.error('启动数据质量检查失败')
      setCheckLoading(false)
    }
  }

  return (
    <div>
      <Title level={4}>数据治理</Title>
      <Text type="secondary">保障数据质量，提升数据价值</Text>

      <Alert
        message="数据质量提醒"
        description="检测到 39 处数据质量问题，建议及时处理以保证数据准确性。"
        type="warning"
        showIcon
        style={{ marginTop: 24, marginBottom: 24 }}
        action={
          <Button size="small" type="primary" onClick={() => setCheckModalVisible(true)}>
            立即检查
          </Button>
        }
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {qualityStats.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text>{stat.label}</Text>
                <Text strong style={{ fontSize: 20, color: stat.status === 'good' ? '#52c41a' : '#faad14' }}>
                  {stat.value}%
                </Text>
              </div>
              <Progress
                percent={stat.value}
                size="small"
                strokeColor={stat.status === 'good' ? '#52c41a' : '#faad14'}
                showInfo={false}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="质量问题" key="1" icon={<WarningOutlined />}>
            {dataIssues.length > 0 ? (
              <Table
                columns={columns}
                dataSource={dataIssues}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="暂无数据质量问题" />
            )}
          </TabPane>

          <TabPane tab="数据标准" key="2" icon={<FileTextOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="字段标准" extra={<Button type="primary" size="small" onClick={() => setRuleModalVisible(true)}>新建规则</Button>}>
                  <List
                    dataSource={[
                      { field: '手机号码', rule: '11位数字，以1开头', status: 'active' },
                      { field: '身份证号', rule: '18位，符合校验规则', status: 'active' },
                      { field: '邮箱地址', rule: '符合邮箱格式', status: 'active' },
                      { field: '入职日期', rule: '不能晚于当前日期', status: 'active' },
                    ]}
                    renderItem={(item) => (
                      <List.Item
                        actions={[<Button type="link" size="small">编辑</Button>, <Button type="link" size="small" danger>删除</Button>]}
                      >
                        <List.Item.Meta
                          title={item.field}
                          description={item.rule}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="数据字典">
                  <List
                    dataSource={[
                      { name: '性别', values: '男、女、保密', count: 3 },
                      { name: '学历', values: '博士、硕士、本科、大专', count: 4 },
                      { name: '职级', values: 'T1-T6', count: 6 },
                      { name: '状态', values: '在职、离职、试用期', count: 3 },
                    ]}
                    renderItem={(item) => (
                      <List.Item
                        actions={[<Tag>{item.count} 个值</Tag>]}
                      >
                        <List.Item.Meta
                          title={item.name}
                          description={item.values}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="操作日志" key="3" icon={<HistoryOutlined />}>
            <Timeline mode="left">
              {operationLogs.map((log, index) => (
                <Timeline.Item
                  key={index}
                  label={<Text type="secondary">{log.time}</Text>}
                  color={log.result === 'success' ? 'green' : 'red'}
                  dot={log.result === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text strong>{log.action}</Text>
                      <Tag color="blue">{log.operator}</Tag>
                    </div>
                    <Text type="secondary">{log.detail}</Text>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>

          <TabPane tab="系统配置" key="4" icon={<SettingOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="检查配置">
                  <List>
                    <List.Item
                      extra={<Button type="primary" size="small">配置</Button>}
                    >
                      <List.Item.Meta
                        title="自动检查频率"
                        description="每周一凌晨 2:00 自动执行数据质量检查"
                      />
                    </List.Item>
                    <List.Item
                      extra={<Button type="primary" size="small">配置</Button>}
                    >
                      <List.Item.Meta
                        title="告警阈值"
                        description="数据完整度低于 90% 时发送告警通知"
                      />
                    </List.Item>
                    <List.Item
                      extra={<Button type="primary" size="small">配置</Button>}
                    >
                      <List.Item.Meta
                        title="通知方式"
                        description="邮件 + 站内消息"
                      />
                    </List.Item>
                  </List>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="备份配置">
                  <List>
                    <List.Item
                      extra={<Button type="primary" size="small">配置</Button>}
                    >
                      <List.Item.Meta
                        title="自动备份"
                        description="每天凌晨 1:00 自动备份"
                      />
                    </List.Item>
                    <List.Item
                      extra={<Button type="primary" size="small">配置</Button>}
                    >
                      <List.Item.Meta
                        title="备份保留"
                        description="保留最近 30 天的备份"
                      />
                    </List.Item>
                    <List.Item
                      extra={<Button type="primary" size="small">立即备份</Button>}
                    >
                      <List.Item.Meta
                        title="手动备份"
                        description="上次备份：2024-01-15 01:00:00"
                      />
                    </List.Item>
                  </List>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="数据质量检查"
        open={checkModalVisible}
        onCancel={() => setCheckModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCheckModalVisible(false)} disabled={checkLoading}>取消</Button>,
          <Button key="submit" type="primary" icon={<SyncOutlined spin={checkLoading} />} onClick={handleStartCheck} loading={checkLoading}>
            {checkLoading ? '检查中...' : '开始检查'}
          </Button>,
        ]}
        width={600}
      >
        <div style={{ padding: 24, textAlign: 'center' }}>
          {checkLoading ? (
            <>
              <Spin size="large" />
              <Title level={5} style={{ marginTop: 16 }}>正在执行数据质量检查</Title>
              <Text type="secondary">请稍候，正在扫描数据表...</Text>
            </>
          ) : (
            <>
              <SafetyOutlined style={{ fontSize: 64, color: '#1890ff' }} />
              <Title level={5} style={{ marginTop: 16 }}>即将执行数据质量检查</Title>
              <Text type="secondary">系统将自动扫描以下数据表，预计耗时 2-3 分钟</Text>
            </>
          )}
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <Tag style={{ margin: 4 }}>hr_talent</Tag>
            <Tag style={{ margin: 4 }}>hr_education</Tag>
            <Tag style={{ margin: 4 }}>hr_work_experience</Tag>
            <Tag style={{ margin: 4 }}>hr_project</Tag>
            <Tag style={{ margin: 4 }}>hr_skill</Tag>
          </div>
        </div>
      </Modal>

      <Modal
        title="新建校验规则"
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRule}>
          <Form.Item
            name="field"
            label="字段名称"
            rules={[{ required: true, message: '请输入字段名称' }]}
          >
            <Input placeholder="请输入字段名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="校验类型"
            rules={[{ required: true, message: '请选择校验类型' }]}
          >
            <Select placeholder="请选择校验类型">
              <Option value="required">必填校验</Option>
              <Option value="format">格式校验</Option>
              <Option value="range">范围校验</Option>
              <Option value="unique">唯一性校验</Option>
              <Option value="custom">自定义规则</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="rule"
            label="校验规则"
            rules={[{ required: true, message: '请输入校验规则' }]}
          >
            <TextArea rows={3} placeholder="请输入校验规则描述或正则表达式" />
          </Form.Item>
          <Form.Item
            name="errorMessage"
            label="错误提示"
          >
            <Input placeholder="校验失败时的提示信息" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setRuleModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DataGovernance
