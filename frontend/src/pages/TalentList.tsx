import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Tag, Avatar, Badge, Input, Select, Modal, Form, message, Space } from 'antd'
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Search } = Input
const { Option } = Select

interface Talent {
  id: number
  talentId: string
  name: string
  gender: number
  phone?: string
  email?: string
  workYears?: number
  educationLevel?: string
  schoolName?: string
  deptName?: string
  positionName?: string
  isKeyTalent?: number
  status?: string
}

const TalentList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Talent[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [currentTalent, setCurrentTalent] = useState<Talent | null>(null)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()

  useEffect(() => {
    fetchData(currentPage, pageSize)
  }, [currentPage, pageSize, filter, statusFilter])

  const fetchData = async (page: number = 1, size: number = 10) => {
    setLoading(true)
    try {
      let url = `/api/talent/list?page=${page}&pageSize=${size}`
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`
      }
      // 添加关键人才筛选
      if (filter === 'key') {
        url += `&isKeyTalent=1`
      }
      const res = await axios.get(url)
      console.log('API Response:', res.data)
      if (res.data.code === 200) {
        // 处理分页数据格式
        const listData = res.data.data?.list || res.data.data || []
        const totalCount = res.data.data?.total || listData.length
        setData(listData)
        setTotal(totalCount)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      message.error('获取数据失败')
    }
    setLoading(false)
  }

  const handleSearch = async () => {
    setCurrentPage(1)
    setLoading(true)
    try {
      let url = `/api/talent/list?keyword=${encodeURIComponent(keyword)}&page=1&pageSize=${pageSize}`
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`
      }
      // 添加关键人才筛选
      if (filter === 'key') {
        url += `&isKeyTalent=1`
      }
      const res = await axios.get(url)
      if (res.data.code === 200) {
        const listData = res.data.data?.list || res.data.data || []
        const totalCount = res.data.data?.total || listData.length
        setData(listData)
        setTotal(totalCount)
      }
    } catch (error) {
      console.error('搜索失败:', error)
      message.error('搜索失败')
    }
    setLoading(false)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
    fetchData(1, pageSize)
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setCurrentPage(1)
    fetchData(1, pageSize)
  }

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page)
    if (size) setPageSize(size)
  }

  const handleAdd = () => {
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleView = (record: Talent) => {
    setCurrentTalent(record)
    Modal.info({
      title: '人才详情',
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          <p><strong>姓名：</strong>{record.name}</p>
          <p><strong>人才编号：</strong>{record.talentId}</p>
          <p><strong>性别：</strong>{record.gender === 1 ? '男' : '女'}</p>
          <p><strong>部门：</strong>{record.deptName || '-'}</p>
          <p><strong>职位：</strong>{record.positionName || '-'}</p>
          <p><strong>工作年限：</strong>{record.workYears ? `${record.workYears}年` : '-'}</p>
          <p><strong>学历：</strong>{record.educationLevel || '-'}</p>
          <p><strong>毕业院校：</strong>{record.schoolName || '-'}</p>
          <p><strong>电话：</strong>{record.phone || '-'}</p>
          <p><strong>邮箱：</strong>{record.email || '-'}</p>
          <p><strong>状态：</strong>{record.status === 1 ? '在职' : '离职'}</p>
          <p><strong>关键人才：</strong>{record.isKeyTalent === 1 ? '是' : '否'}</p>
        </div>
      )
    })
  }

  const handleEdit = (record: Talent) => {
    setCurrentTalent(record)
    editForm.setFieldsValue({
      name: record.name,
      gender: record.gender,
      phone: record.phone,
      email: record.email,
      deptName: record.deptName,
      positionName: record.positionName,
      educationLevel: record.educationLevel,
      schoolName: record.schoolName,
      workYears: record.workYears,
      status: record.status,
      isKeyTalent: record.isKeyTalent
    })
    setIsEditModalVisible(true)
  }

  const handleEditModalOk = async () => {
    try {
      const values = await editForm.validateFields()
      if (!currentTalent) return
      const res = await axios.put(`/api/talent/${currentTalent.id}`, values)
      if (res.data.code === 200) {
        message.success('编辑成功')
        setIsEditModalVisible(false)
        fetchData(currentPage, pageSize)
      }
    } catch (error) {
      console.error('编辑失败:', error)
      message.error('编辑失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const res = await axios.post('/api/talent', values)
      if (res.data.code === 200) {
        message.success('新增人才成功')
        setIsModalVisible(false)
        fetchData(currentPage, pageSize)
      }
    } catch (error) {
      console.error('新增失败:', error)
      message.error('新增失败')
    }
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该人才吗？',
      onOk: async () => {
        try {
          const res = await axios.delete(`/api/talent/${id}`)
          if (res.data.code === 200) {
            message.success('删除成功')
            fetchData(currentPage, pageSize)
          }
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const columns = [
    {
      title: '人才信息',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: Talent) => {
        // 隐藏工号后四位
        const maskTalentId = (id: string) => {
          if (!id || id.length <= 4) return id
          return id.slice(0, -4) + '****'
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={48} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              {record.name?.[0] || '?'}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {record.name}
                {record.isKeyTalent === 1 && <Badge count="关键" style={{ marginLeft: 8, background: '#ff4d4f' }} />}
              </div>
              <div style={{ color: '#666', fontSize: 13 }}>
                {maskTalentId(record.talentId)} | {record.gender === 1 ? '男' : '女'}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      title: '部门/职位',
      key: 'dept',
      render: (_: any, record: Talent) => (
        <div>
          <div>{record.deptName || '-'}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.positionName || '-'}</div>
        </div>
      ),
    },
    {
      title: '工作年限',
      dataIndex: 'workYears',
      key: 'workYears',
      render: (years: number) => years ? `${years}年` : '-',
    },
    {
      title: '学历',
      dataIndex: 'educationLevel',
      key: 'educationLevel',
      render: (edu: string) => edu || '-',
    },
    {
      title: '毕业院校',
      dataIndex: 'schoolName',
      key: 'schoolName',
      render: (school: string) => school || '-',
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_: any, record: Talent) => (
        <div>
          <div>{record.phone || '-'}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.email || '-'}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '在职' ? 'success' : 'default'}>
          {status === '在职' ? '在职' : '离职'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Talent) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, flex: 1 }}>
            <Search
              placeholder="搜索姓名、工号、技能..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 300 }}
              enterButton={<><SearchOutlined /> 搜索</>}
            />
            <Select
              value={filter}
              onChange={handleFilterChange}
              style={{ width: 150 }}
            >
              <Option value="all">全部</Option>
              <Option value="key">关键人才</Option>
              <Option value="ai">AI人才</Option>
            </Select>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ width: 120 }}
              placeholder="人员状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="在职">在职</Option>
              <Option value="离职">离职</Option>
            </Select>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增人才</Button>
        </div>
      </Card>

      <Card title={`人才列表 (共 ${total} 人)`}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handlePageChange,
          }}
        />
      </Card>

      <Modal
        title="新增人才"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="性别"
            initialValue={1}
          >
            <Select>
              <Option value={1}>男</Option>
              <Option value={0}>女</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的11位手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
              { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确，需包含@和域名后缀' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="deptName"
            label="部门"
          >
            <Input placeholder="请输入部门" />
          </Form.Item>
          <Form.Item
            name="positionName"
            label="职位"
          >
            <Input placeholder="请输入职位" />
          </Form.Item>
          <Form.Item
            name="educationLevel"
            label="学历"
          >
            <Select placeholder="请选择学历">
              <Option value="博士">博士</Option>
              <Option value="硕士">硕士</Option>
              <Option value="本科">本科</Option>
              <Option value="大专">大专</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="schoolName"
            label="毕业院校"
          >
            <Input placeholder="请输入毕业院校" />
          </Form.Item>
          <Form.Item
            name="major"
            label="专业"
          >
            <Input placeholder="请输入专业" />
          </Form.Item>
          <Form.Item
            name="workYears"
            label="工作年限"
          >
            <Input type="number" placeholder="请输入工作年限" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑人才弹窗 */}
      <Modal
        title="编辑人才"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setIsEditModalVisible(false)}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="性别"
          >
            <Select>
              <Option value={1}>男</Option>
              <Option value={0}>女</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的11位手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="deptName"
            label="部门"
          >
            <Input placeholder="请输入部门" />
          </Form.Item>
          <Form.Item
            name="positionName"
            label="职位"
          >
            <Input placeholder="请输入职位" />
          </Form.Item>
          <Form.Item
            name="educationLevel"
            label="学历"
          >
            <Select placeholder="请选择学历">
              <Option value="博士">博士</Option>
              <Option value="硕士">硕士</Option>
              <Option value="本科">本科</Option>
              <Option value="大专">大专</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="schoolName"
            label="毕业院校"
          >
            <Input placeholder="请输入毕业院校" />
          </Form.Item>
          <Form.Item
            name="workYears"
            label="工作年限"
          >
            <Input type="number" placeholder="请输入工作年限" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select>
              <Option value={1}>在职</Option>
              <Option value={0}>离职</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="isKeyTalent"
            label="关键人才"
          >
            <Select>
              <Option value={1}>是</Option>
              <Option value={0}>否</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TalentList
