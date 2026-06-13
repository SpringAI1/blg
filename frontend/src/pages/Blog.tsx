import { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Empty, Spin, Row, Col, Button, Select, Space, App, Pagination } from 'antd';
import { EyeOutlined, LikeOutlined, FileTextOutlined, DownloadOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Article } from '@/types';
import { articleApi } from '@/api/article';
import { categoryApi } from '@/api/category';
import { tagApi } from '@/api/tag';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Blog = () => {
  const { message } = App.useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('latest');

  const fetchArticles = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await articleApi.getPublishedArticles(pageNum, 10, selectedCategory || undefined, selectedTag || undefined);
      setArticles(data.records);
      setTotal(data.total);
      setPage(pageNum);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error) {
    }
  };

  const fetchTags = async () => {
    try {
      const data = await tagApi.getAllTags();
      setTags(data);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    fetchArticles(1);
  }, [selectedCategory, selectedTag, sortBy]);

  const handleDownload = (article: Article) => {
    if (!article.content) {
      message.warning('文章内容不可下载');
      return;
    }
    const content = `# ${article.title}\n\n作者: ${article.username || '未知'}\n时间: ${dayjs(article.createTime).format('YYYY-MM-DD')}\n\n---\n\n${article.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('下载成功！');
  };

  return (
    <div className="fade-in-up">
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>博客</Title>
            <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>发现优质技术文章</Text>
          </div>
          <Link to="/creator/articles/new">
            <Button type="primary" size="large" style={{ borderRadius: 8, height: 44, padding: '0 24px', fontWeight: 600 }}>
              <FileTextOutlined /> 写博客
            </Button>
          </Link>
        </div>

        <div style={styles.filters}>
          <Space wrap size={12}>
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: 150, borderRadius: 8 }}
              onChange={(value) => setSelectedCategory(value || null)}
              options={categories.map(c => ({ label: c.name, value: c.id }))}
            />
            <Select
              placeholder="选择标签"
              allowClear
              style={{ width: 150, borderRadius: 8 }}
              onChange={(value) => setSelectedTag(value || null)}
              options={tags.map(t => ({ label: t.name, value: t.id }))}
            />
            <Select
              value={sortBy}
              style={{ width: 120, borderRadius: 8 }}
              onChange={setSortBy}
              options={[
                { label: '最新发布', value: 'latest' },
                { label: '最多阅读', value: 'views' },
                { label: '最多点赞', value: 'likes' },
              ]}
            />
          </Space>
        </div>

        {loading && articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : articles.length === 0 ? (
          <Empty description="暂无博客文章" style={{ padding: 48 }} />
        ) : (
          <>
            <List
              dataSource={articles}
              renderItem={(article) => (
                <List.Item style={styles.articleItem}>
                  <Card 
                    hoverable 
                    style={{ width: '100%', borderRadius: 12, border: '1px solid var(--color-border-light)' }}
                    styles={{ body: { padding: 20 } }}
                  >
                    <div style={styles.articleContent}>
                      <div style={styles.articleMain}>
                        <Link to={`/article/${article.id}`}>
                          <Title level={4} style={{ ...styles.articleTitle, fontSize: 17, fontWeight: 600 }}>
                            {article.title}
                          </Title>
                        </Link>
                        <Text style={styles.articleSummary}>
                          {article.summary || (article.content ? article.content.substring(0, 200) : '')}...
                        </Text>
                        <div style={styles.articleMeta}>
                          <Space size={[16, 8]} wrap>
                            {article.categoryName && (
                              <Tag color="orange" style={{ borderRadius: 8, lineHeight: '22px' }}>
                                {article.categoryName}
                              </Tag>
                            )}
                            <span style={styles.metaItem}>
                              <UserOutlined style={{ marginRight: 4 }} />
                              {article.username || '匿名'}
                            </span>
                            <span style={styles.metaItem}>
                              <EyeOutlined style={{ marginRight: 4 }} /> {article.views}
                            </span>
                            <span style={styles.metaItem}>
                              <LikeOutlined style={{ marginRight: 4 }} /> {article.likes}
                            </span>
                            <span style={styles.metaItem}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {dayjs(article.createTime).format('YYYY-MM-DD')}
                            </span>
                          </Space>
                          {article.tags && article.tags.length > 0 && (
                            <Space size={[4, 8]} wrap style={{ marginTop: 8 }}>
                              {article.tags.map((tag) => (
                                <Tag key={tag.id} color="blue" style={{ borderRadius: 6, lineHeight: '20px' }}>{tag.name}</Tag>
                              ))}
                            </Space>
                          )}
                        </div>
                      </div>
                      {article.coverImage && (
                        <div style={styles.articleCover}>
                          <Link to={`/article/${article.id}`}>
                            <img src={article.coverImage} alt="" style={styles.coverImage} />
                          </Link>
                        </div>
                      )}
                      <div style={styles.articleActions}>
                        <Button 
                          icon={<DownloadOutlined />} 
                          onClick={() => handleDownload(article)}
                          style={{ borderRadius: 8 }}
                        >
                          下载
                        </Button>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={10}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 篇文章`}
                onChange={(pageNum) => fetchArticles(pageNum)}
                style={{ display: 'inline-block' }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 12,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  filters: {
    marginBottom: 24,
    padding: 16,
    background: '#fff',
    borderRadius: 10,
    border: '1px solid var(--color-border-light)',
    boxShadow: 'var(--shadow-sm)',
  },
  articleItem: {
    padding: '8px 0',
    border: 'none',
  },
  articleContent: {
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
  },
  articleMain: {
    flex: 1,
  },
  articleTitle: {
    marginBottom: 10,
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  articleSummary: {
    color: 'var(--color-text-secondary)',
    marginBottom: 12,
    display: 'block',
    fontSize: 14,
    lineHeight: 1.6,
  },
  articleMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  metaItem: {
    color: 'var(--color-text-tertiary)',
    fontSize: 13,
  },
  articleCover: {
    flexShrink: 0,
  },
  coverImage: {
    width: 160,
    height: 110,
    objectFit: 'cover',
    borderRadius: 10,
  },
  articleActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flexShrink: 0,
  },
};

export default Blog;
