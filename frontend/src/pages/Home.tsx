import { message } from 'antd';
import { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, Empty, Spin, Row, Col, Button } from 'antd';
import { EyeOutlined, RightOutlined, ArrowRightOutlined, CodeOutlined, FileTextOutlined, FireOutlined, MessageOutlined, ClockCircleOutlined, LikeOutlined, StarOutlined, UserOutlined, RocketOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Article } from '@/types';
import { articleApi } from '@/api/article';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

/** 根据分类名返回占位图片（内联 SVG，不依赖外部服务） */
const getCategoryImage = (cat?: string): string => {
  const colors: Record<string, [string, string]> = {
    'Java': ['#ff6b00', '#ff8c38'],
    '前端': ['#1677ff', '#4096ff'],
    'Python': ['#52c41a', '#73d13d'],
    '数据库': ['#722ed1', '#9254de'],
    'DevOps': ['#13c2c2', '#36cfc9'],
    '人工智能': ['#eb2f96', '#f759ab'],
  };
  const [c1, c2] = colors[cat || ''] || ['#667eea', '#764ba2'];
  const label = cat || '技术';
  // 生成内联 SVG 占位图 — 始终可用，无网络依赖
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient></defs>
    <rect width="400" height="250" fill="url(#g)"/>
    <text x="200" y="130" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="22" font-weight="700" font-family="sans-serif">${label}</text>
    <text x="200" y="158" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="13" font-family="sans-serif">技术博客</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articleApi.getPublishedArticles(1, 12);
      setArticles(data.records || []);
    } catch (error) {
      message.error('加载文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const topArticles = articles.slice(0, 4);
  const subArticles = articles.slice(4, 8);
  const listArticles = articles.slice(8, 16);

  return (
    <div className="fade-in-up">
      {/* 顶部横幅 */}
      <Card 
        className="banner-card"
        style={{ 
          borderRadius: 16, 
          marginBottom: 28, 
          border: 'none', 
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #f8f9ff 0%, #fff5f5 50%, #f0f4ff 100%)',
        }}
      >        
        <div style={{ padding: '44px 32px', color: '#1a1a2e', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,107,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RocketOutlined style={{ fontSize: 16, color: '#ff6b00' }} />
            </div>
            <Text style={{ color: '#ff6b00', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>技术社区 · 探索无限</Text>
          </div>
          <Title level={1} style={{ color: '#1a1a2e', margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>
            欢迎来到技术博客
          </Title>
          <Text style={{ color: '#555770', fontSize: 16, display: 'block', marginTop: 10, lineHeight: 1.6, fontWeight: 400 }}>
            发现最新技术文章、开源项目和开发资源
          </Text>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <Link to="/blog">
              <Button 
                type="primary" 
                size="large" 
                style={{ 
                  borderRadius: 10,
                  height: 46,
                  padding: '0 30px',
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: '0 4px 15px rgba(255,107,0,0.25)',
                }}
              >
                浏览博客
              </Button>
            </Link>
            <Link to="/creator/articles/new">
              <Button 
                size="large" 
                style={{ 
                  borderRadius: 10,
                  height: 46,
                  padding: '0 30px',
                  fontWeight: 600,
                  fontSize: 15,
                  borderColor: '#d9d9d9',
                  color: '#555770',
                }}
              >
                开始写作
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 热门文章 — 大图卡片 */}
      <Card
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            热门文章
          </span>
        }
        extra={<Link to="/blog" style={{ fontSize: 13 }}>更多 <RightOutlined /></Link>}
        style={{ borderRadius: 12, marginBottom: 24, border: '1px solid var(--color-border-light)' }}
      >
        <Row gutter={[16, 16]}>
          {topArticles.map((article, idx) => (
            <Col xs={24} sm={12} lg={6} key={article.id}>
              <Link to={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border-light)' }}
                  styles={{ body: { padding: 16 } }}
                  cover={
                    <div style={{ height: 160, overflow: 'hidden', position: 'relative', background: '#f5f5f5' }}>
                      <img
                        src={article.coverImage || getCategoryImage(article.categoryName)}
                        alt={article.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = getCategoryImage(); }}
                      />
                      {idx === 0 && (
                        <div style={{ position: 'absolute', top: 10, left: 10, background: '#ff4d4f', color: '#fff', padding: '2px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>HOT</div>
                      )}
                      {article.isTop && (
                        <div style={{ position: 'absolute', top: 10, right: 10, background: '#faad14', color: '#fff', padding: '2px 12px', borderRadius: 20, fontSize: 11 }}>置顶</div>
                      )}
                    </div>
                  }
                >
                  <Title level={5} style={{ margin: 0, fontSize: 14, lineHeight: 1.4, color: 'var(--color-text-primary)' }} ellipsis={{ rows: 2 }}>
                    {article.title}
                  </Title>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="orange" style={{ fontSize: 10, borderRadius: 8, padding: '0 8px', lineHeight: '20px' }}>{article.categoryName || '技术'}</Tag>
                    <Text type="secondary" style={{ fontSize: 11 }}><EyeOutlined /> {article.views?.toLocaleString()}</Text>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 推荐文章 + 侧边栏布局 */}
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* 文章列表 */}
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                <FileTextOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                精选博客
              </span>
            }
            extra={<Link to="/blog" style={{ fontSize: 13 }}>全部文章 <ArrowRightOutlined /></Link>}
            style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
            ) : articles.length === 0 ? (
              <Empty description="暂无文章" />
            ) : (
              <List
                dataSource={listArticles}
                renderItem={(article) => (
                  <List.Item style={{ padding: '20px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', gap: 20, width: '100%' }}>
                      <Link to={`/article/${article.id}`} style={{ flexShrink: 0 }}>
                        <img
                          src={article.coverImage || getCategoryImage(article.categoryName)}
                          alt=""
                          style={{ width: 200, height: 130, objectFit: 'cover', borderRadius: 10 }}
                          onError={(e) => { (e.target as HTMLImageElement).src = getCategoryImage(); }}
                        />
                      </Link>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <Link to={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
                            <Title level={4} style={{ margin: 0, fontSize: 17, color: 'var(--color-text-primary)', fontWeight: 600, lineHeight: 1.4 }}>
                              {article.title}
                            </Title>
                          </Link>
                          <Paragraph ellipsis={{ rows: 2 }} style={{ margin: '10px 0', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                            {article.summary || (article.content?.substring(0, 120) || '')}
                          </Paragraph>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          {article.categoryName && <Tag color="orange" style={{ borderRadius: 8, fontSize: 11, lineHeight: '22px' }}>{article.categoryName}</Tag>}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <UserOutlined style={{ marginRight: 4 }} />{article.username || '匿名'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EyeOutlined style={{ marginRight: 4 }} />{article.views?.toLocaleString()}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <LikeOutlined style={{ marginRight: 4 }} />{article.likes}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <MessageOutlined style={{ marginRight: 4 }} />{article.commentCount || 0}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />{dayjs(article.createTime).format('MM-DD')}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* 右侧边栏 */}
        <Col xs={24} lg={8}>
          {/* 分类快速入口 */}
          <Card 
            title={<span style={{ fontSize: 15, fontWeight: 600 }}><CodeOutlined style={{ marginRight: 8 }} />分类</span>} 
            style={{ borderRadius: 12, marginBottom: 16, border: '1px solid var(--color-border-light)' }}
          >
            <Row gutter={[8, 8]}>
              {['Java', '前端', 'Python', '数据库', 'DevOps', '人工智能'].map(cat => (
                <Col span={12} key={cat}>
                  <Link to={`/blog?category=${cat}`}>
                    <Button 
                      block 
                      style={{ 
                        textAlign: 'left', 
                        borderRadius: 8, 
                        border: '1px solid var(--color-border-light)',
                        color: 'var(--color-text-secondary)',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-light)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                    >
                      {cat}
                    </Button>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 推荐项目 */}
          <Card 
            title={<span style={{ fontSize: 15, fontWeight: 600 }}><StarOutlined style={{ marginRight: 8 }} />推荐项目</span>} 
            style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}
          >
            <List
              dataSource={subArticles}
              renderItem={(article) => (
                <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <Link to={`/article/${article.id}`} style={{ textDecoration: 'none', width: '100%', display: 'flex', gap: 12 }}>
                    <img
                      src={article.coverImage || getCategoryImage(article.categoryName)}
                      alt=""
                      style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).src = getCategoryImage(); }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ fontSize: 13, color: 'var(--color-text-primary)', display: 'block' }} ellipsis>{article.title}</Text>
                      <div style={{ marginTop: 6 }}>
                        <Tag color="orange" style={{ fontSize: 10, borderRadius: 6, lineHeight: '20px' }}>{article.categoryName || '技术'}</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}><EyeOutlined /> {article.views?.toLocaleString()}</Text>
                    </div>
                  </Link>
                </List.Item>
              )}
            />
          </Card>

          {/* 快速链接 */}
          <Card title={<span style={{ fontSize: 15, fontWeight: 600 }}>快速入口</span>} style={{ borderRadius: 12, marginTop: 16, border: '1px solid var(--color-border-light)' }}>
            <Row gutter={[8, 8]}>
              <Col span={12}><Link to="/study"><Button block icon={<FileTextOutlined />} style={{ borderRadius: 8, fontWeight: 500 }}>学习中心</Button></Link></Col>
              <Col span={12}><Link to="/download"><Button block icon={<CodeOutlined />} style={{ borderRadius: 8, fontWeight: 500 }}>下载中心</Button></Link></Col>
              <Col span={12}><Link to="/community"><Button block icon={<FireOutlined />} style={{ borderRadius: 8, fontWeight: 500 }}>社区</Button></Link></Col>
              <Col span={12}><Link to="/ai-search"><Button block icon={<StarOutlined />} style={{ borderRadius: 8, fontWeight: 500 }}>AI 搜索</Button></Link></Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
