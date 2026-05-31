import { useEffect, useState } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Typography, 
  Empty, 
  Spin, 
  Row, 
  Col, 
  Button, 
  Avatar,
  Space,
  Divider
} from 'antd';
import { 
  EyeOutlined, 
  LikeOutlined, 
  RightOutlined, 
  ArrowRightOutlined,
  CodeOutlined,
  ExperimentOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Article } from '@/types';
import { articleApi } from '@/api/article';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchArticles = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await articleApi.getPublishedArticles(pageNum, 10);
      setArticles(data.records);
      setTotal(data.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1);
  }, []);

  // 资讯头条：使用真实文章的前4篇
  const newsItems = articles.slice(0, 4).map((article, index) => ({
    id: article.id,
    title: article.title,
    category: article.categoryName || '技术',
    image: article.coverImage || `https://picsum.photos/400/300?random=${index}`,
  }));

  // 开源项目：使用真实文章的第5-8篇
  const openSourceProjects = articles.slice(4, 8).map((article, index) => ({
    id: article.id,
    title: article.title,
    description: article.summary?.substring(0, 20) || '技术文章',
    author: article.username || '技术社区',
    avatar: article.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=project',
    icon: index % 3 === 0 ? <CodeOutlined style={{ fontSize: 24, color: '#1890ff' }} /> :
          index % 3 === 1 ? <ExperimentOutlined style={{ fontSize: 24, color: '#722ed1' }} /> :
          <FileTextOutlined style={{ fontSize: 24, color: '#a855f7' }} />,
  }));

  const communityRecommendations = [
    { name: '高通开发者中文社区', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qualcomm' },
    { name: 'NVIDIA QIDK开发者社区', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nvidia' },
    { name: 'HarmonyOS技术专区', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harmony' },
    { name: '笔贴开发者空间', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bietie' },
    { name: 'DAMO开发者矩阵', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=damo' },
    { name: 'LAVA社区', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lava' },
    { name: '融合社区', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fusion' },
  ];

  return (
    <Row gutter={24}>
      <Col span={17}>
        <div style={styles.contentSection}>
          <div style={styles.navTabs}>
            <Button type="primary" shape="round">全部</Button>
            <Button shape="round">资讯</Button>
            <Button shape="round">OpenClaw</Button>
            <Button shape="round">DeepSeek</Button>
            <Button shape="round">MCP</Button>
            <Button shape="round">运维</Button>
            <Button shape="round">操作系统</Button>
            <Button shape="round">人工智能</Button>
            <Button shape="round">Java</Button>
            <Button shape="round">MoonBit</Button>
            <Button shape="round">C++</Button>
            <Button shape="round">Python</Button>
          </div>

          <div style={styles.sectionHeader}>
            <Title level={4} style={{ margin: 0 }}>资讯头条</Title>
            <Button type="text" size="small">
              更多资讯 <RightOutlined />
            </Button>
          </div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            {newsItems.map((item, index) => (
              <Col span={6} key={index}>
                <Link to={`/article/${item.id}`} style={{ textDecoration: 'none' }}>
                  <Card hoverable style={styles.newsCard} cover={
                    <div style={styles.newsImage}>
                      <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  }>
                    <Paragraph ellipsis={{ rows: 2 }} style={styles.newsTitle}>{item.title}</Paragraph>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.category}</Text>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          <div style={styles.sectionHeader}>
            <Title level={4} style={{ margin: 0 }}>开源项目</Title>
            <Button type="text" size="small">
              更多开源项目 <RightOutlined />
            </Button>
          </div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            {openSourceProjects.map((project, index) => (
              <Col span={12} key={index}>
                <Link to={`/article/${project.id}`} style={{ textDecoration: 'none' }}>
                  <Card hoverable style={styles.projectCard}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={styles.projectIcon}>
                        {project.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>{project.title}</Text>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Tag color="purple">{project.description}</Tag>
                          <Button type="link" size="small">查看详情</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          <div style={styles.sectionHeader}>
            <Title level={4} style={{ margin: 0 }}>精选博客</Title>
            <Button type="text" size="small">
              排行榜 <ArrowRightOutlined />
            </Button>
          </div>

          {loading && articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" />
            </div>
          ) : articles.length === 0 ? (
            <Empty description="暂无文章" />
          ) : (
            <List
              dataSource={articles}
              renderItem={(article) => (
                <List.Item style={styles.articleItem}>
                  <Link to={`/article/${article.id}`} style={styles.articleLink}>
                    <div style={styles.articleContent}>
                      <div style={styles.articleMain}>
                        <Title level={4} style={styles.articleTitle}>{article.title}</Title>
                        <Paragraph ellipsis={{ rows: 2 }} style={styles.articleSummary}>
                          {(article.summary || (article.content ? article.content.substring(0, 150) : ''))}...
                        </Paragraph>
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
                                <Tag key={tag.id} color="blue" style={{ margin: 0 }}>{tag.name}</Tag>
                              ))}
                            </Space>
                          )}
                        </div>
                      </div>
                      {article.coverImage && (
                        <div style={styles.articleCover}>
                          <img src={article.coverImage} alt="" style={styles.coverImage} />
                        </div>
                      )}
                    </div>
                  </Link>
                </List.Item>
              )}
            />
          )}
        </div>
      </Col>

      <Col span={7}>
        <div style={styles.sidebar}>
          <Card title="推荐社区" extra={<Button type="link" size="small">查看更多</Button>}>
            <List
              dataSource={communityRecommendations}
              renderItem={(item) => (
                <List.Item style={{ padding: "8px 0" }}>
                  <Space>
                    <Avatar src={item.avatar} size="small" />
                    <Text>{item.name}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </Col>
    </Row>
  );
};

const styles: Record<string, React.CSSProperties> = {
  contentSection: {
    padding: 24,
    background: '#fff',
    borderRadius: 8,
  },
  navTabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newsCard: {
    cursor: 'pointer',
  },
  newsImage: {
    height: 120,
    overflow: 'hidden',
  },
  newsTitle: {
    marginBottom: 8,
    fontSize: 14,
  },
  projectCard: {
    cursor: 'pointer',
  },
  projectIcon: {
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
    borderRadius: 8,
  },
  articleItem: {
    padding: '16px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  articleLink: {
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
  },
  articleContent: {
    display: 'flex',
    gap: 16,
  },
  articleMain: {
    flex: 1,
  },
  articleTitle: {
    marginBottom: 8,
    fontSize: 16,
  },
  articleSummary: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  articleMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    color: '#999',
    fontSize: 12,
  },
  articleCover: {
    width: 160,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  sidebar: {
    position: 'sticky',
    top: 24,
  },
};

export default Home;
