import { useState } from 'react';
import { Card, List, Typography, Button, Input, Space, Tag, App, Spin, Empty, Divider } from 'antd';
import { SearchOutlined, RobotOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { searchApi } from '@/api/search';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface ArticleResult {
  id: number;
  title: string;
  summary: string;
  coverImage: string;
  views: number;
  likes: number;
  type: string;
  createTime: string;
}

interface ResourceResult {
  id: number;
  title: string;
  description: string;
  icon: string;
  downloadCount: number;
  type: string;
  createTime: string;
}

const Search = () => {
  const { message } = App.useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<ArticleResult[]>([]);
  const [resources, setResources] = useState<ResourceResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await searchApi.searchAll(query);
      setArticles(response?.articles || []);
      setResources(response?.resources || []);
      
      if ((response?.articles?.length || 0) === 0 && (response?.resources?.length || 0) === 0) {
        message.info('未找到相关内容');
      }
    } catch (error) {
      console.error('Search failed:', error);
      message.error('搜索失败，请稍后重试');
      setArticles([]);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBaiduSearch = () => {
    if (!query.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }
    window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, '_blank');
  };

  const handleAISearch = () => {
    if (!query.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }
    navigate(`/ai-search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchSection}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          搜索
        </Title>
        <div style={styles.searchBox}>
          <Input
            size="large"
            placeholder="输入关键词搜索文章、资源..."
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={handleSearch}
            style={{ flex: 1 }}
          />
          <Button type="primary" size="large" onClick={handleSearch}>
            本站搜索
          </Button>
          <Button size="large" onClick={handleBaiduSearch}>
            百度搜索
          </Button>
          <Button size="large" icon={<RobotOutlined />} onClick={handleAISearch}>
            AI 搜索
          </Button>
        </div>

        <div style={styles.hints}>
          <Text type="secondary">热门搜索：</Text>
          <Space>
            {['Spring Boot', 'Java', 'Python', 'React', 'Vue', 'Docker'].map((keyword) => (
              <Tag
                key={keyword}
                color="blue"
                style={{ cursor: 'pointer', padding: '4px 12px' }}
                onClick={() => {
                  setQuery(keyword);
                  setTimeout(() => handleSearch(), 0);
                }}
              >
                {keyword}
              </Tag>
            ))}
          </Space>
        </div>
      </div>

      <div style={styles.resultsSection}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" tip="搜索中..." />
          </div>
        ) : hasSearched && articles.length === 0 && resources.length === 0 ? (
          <Empty description="未找到相关内容，请尝试其他关键词" />
        ) : (
          <>
            {articles.length > 0 && (
              <>
                <Divider orientation="left">
                  <Space>
                    <FileTextOutlined />
                    <Text strong>文章资源 ({articles.length})</Text>
                  </Space>
                </Divider>
                <List
                  dataSource={articles}
                  renderItem={(item) => (
                    <List.Item style={styles.resultItem}>
                      <Link to={`/article/${item.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                        <Card hoverable style={{ width: '100%' }}>
                          <div style={{ display: 'flex', gap: 16 }}>
                            {item.coverImage && (
                              <div style={{ flexShrink: 0 }}>
                                <img 
                                  src={item.coverImage} 
                                  alt="" 
                                  style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 8 }}
                                />
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <Title level={4} style={{ color: '#1a1a1a', marginBottom: 8 }}>
                                {item.title}
                              </Title>
                              <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666', marginBottom: 12 }}>
                                {item.summary}
                              </Paragraph>
                              <Space>
                                <Tag color="blue">文章</Tag>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  <FileTextOutlined style={{ marginRight: 4 }} />
                                  阅读 {item.views}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  <SearchOutlined style={{ marginRight: 4 }} />
                                  点赞 {item.likes}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  {dayjs(item.createTime).format('YYYY-MM-DD')}
                                </Text>
                              </Space>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </List.Item>
                  )}
                />
              </>
            )}

            {resources.length > 0 && (
              <>
                <Divider orientation="left">
                  <Space>
                    <DownloadOutlined />
                    <Text strong>下载资源 ({resources.length})</Text>
                  </Space>
                </Divider>
                <List
                  dataSource={resources}
                  renderItem={(item) => (
                    <List.Item style={styles.resultItem}>
                      <Link to={`/download`} style={{ width: '100%', textDecoration: 'none' }}>
                        <Card hoverable style={{ width: '100%' }}>
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ 
                              width: 64, 
                              height: 64, 
                              background: '#f0f0f0', 
                              borderRadius: 8, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: 28
                            }}>
                              {item.icon || '📁'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <Title level={4} style={{ color: '#1a1a1a', marginBottom: 8 }}>
                                {item.title}
                              </Title>
                              <Paragraph ellipsis={{ rows: 1 }} style={{ color: '#666', marginBottom: 12 }}>
                                {item.description}
                              </Paragraph>
                              <Space>
                                <Tag color="green">资源</Tag>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  <DownloadOutlined style={{ marginRight: 4 }} />
                                  下载 {item.downloadCount}
                                </Text>
                              </Space>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </List.Item>
                  )}
                />
              </>
            )}

            {!hasSearched && (
              <div style={styles.emptyState}>
                <SearchOutlined style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
                <Text type="secondary">输入关键词开始搜索</Text>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#fff',
    borderRadius: 8,
    padding: 24,
  },
  searchSection: {
    marginBottom: 32,
  },
  searchBox: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
  },
  hints: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  resultsSection: {
    minHeight: 300,
  },
  resultItem: {
    padding: '8px 0',
  },
  emptyState: {
    textAlign: 'center',
    padding: 80,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

export default Search;
