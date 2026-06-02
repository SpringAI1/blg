import { useState, useEffect } from 'react';
import { Card, List, Typography, Tag, Empty, Spin, App, Space, Button } from 'antd';
import { HistoryOutlined, EyeOutlined, LikeOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Article } from '@/types';
import { articleApi } from '@/api/article';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const HISTORY_KEY = 'article_history';

interface HistoryItem {
  id: number;
  viewedAt: string;
}

const History = () => {
  const { message } = App.useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // 从 localStorage 读取浏览记录
      const raw = localStorage.getItem(HISTORY_KEY);
      const history: HistoryItem[] = raw ? JSON.parse(raw) : [];
      
      if (history.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      // 按浏览时间倒序取最近 20 条
      const recent = history.sort((a, b) => 
        new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
      ).slice(0, 20);

      // 批量获取文章详情
      const results: Article[] = [];
      for (const item of recent) {
        try {
          const article = await articleApi.getPublishedArticle(item.id);
          if (article) results.push(article);
        } catch {
          // 文章可能已被删除，跳过
        }
      }
      setArticles(results);
    } catch (error) {
      console.error('加载浏览历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setArticles([]);
    message.success('浏览历史已清除');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ margin: 0 }}>
          <HistoryOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          浏览历史
        </Title>
        {articles.length > 0 && (
          <Button danger icon={<DeleteOutlined />} onClick={clearHistory}>
            清除历史
          </Button>
        )}
      </div>

      <Card>
        <Spin spinning={loading}>
          {articles.length === 0 ? (
            <Empty 
              description="暂无浏览历史" 
              style={{ padding: 48 }}
            >
              <Text type="secondary">去博客页面阅读文章，浏览记录将自动保存在这里</Text>
            </Empty>
          ) : (
            <List
              dataSource={articles}
              renderItem={(article) => (
                <List.Item style={styles.listItem}>
                  <Link to={`/article/${article.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                    <Card hoverable style={{ width: '100%' }} size="small">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: 15, color: '#1a1a1a' }}>
                            {article.title}
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            <Space size="middle">
                              {article.categoryName && (
                                <Tag color="blue" style={{ borderRadius: 8 }}>{article.categoryName}</Tag>
                              )}
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <EyeOutlined style={{ marginRight: 4 }} />
                                {article.views}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <LikeOutlined style={{ marginRight: 4 }} />
                                {article.likes}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {dayjs(article.createTime).format('MM-DD HH:mm')}
                              </Text>
                            </Space>
                          </div>
                        </div>
                        <Button type="link" style={{ flexShrink: 0 }}>
                          再次阅读
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

// 在文章详情页自动记录浏览历史
export function recordHistory(articleId: number) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history: HistoryItem[] = raw ? JSON.parse(raw) : [];
    
    // 移除已有记录（避免重复）
    const filtered = history.filter(item => item.id !== articleId);
    
    // 添加新记录
    filtered.unshift({ id: articleId, viewedAt: new Date().toISOString() });
    
    // 只保留最近 100 条
    const trimmed = filtered.slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // 忽略错误
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: { background: '#fff', borderRadius: 8, padding: 24 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  listItem: { padding: '8px 0' },
};

export default History;
