import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, App, Typography } from 'antd';
import { FileTextOutlined, EyeOutlined, LikeOutlined, MessageOutlined, StarOutlined, CheckCircleOutlined, RiseOutlined } from '@ant-design/icons';
import { statsApi, AdminStats } from '@/api/stats';

const { Title } = Typography;

const Dashboard = () => {
  const { message } = App.useApp();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await statsApi.getAdminStats();
      setStats(data);
    } catch (error: any) {
      message.error(error.message || '加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const statCards = [
    { title: '文章总数', value: stats?.articleCount || 0, icon: <FileTextOutlined />, color: '#1677ff', suffix: '篇' },
    { title: '已发布', value: stats?.publishedCount || 0, icon: <CheckCircleOutlined />, color: '#52c41a', suffix: '篇' },
    { title: '浏览总数', value: stats?.totalViews || 0, icon: <EyeOutlined />, color: '#722ed1', suffix: '次' },
    { title: '点赞总数', value: stats?.totalLikes || 0, icon: <LikeOutlined />, color: '#ff4d4f', suffix: '次' },
    { title: '评论总数', value: stats?.totalComments || 0, icon: <MessageOutlined />, color: '#1890ff', suffix: '条' },
    { title: '收藏总数', value: stats?.totalFavorites || 0, icon: <StarOutlined />, color: '#faad14', suffix: '次' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          <RiseOutlined style={{ marginRight: 8 }} />
          仪表盘
        </Title>
        <span style={{ color: 'var(--color-text-tertiary)', fontSize: 13, marginTop: 4, display: 'block' }}>
          系统数据概览
        </span>
      </div>

      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} md={8} lg={6} key={card.title}>
            <Card 
              hoverable
              style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}
            >
              <Statistic
                title={<span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{card.title}</span>}
                value={card.value}
                prefix={<span style={{ color: card.color, fontSize: 20, marginRight: 8 }}>{card.icon}</span>}
                suffix={<span style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>{card.suffix}</span>}
                valueStyle={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;
