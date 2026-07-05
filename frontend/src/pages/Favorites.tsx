import { useEffect, useState } from 'react';
import { Card, List, Typography, Empty, Spin, Button, Space, App, Pagination } from 'antd';
import { LikeOutlined, EyeOutlined, DeleteOutlined, StarFilled, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { favoriteApi } from '@/api/favorite';
import { useAuthStore } from '@/store/auth';
import { Article } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Favorites = () => {
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [favTotal, setFavTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const { message } = App.useApp();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites(1);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await favoriteApi.getMyFavorites(pageNum, 10);
      setFavorites(res?.records || []);
      setFavTotal(res?.total || 0);
      setPage(pageNum);
    } catch (error) {
      message.error('加载收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (articleId: number) => {
    try {
      await favoriteApi.removeFavorite(articleId);
      message.success('取消收藏成功');
      fetchFavorites(page);
    } catch (error) {
      message.error('取消收藏失败');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <Card style={{ borderRadius: 12 }}>
          <div style={{ textAlign: 'center', padding: 48 }}>
            <StarFilled style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }} />
            <Text type="secondary" style={{ fontSize: 16, display: 'block' }}>请先登录后查看收藏</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <Title level={2} style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarFilled style={{ color: '#faad14' }} />
          我的收藏
        </Title>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Spin spinning={loading}>
          <List
            dataSource={favorites}
            locale={{ emptyText: (
              <div style={{ padding: 48 }}>
                <StarFilled style={{ fontSize: 48, color: '#eee', display: 'block', marginBottom: 16 }} />
                <Empty description="暂无收藏文章" />
                <Text type="secondary">去博客页面发现感兴趣的文章吧</Text>
              </div>
            )}}
            renderItem={(article) => (
              <List.Item
                style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
                actions={[
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleRemoveFavorite(article.id)}
                    key="remove"
                    style={{ borderRadius: 6 }}
                  >
                    取消收藏
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Link to={`/article/${article.id}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {article.title}
                    </Link>
                  }
                  description={
                    <Space wrap>
                      <Text type="secondary" ellipsis style={{ maxWidth: 400 }}>
                        {article.summary || '暂无摘要'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <EyeOutlined style={{ marginRight: 4 }} />
                        {article.views || 0}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <LikeOutlined style={{ marginRight: 4 }} />
                        {article.likes || 0}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <MessageOutlined style={{ marginRight: 4 }} />
                        {article.commentCount || 0}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {article.createTime ? dayjs(article.createTime).format('MM-DD') : ''}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
          {favTotal > 10 && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Pagination
                current={page}
                total={favTotal}
                pageSize={10}
                showSizeChanger={false}
                onChange={(p) => fetchFavorites(p)}
              />
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default Favorites;
