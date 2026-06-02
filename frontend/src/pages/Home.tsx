import { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, Empty, Spin, Row, Col, Button, Avatar, Input, Badge } from 'antd';
import { EyeOutlined, RightOutlined, ArrowRightOutlined, CodeOutlined, FileTextOutlined, FireOutlined, TeamOutlined, SearchOutlined, PlusOutlined, BellOutlined, UserOutlined, BookOutlined, DownloadOutlined, StarOutlined, ClockCircleOutlined, MessageOutlined, HistoryOutlined, CrownOutlined, SettingOutlined, CloudOutlined, StarFilled, FlagOutlined, LaptopOutlined, MonitorOutlined, PictureOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Article } from '@/types';
import { articleApi } from '@/api/article';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articleApi.getPublishedArticles(1, 15);
      setArticles(data.records);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategoryImage = (categoryName?: string): string => {
    const map: Record<string, string> = {
      'Java': 'https://picsum.photos/seed/javacode/400/300',
      '前端': 'https://picsum.photos/seed/frontendui/400/300',
      'Python': 'https://picsum.photos/seed/pycode/400/300',
      '数据库': 'https://picsum.photos/seed/database/400/300',
      'DevOps': 'https://picsum.photos/seed/devops/400/300',
      '人工智能': 'https://picsum.photos/seed/aitech/400/300',
    };
    return map[categoryName || ''] || `https://picsum.photos/seed/tech/${400 + (Math.random() * 100 | 0)}/300`;
  };

  const newsItems = articles.slice(0, 4).map((article) => ({
    id: article.id,
    title: article.title,
    image: article.coverImage || getCategoryImage(article.categoryName),
  }));

  const newsHeadlines = articles.slice(4, 9).map((article) => ({
    id: article.id,
    title: article.title,
    category: article.categoryName,
  }));

  const openSourceProjects = [
    { id: 1, name: 'AtomCode', desc: '开源代码编辑器', lang: 'Rust', img: 'https://picsum.photos/seed/rustcode/400/250' },
    { id: 2, name: 'CANN学习Hub', desc: 'AI模型开发与部署的学习资源集合', lang: 'Jupyter Notebook', img: 'https://picsum.photos/seed/aihub/400/250' },
    { id: 3, name: 'BitCPM-CANN-8B', desc: '开源8B大模型，CANN优化适配', lang: '文本生成', img: 'https://picsum.photos/seed/llm/400/250' },
    { id: 4, name: '开源技能学习平台', desc: '一站式管理与提升个人技能', lang: 'Python', img: 'https://picsum.photos/seed/learn/400/250' },
  ];

  const communityRecommendations = [
    { name: '高通开发者中文社区', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qcom', members: '12.5K', hot: true },
    { name: 'HarmonyOS开发者社区', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harmony', members: '23.4K', hot: true },
    { name: 'NVIDIA AI技术专区', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nvidia', members: '9.8K' },
    { name: 'Java技术交流圈', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=java', members: '45.6K', hot: true },
    { name: 'Python爱好者社区', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=python', members: '38.9K' },
    { name: '前端开发联盟', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frontend', members: '29.8K' },
  ];

  const handleNavClick = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else if (path === '/compute' || path === '/models' || path === '/atomgit' || path === '/conference') {
      window.open('https://www.baidu.com', '_blank');
    } else {
      navigate(path);
    }
  };

  const sideNavItems = [
    { icon: <FileTextOutlined />, label: '博客', path: '/blog' },
    { icon: <DownloadOutlined />, label: '下载', path: '/download' },
    { icon: <BookOutlined />, label: '学习', path: '/study' },
    { icon: <TeamOutlined />, label: '社区', path: '/community' },
    { icon: <PictureOutlined />, label: '模型市场', path: '/models', badge: '官方5折' },
    { icon: <SearchOutlined />, label: 'AI搜索', path: '/ai-search' },
    { icon: <CloudOutlined />, label: 'AtomGit', path: '/atomgit' },
    { icon: <FolderOpenOutlined />, label: '技术会议', path: '/conference' },
    { icon: <StarFilled />, label: '订阅', path: '/subscribe' },
    { icon: <StarOutlined />, label: '关注', path: '/follow' },
    { icon: <FlagOutlined />, label: '收藏', path: '/favorites' },
    { icon: <HistoryOutlined />, label: '历史', path: '/favorites' },
    { icon: <CrownOutlined />, label: '会员中心', path: '/login' },
    { icon: <SettingOutlined />, label: '创作中心', path: '/admin/articles/new' },
    { icon: <CloudOutlined />, label: '我的算力', path: '/compute', badge: '超值低价' },
  ];

  const topCategories = ['全部', '资讯', 'OpenClaw', 'DeepSeek', 'MCP', '运维', '操作系统', '人工智能', 'Java', 'MoonBit', 'C++', 'Python'];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{ background: '#ffffff', padding: '0 24px', borderBottom: '2px solid #ff6b00', position: 'sticky', top: 0, zIndex: 100, height: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 'bold', color: '#ff6b00' }}>
              <LaptopOutlined />
              <span>技术博客</span>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {['首页', '博客', '下载', '学习', '社区'].map(item => (
                <Link key={item} to={item === '首页' ? '/' : `/${item.toLowerCase()}`} style={{ color: '#333', textDecoration: 'none', fontSize: 14, fontWeight: item === '首页' ? 600 : 400, paddingBottom: 4, borderBottom: item === '首页' ? '2px solid #ff6b00' : 'none' }}>
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 24, padding: '6px 16px', width: 400 }}>
              <SearchOutlined style={{ color: '#999', marginRight: 8 }} />
              <Input placeholder="二叉排序树" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onPressEnter={handleSearch} style={{ border: 'none', background: 'transparent', flex: 1 }} />
              <Button type="primary" onClick={handleSearch} style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 20, marginLeft: 8 }}>搜索</Button>
              <Button type="default" style={{ borderRadius: 20, marginLeft: 8 }}>AI搜索</Button>
            </div>

            <Badge dot><BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} /></Badge>
            <span style={{ color: '#999', fontSize: 14 }}>会员中心</span>
            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#ff6b00', borderColor: '#ff6b00', borderRadius: 20 }}>创作</Button>
            <Avatar icon={<UserOutlined />} />
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
        <aside style={{ width: 160, background: '#ffffff', minHeight: 'calc(100vh - 56px)', padding: '16px 0', position: 'sticky', top: 56 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', padding: '12px 16px', borderRadius: 8, background: '#ff6b00', margin: '0 8px 8px', color: 'white', fontWeight: 500 }}>
            <BookOutlined />
            <span>首页</span>
          </Link>
          {sideNavItems.map((item, index) => (
            <div key={index} onClick={() => handleNavClick(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', color: '#666', padding: '10px 16px', borderRadius: 8, margin: '0 8px', transition: 'all 0.2s' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f0f0f0'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge && <Badge status="error" text={item.badge} style={{ fontSize: 10 }} />}
            </div>
          ))}
        </aside>

        <main style={{ flex: 1, padding: '20px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {topCategories.map((item, idx) => (
              <Button key={item} type={idx === 0 ? 'primary' : 'default'} size="small" style={{ borderRadius: 16, backgroundColor: idx === 0 ? '#ff6b00' : '#fff', borderColor: idx === 0 ? '#ff6b00' : '#e0e0e0', color: idx === 0 ? '#fff' : '#666', borderWidth: idx === 0 ? 0 : 1 }}>
                {item}
              </Button>
            ))}
          </div>

          <Card style={{ borderRadius: 8, border: 'none', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FireOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                <Title level={4} style={{ margin: 0, fontWeight: 600 }}>资讯头条</Title>
              </div>
              <Button type="text" size="small" style={{ color: '#999' }}>更多资讯 <RightOutlined /></Button>
            </div>

            <Row gutter={[16, 16]}>
              {newsItems.map((item, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Link to={`/article/${item.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 200 }}>
                      <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {index === 0 && (<div style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)', color: 'white', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600 }}>热门</div>)}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '16px' }}>
                        <Text style={{ color: 'white', fontSize: 13, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</Text>
                      </div>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #e0e0e0' }}>
              <List dataSource={newsHeadlines} renderItem={(item, index) => (<List.Item style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#ff6b00', fontSize: 12, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{index + 1}</span>
                <Link to={`/article/${item.id}`} style={{ flex: 1, textDecoration: 'none', color: '#333', fontSize: 14 }}>{item.title}</Link>
                <Tag style={{ fontSize: 11, borderRadius: 10 }}>{item.category}</Tag>
              </List.Item>)} />
            </div>
          </Card>

          <Card style={{ borderRadius: 8, border: 'none', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CodeOutlined style={{ color: '#722ed1', fontSize: 18 }} />
                <Title level={4} style={{ margin: 0, fontWeight: 600 }}>开源项目</Title>
              </div>
              <Button type="text" size="small" style={{ color: '#999' }}>更多开源项目 <RightOutlined /></Button>
            </div>

            <Row gutter={[16, 16]}>
              {openSourceProjects.map((project, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Link to={`/article/${project.id}`} style={{ textDecoration: 'none' }}>
                    <Card hoverable style={{ borderRadius: 12, overflow: 'hidden', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                      <div style={{ height: 140, overflow: 'hidden' }}>
                        <img src={project.img} alt={project.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div style={{ padding: '12px 0' }}>
                        <Text strong style={{ fontSize: 15, color: '#333' }}>{project.name}</Text>
                        <p style={{ margin: '8px 0', fontSize: 13, color: '#999' }}>{project.desc}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Tag color="purple" style={{ borderRadius: 10, fontSize: 11 }}>{project.lang}</Tag>
                          <Button type="link" size="small" style={{ padding: 0, color: '#1890ff' }}>查看详情</Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>

          <Card style={{ borderRadius: 8, border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTextOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                <Title level={4} style={{ margin: 0, fontWeight: 600 }}>精选博客</Title>
              </div>
              <Button type="text" size="small" style={{ color: '#999' }}>排行榜 <ArrowRightOutlined /></Button>
            </div>

            {loading ? (<div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>) : articles.length === 0 ? (<Empty description="暂无文章" />) : (<List dataSource={articles} renderItem={(article) => (<List.Item style={{ padding: '20px 0', borderBottom: '1px dashed #e0e0e0', display: 'flex', gap: 20 }}>
              {article.coverImage && (<div style={{ width: 200, height: 120, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                <img src={article.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>)}
              <div style={{ flex: 1 }}>
                <Link to={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
                  <Title level={4} style={{ marginBottom: 8, fontSize: 16, color: '#333', fontWeight: 500 }}>{article.title}</Title>
                </Link>
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
                  {article.summary || (article.content?.substring(0, 150) || '')}
                </Paragraph>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {article.categoryName && <Tag color="blue" style={{ borderRadius: 10, fontSize: 11 }}>{article.categoryName}</Tag>}
                  <span style={{ color: '#999', fontSize: 13 }}><EyeOutlined style={{ marginRight: 4 }} />{article.views?.toLocaleString()}</span>
                  <span style={{ color: '#999', fontSize: 13 }}><MessageOutlined style={{ marginRight: 4 }} />{article.commentCount || 0}</span>
                  <span style={{ color: '#999', fontSize: 13 }}><ClockCircleOutlined style={{ marginRight: 4 }} />{dayjs(article.createTime).format('MM-DD')}</span>
                </div>
              </div>
            </List.Item>)} />)}
          </Card>
        </main>

        <aside style={{ width: 280, padding: '20px 10px' }}>
          <Card style={{ borderRadius: 8, border: 'none', marginBottom: 16 }}>
            <div style={{ background: 'linear-gradient(135deg, #ff6b00 0%, #ff8f33 100%)', padding: '24px', borderRadius: 8, color: 'white', marginBottom: 16 }}>
              <StarFilled style={{ fontSize: 40, marginBottom: 12 }} />
              <Title level={4} style={{ margin: 0, marginBottom: 8 }}>BitCPM-CANN</Title>
              <p style={{ fontSize: 13, opacity: 0.9 }}>上线 AtomGit AI 为低内存、高性能而生的高效训练大模型</p>
              <Button type="primary" style={{ background: 'white', color: '#ff6b00', border: 'none', borderRadius: 20, marginTop: 12 }}>立即下载体验</Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TeamOutlined style={{ color: '#1890ff' }} />
                <span style={{ fontWeight: 600 }}>社区推荐</span>
              </div>
              <Button type="text" size="small" style={{ color: '#999' }}>更多</Button>
            </div>

            <List dataSource={communityRecommendations} renderItem={(item) => (<List.Item style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar src={item.avatar} size={40} />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 13, color: '#333' }}>{item.name}</Text>
                <p style={{ margin: 0, fontSize: 12, color: '#999' }}>{item.members} 成员</p>
              </div>
              {item.hot && <Tag color="red" style={{ fontSize: 10 }}>热</Tag>}
              <Button size="small" style={{ borderRadius: 16, padding: '4px 12px' }}>加入</Button>
            </List.Item>)} />
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Home;
