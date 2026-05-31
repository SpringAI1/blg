import { Card, Typography, Button, Space, App } from 'antd';
import { RobotOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect } from 'react';

const { Title, Text, Paragraph } = Typography;

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AISearch = () => {
  const { message } = App.useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: '你好！我是AI搜索助手。我可以帮助你：\n\n1. 回答技术问题\n2. 搜索相关资料\n3. 提供代码示例\n4. 解释概念\n\n有什么我可以帮助你的吗？',
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResponse = getMockAIResponse(input);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      message.error('AI响应失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getMockAIResponse = (question: string): string => {
    if (question.includes('java') || question.includes('Java')) {
      return `关于Java的问题，我来为你解答：

**Java是一种面向对象的编程语言，具有以下特点：**

1. **平台无关性**：通过JVM实现"一次编写，到处运行"

2. **面向对象**：支持封装、继承、多态三大特性

3. **自动内存管理**：垃圾回收机制

4. **丰富的生态系统**：
   - Spring框架
   - Hibernate
   - Maven/Gradle

**示例代码：**
\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

如果你想深入学习Java，可以从《Java核心技术》开始。有什么具体问题吗？`;
    }

    if (question.includes('python') || question.includes('Python')) {
      return `Python是一种高级编程语言，特别适合初学者入门：

**Python的特点：**

1. **简洁易学**：语法简洁，接近自然语言

2. **应用广泛**：
   - Web开发（Django、Flask）
   - 数据分析（Pandas、NumPy）
   - 机器学习（TensorFlow、PyTorch）
   - 自动化脚本

**示例代码：**
\`\`\`python
# Hello World
print("Hello, World!")

# 列表推导式
squares = [x**2 for x in range(10)]
\`\`\`

Python非常适合作为第一门编程语言！有什么想问的吗？`;
    }

    return `你问的是："${question}"

作为AI搜索助手，我可以帮你解答各类技术问题。不过我目前处于演示模式，无法访问真实的搜索结果。

**建议：**

1. 使用百度搜索获取最新信息
2. 访问CSDN等技术社区
3. 查阅官方文档

你可以尝试问我一些具体的技术问题，比如：
- Java/Python/React等语言问题
- 算法和数据结构
- 开源项目推荐

我会尽力用我的知识来帮助你！`;
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
