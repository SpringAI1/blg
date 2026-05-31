import { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Empty, Spin, Row, Col, Button, Select, Space, App, Pagination } from 'antd';
import { EyeOutlined, LikeOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
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
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await tagApi.getAllTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
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
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ margin: 0 }}>博客</Title>
        <Link to="/admin/articles/new">
          <Button type="primary" size="large">
            <FileTextOutlined /> 写博客
          </Button>
        </Link>
      </div>

      <div style={styles.filters}>
        <Space wrap>
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setSelectedCategory(value || null)}
            options={categories.map(c => ({ label: c.name, value: c.id }))}
          />
          <Select
            placeholder="选择标签"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setSelectedTag(value || null)}
            options={tags.map(t => ({ label: t.name, value: t.id }))}
          />
          <Select
            value={sortBy}
            style={{ width: 120 }}
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
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : articles.length === 0 ? (
        <Empty description="暂无博客文章" />
      ) : (
        <>
        <List
          dataSource={articles}
          renderItem={(article) => (
            <List.Item style={styles.articleItem}>
              <div style={styles.articleContent}>
                <div style={styles.articleMain}>
                  <Link to={`/article/${article.id}`}>
                    <Title level={4} style={styles.articleTitle}>{article.title}</Title>
                  </Link>
                  <Text style={styles.articleSummary}>
                    {article.summary || (article.content ? article.content.substring(0, 200) : '')}...
                  </Text>
                  <div style={styles.articleMeta}>
                    <Space size="middle">
                      <span style={styles.metaItem}>
                        {article.categoryName}
                      </span>
                      <span style={styles.metaItem}>
                        <EyeOutlined /> {article.views}
                      </span>
                      <span style={styles.metaItem}>
                        <LikeOutlined /> {article.likes}
                      </span>
                      <span style={styles.metaItem}>
                        {dayjs(article.createTime).format('YYYY-MM-DD')}
                      </span>
                    </Space>
                    {article.tags && article.tags.length > 0 && (
                      <Space size={[0, 8]} wrap>
                        {article.tags.map((tag) => (
                          <Tag key={tag.id} color="blue">{tag.name}</Tag>
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
                  <Button icon={<DownloadOutlined />} onClick={() => handleDownload(article)}>
                    下载
                  </Button>
                </div>
              </div>
            </List.Item>
          )}
        />
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              total={total}
              pageSize={10}
              showSizeChanger={false}
              showTotal={(total) => `共 ${total} 篇文章`}
              onChange={(pageNum) => fetchArticles(pageNum)}
            />
          </div>
        </>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#fff',
    borderRadius: 8,
    padding: 24,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filters: {
    marginBottom: 24,
    padding: 16,
    background: '#f5f5f5',
    borderRadius: 8,
  },
  articleItem: {
    padding: '16px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  articleContent: {
    display: 'flex',
    gap: 20,
  },
  articleMain: {
    flex: 1,
  },
  articleTitle: {
    marginBottom: 12,
    color: '#1a1a1a',
    cursor: 'pointer',
  },
  articleSummary: {
    color: '#666',
    marginBottom: 12,
    display: 'block',
  },
  articleMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    color: '#999',
    fontSize: 13,
  },
  articleCover: {
    flexShrink: 0,
  },
  coverImage: {
    width: 160,
    height: 110,
    objectFit: 'cover',
    borderRadius: 8,
  },
  articleActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
};

export default Blog;
