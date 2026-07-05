import { useEffect, useState } from 'react';
import { Card, List, Typography, Button, Input, Space, Tag, App, Spin, Empty, Divider, Avatar } from 'antd';
import { SearchOutlined, RobotOutlined, FileTextOutlined, DownloadOutlined, UserOutlined, TagOutlined } from '@ant-design/icons';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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

interface SearchResultData {
  articles: ArticleResult[];
  resources: ResourceResult[];
  articleTotal: number;
  resourceTotal: number;
}

const Search = () => {
  const { message } = App.useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<ArticleResult[]>([]);
  const [resources, setResources] = useState<ResourceResult[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const runSearch = async (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      message.warning('请输入搜索关键词');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await searchApi.searchAll(trimmedKeyword);
      setArticles(response?.articles || []);
      setResources(response?.resources || []);
      setUsers(response?.users || []);
      setTags(response?.tags || []);

      if ((response?.articles?.length || 0) === 0 && (response?.resources?.length || 0) === 0 &&
          (response?.users?.length || 0) === 0 && (response?.tags?.length || 0) === 0) {
        message.info('未找到相关内容');
      }
    } catch (error) {
      message.error('搜索失败，请稍后重试');
      setArticles([]);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const keyword = searchParams.get('keyword') || searchParams.get('q') || '';
    if (keyword) {
      setQuery(keyword);
      runSearch(keyword);
    }
  }, [searchParams]);

  const handleSearch = async () => {
    await runSearch(query);
  };

  /** 搜索关键词高亮 — 将匹配词用黄色标记包裹 */
  const highlightKeyword = (text: string | null | undefined, keyword: string): React.ReactNode => {
    if (!text || !keyword) return text;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase()
        ? <mark key={i} style={{ background: '#fff3cd', padding: '0 2px', borderRadius: 2, color: 'inherit' }}>{part}</mark>
        : part
    );
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
                  runSearch(keyword);
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
            <Spin size="large" />
          </div>
        ) : hasSearched && articles.length === 0 && resources.length === 0 && users.length === 0 && tags.length === 0 ? (
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
                                {highlightKeyword(item.title, query)}
                              </Title>
                              <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666', marginBottom: 12 }}>
                                {highlightKeyword(item.summary, query)}
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
                      <Link to={`/download?highlight=${item.id}`} style={{ width: '100%', textDecoration: 'none' }}>
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
                                {highlightKeyword(item.title, query)}
                              </Title>
                              <Paragraph ellipsis={{ rows: 1 }} style={{ color: '#666', marginBottom: 12 }}>
                                {highlightKeyword(item.description, query)}
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

            {users.length > 0 && (
              <>
                <Divider orientation="left">
                  <Space>
                    <UserOutlined />
                    <Text strong>相关用户 ({users.length})</Text>
                  </Space>
                </Divider>
                <List
                  dataSource={users}
                  renderItem={(item: any) => (
                    <List.Item>
                      <Link to={`/user/${item.id}`} style={{ textDecoration: 'none' }}>
                        <Card hoverable size="small" style={{ width: '100%' }}>
                          <Space>
                            <Avatar src={item.avatar} icon={<UserOutlined />} />
                            <div>
                              <Text strong>{item.nickname || item.username}</Text>
                              <Text type="secondary"> @{item.username}</Text>
                              {item.bio && <div><Text type="secondary">{item.bio}</Text></div>}
                            </div>
                          </Space>
                        </Card>
                      </Link>
                    </List.Item>
                  )}
                />
              </>
            )}

            {tags.length > 0 && (
              <>
                <Divider orientation="left">
                  <Space>
                    <TagOutlined />
                    <Text strong>相关标签 ({tags.length})</Text>
                  </Space>
                </Divider>
                <Space wrap>
                  {tags.map((tag: any) => (
                    <Tag
                      key={tag.id}
                      color="blue"
                      style={{ cursor: 'pointer', padding: '4px 16px', fontSize: 14 }}
                      onClick={() => {
                        setQuery(tag.name);
                        runSearch(tag.name);
                      }}
                    >
                      {tag.name}
                    </Tag>
                  ))}
                </Space>
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
