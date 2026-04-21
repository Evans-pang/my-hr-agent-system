import React, { useState, useRef, useEffect } from 'react'
import { Input, Button, List, Avatar, Typography, Space, Spin, Badge, Drawer } from 'antd'
import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Text } = Typography
const { TextArea } = Input

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

const AIAssistant: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: '您好！我是HR智能助手，可以帮您查询人才信息、统计数据或解答HR相关问题。请问有什么可以帮您的？',
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const response = await axios.post('/api/nlp/chat', {
        question: userMessage.content,
        context: {},
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.data?.answer || '抱歉，我暂时无法回答这个问题。',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickQuestions = [
    '公司目前有多少人？',
    '本月离职率是多少？',
    '还有多少HC待招聘？',
    '最近绩效考核情况如何？',
  ]

  return (
    <>
      <div
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 1000,
        }}
      >
        <Badge count={0} dot={messages.length > 1}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<RobotOutlined style={{ fontSize: 24 }} />}
            onClick={() => setVisible(true)}
            style={{
              width: 56,
              height: 56,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
        </Badge>
      </div>

      <Drawer
        title={
          <Space>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <Text strong>HR智能助手</Text>
          </Space>
        }
        placement="right"
        onClose={() => setVisible(false)}
        open={visible}
        width={420}
        bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
        headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 16,
            background: '#f5f5f5',
          }}
        >
          <List
            dataSource={messages}
            renderItem={(message) => (
              <List.Item
                style={{
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  padding: '8px 0',
                  border: 'none',
                }}
              >
                <Space
                  align="start"
                  style={{
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: message.type === 'user' ? '#1890ff' : '#52c41a',
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      maxWidth: 280,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: message.type === 'user' ? '#1890ff' : '#fff',
                      color: message.type === 'user' ? '#fff' : 'inherit',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Text style={{ color: message.type === 'user' ? '#fff' : 'inherit' }}>
                      {message.content}
                    </Text>
                  </div>
                </Space>
              </List.Item>
            )}
          />
          {loading && (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin size="small" />
              <Text type="secondary" style={{ marginLeft: 8 }}>思考中...</Text>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length < 3 && (
          <div style={{ padding: '8px 16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>快捷问题：</Text>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  size="small"
                  onClick={() => {
                    setInputValue(question)
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            padding: 16,
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ resize: 'none' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
            />
          </Space.Compact>
          <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
            按 Enter 发送，Shift + Enter 换行
          </Text>
        </div>
      </Drawer>
    </>
  )
}

export default AIAssistant
