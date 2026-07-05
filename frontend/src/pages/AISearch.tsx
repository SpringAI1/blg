import { useSearchParams } from 'react-router-dom';
import { Card, Typography, Button, Space, App } from 'antd';
import { RobotOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect } from 'react';
import { searchApi } from '@/api/search';

const { Title, Text } = Typography;

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  results?: { id: number; title: string; type: 'article' | 'resource'; link: string }[];
  timestamp: string;
}

const AISearch = () => {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: '你好！我是AI搜索助手。我可以帮助你：\n\n1. 搜索站内文章和资源\n2. 回答技术问题\n3. 提供相关链接\n\n有什么我可以帮助你的吗？',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const keyword = searchParams.get('q') || searchParams.get('keyword') || '';
    if (keyword) {
      setInput(keyword);
      handleSearch(keyword).catch(() => message.error('AI搜索失败'));
    }
  }, [searchParams]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await handleSearch(input.trim());
  };

  const handleSearch = async (query: string) => {
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 使用真实搜索 API
      const response = await searchApi.searchAll(query);
      const articles = response?.articles || [];
      const resources = response?.resources || [];

      let aiResponse = '';
      const results: { id: number; title: string; type: 'article' | 'resource'; link: string }[] = [];

      if (articles.length === 0 && resources.length === 0) {
        aiResponse = `关于"${query}"，没有找到相关的站内内容。建议：\n\n1. 尝试其他关键词搜索\n2. 使用百度搜索获取更广泛的结果\n3. 浏览博客页面发现最新文章`;
      } else {
        aiResponse = `关于"${query}"，我找到了以下内容：\n\n`;

        if (articles.length > 0) {
          aiResponse += `**📄 文章 (${articles.length}篇)**\n\n`;
          articles.slice(0, 5).forEach((a: any, i: number) => {
            aiResponse += `${i + 1}. [${a.title}](/article/${a.id}) — ${a.summary?.substring(0, 60) || ''}...\n`;
            results.push({ id: a.id, title: a.title, type: 'article', link: `/article/${a.id}` });
          });
          aiResponse += '\n';
        }

        if (resources.length > 0) {
          aiResponse += `**📦 资源 (${resources.length}个)**\n\n`;
          resources.slice(0, 5).forEach((r: any, i: number) => {
            aiResponse += `${i + 1}. [${r.title}](/download?highlight=${r.id}) — ${r.description?.substring(0, 60) || ''}...\n`;
            results.push({ id: r.id, title: r.title, type: 'resource', link: `/download?highlight=${r.id}` });
          });
          aiResponse += '\n';
        }

        aiResponse += `---\n*以上结果来自站内搜索，点击标题可直接访问。*`;
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        results: results.length > 0 ? results : undefined,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      message.error('搜索失败，请稍后重试');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `抱歉，搜索"${query}"时出现异常，请稍后重试。`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Space>
          <RobotOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={2} style={{ margin: 0 }}>AI 搜索</Title>
        </Space>
      </div>

      <Card style={styles.chatCard}>
        <div style={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
              }}
            >
              <div style={styles.messageContent}>
                {msg.role === 'assistant' && (
                  <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                )}
                <pre style={styles.messageText}>{msg.content}</pre>
              </div>
              <Text type="secondary" style={styles.timestamp}>
                {msg.timestamp}
              </Text>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.message, ...styles.assistantMessage }}>
              <div style={styles.messageContent}>
                <LoadingOutlined style={{ marginRight: 8 }} />
                <Text>AI正在思考中...</Text>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            placeholder="输入你的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
          />
          <div style={styles.inputActions}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              按Shift+Enter换行，Enter发送
            </Text>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              disabled={!input.trim()}
            >
              发送
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#fff',
    borderRadius: 8,
    padding: 24,
    height: 'calc(100vh - 200px)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: 24,
  },
  chatCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 0 16px 0',
  },
  message: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  userMessage: {
    background: '#e6f7ff',
    marginLeft: 48,
  },
  assistantMessage: {
    background: '#f5f5f5',
    marginRight: 48,
  },
  messageContent: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  messageText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    lineHeight: 1.6,
  },
  timestamp: {
    display: 'block',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  },
  inputArea: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: 16,
  },
  textarea: {
    width: '100%',
    border: '1px solid #d9d9d9',
    borderRadius: 8,
    padding: '12px',
    resize: 'none',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  },
  inputActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
};

export default AISearch;
