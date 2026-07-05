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

      // 使用 Promise.allSettled 批量获取，提高性能
      const results = await Promise.allSettled(
        recent.map(item => articleApi.getPublishedArticle(item.id))
      );
      const loaded: Article[] = [];
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          loaded.push(r.value);
        }
      });
      setArticles(loaded);
    } catch (error) {
      message.error('加载历史记录失败');
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
    <div className="fade-in-up">
      <div className="page-card" style={{ padding: 0 }}>
        <div className="page-header" style={{ padding: '24px 24px 0' }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryOutlined style={{ color: '#1677ff' }} />
            浏览历史
          </Title>
          {articles.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={clearHistory} style={{ borderRadius: 8 }}>
              清除历史
            </Button>
          )}
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
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
                  <List.Item style={{ padding: '10px 0' }}>
                    <Link to={`/article/${article.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                      <Card 
                        hoverable 
                        style={{ width: '100%', borderRadius: 10 }} 
                        size="small"
                        styles={{ body: { padding: 16 } }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
                              {article.title}
                            </Text>
                            <div style={{ marginTop: 8 }}>
                              <Space size="middle">
                                {article.categoryName && (
                                  <Tag color="orange" style={{ borderRadius: 6, lineHeight: '20px' }}>{article.categoryName}</Tag>
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
                          <Button type="link" style={{ flexShrink: 0, fontWeight: 500 }}>
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
        </div>
      </div>
    </div>
  );
};

// 在文章详情页自动记录浏览历史
export function recordHistory(articleId: number) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history: HistoryItem[] = raw ? JSON.parse(raw) : [];
    
    const filtered = history.filter(item => item.id !== articleId);
    filtered.unshift({ id: articleId, viewedAt: new Date().toISOString() });
    
    const trimmed = filtered.slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // 忽略错误
  }
}

export default History;
