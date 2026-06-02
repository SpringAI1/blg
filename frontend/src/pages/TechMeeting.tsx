import { useState, useEffect } from 'react';
import { Card, List, Typography, Tag, Empty, Spin, App, Space, Button, Row, Col, Avatar, Progress } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, UserOutlined, RightOutlined, ClockCircleOutlined, TeamOutlined, PlayCircleOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Article } from '@/types';
import { articleApi } from '@/api/article';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CATEGORY_IMAGES: Record<string, string> = {
  'Java': 'https://picsum.photos/seed/java/400/250',
  '前端': 'https://picsum.photos/seed/frontend/400/250',
  'Python': 'https://picsum.photos/seed/python/400/250',
  '数据库': 'https://picsum.photos/seed/database/400/250',
  'DevOps': 'https://picsum.photos/seed/devops/400/250',
  '人工智能': 'https://picsum.photos/seed/ai/400/250',
  'default': 'https://picsum.photos/seed/tech/400/250',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Java': '#1890ff',
  '前端': '#52c41a',
  'Python': '#fa541c',
  '数据库': '#faad14',
  'DevOps': '#13c2c2',
  '人工智能': '#722ed1',
};

const TechMeeting = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articleApi.getPublishedArticles(1, 50);
      setArticles(data.records || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      message.error('加载技术会议数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getImage = (article: Article) => {
    if (article.coverImage) return article.coverImage;
    return CATEGORY_IMAGES[article.categoryName || ''] || CATEGORY_IMAGES.default;
  };

  const getColor = (article: Article) => {
    return CATEGORY_COLORS[article.categoryName || ''] || '#1890ff';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.banner}>
        <CalendarOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
        <Title level={2} style={{ color: '#fff', margin: 0 }}>技术会议</Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 8, display: 'block' }}>
          精选技术大会实录、专题演讲和前沿技术分享
        </Text>
      </div>

      {articles.length === 0 ? (
        <Empty description="暂无技术会议内容" style={{ padding: 48 }} />
      ) : (
        <Row gutter={[20, 20]}>
          {articles.map((article) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={article.id}>
              <Card
                hoverable
                style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
                cover={
                  <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={getImage(article)}
                      alt={article.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CATEGORY_IMAGES.default;
                      }}
                    />
                    {article.isTop && (
                      <Tag color="red" style={{ position: 'absolute', top: 12, left: 12, borderRadius: 8 }}>
                        热门
                      </Tag>
                    )}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      padding: '12px 16px',
                    }}>
                      <Tag color={getColor(article)} style={{ borderRadius: 8 }}>
                        {article.categoryName || '技术'}
                      </Tag>
                    </div>
                  </div>
                }
                onClick={() => navigate(`/article/${article.id}`)}
              >
                <Title level={5} style={{ margin: '0 0 8px', color: '#1a1a1a', lineHeight: 1.4 }}>
                  {article.title}
                </Title>
                <Space style={{ marginBottom: 8 }} size={4} wrap>
                  <Avatar size={20} icon={<UserOutlined />} src={article.userAvatar} />
                  <Text type="secondary" style={{ fontSize: 12 }}>{article.username}</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12, lineHeight: 1.5 }}>
                  {article.summary || (article.content?.substring(0, 80) || '')}...
                </Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                  <Space size={16}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <EyeOutlined style={{ marginRight: 4 }} />
                      {article.views?.toLocaleString()}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <LikeOutlined style={{ marginRight: 4 }} />
                      {article.likes}
                    </Text>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(article.createTime).format('MM-DD')}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link to="/blog">
          <Button type="primary" size="large" icon={<RightOutlined />}>
            查看全部会议
          </Button>
        </Link>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100%' },
  banner: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    borderRadius: 12, padding: '40px 32px', marginBottom: 24, textAlign: 'center',
  },
};

export default TechMeeting;
