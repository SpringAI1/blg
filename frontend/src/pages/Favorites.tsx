import { useEffect, useState } from 'react';
import { Card, List, Typography, Empty, Spin, Button, Space, App, Tabs, Pagination } from 'antd';
import { LikeOutlined, EyeOutlined, DeleteOutlined, StarFilled, TeamOutlined, MessageOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { favoriteApi } from '@/api/favorite';
import { followApi } from '@/api/follow';
import { useAuthStore } from '@/store/auth';
import { Article } from '@/types';

const { Title, Text } = Typography;

interface FollowUser {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  articleCount?: number;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [followings, setFollowings] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [favTotal, setFavTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const { message } = App.useApp();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites(1);
      fetchFollowings();
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
      console.error('获取收藏失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowings = async () => {
    try {
      const res = await followApi.getMyFollowing(1, 50);
      setFollowings(res?.records || []);
    } catch (error) {
      console.error('获取关注失败:', error);
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

  const handleUnfollow = async (userId: number) => {
    try {
      await followApi.unfollow(userId);
      message.success('取消关注成功');
      fetchFollowings();
    } catch (error) {
      message.error('取消关注失败');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 0' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Text type="secondary">请先登录后查看收藏与关注</Text>
          </div>
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'favorites',
      label: <span><StarFilled /> 收藏 ({favTotal})</span>,
      children: (
        <>
          <List
            dataSource={favorites}
            loading={loading}
            locale={{ emptyText: <Empty description="暂无收藏文章，去博客页面发现感兴趣的文章吧" /> }}
            renderItem={(article) => (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleRemoveFavorite(article.id)}
                    key="remove"
                  >
                    取消收藏
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Link to={`/article/${article.id}`} style={{ fontSize: '16px', fontWeight: 500, color: '#1a1a1a' }}>
                      {article.title}
                    </Link>
                  }
                  description={
                    <Space wrap>
                      <Text type="secondary" ellipsis style={{ maxWidth: 400 }}>
                        {article.summary || '暂无摘要'}
                      </Text>
                      <Text type="secondary">
                        <EyeOutlined style={{ marginRight: 4 }} />
                        {article.views || 0}
                      </Text>
                      <Text type="secondary">
                        <LikeOutlined style={{ marginRight: 4 }} />
                        {article.likes || 0}
                      </Text>
                      <Text type="secondary">
                        <MessageOutlined style={{ marginRight: 4 }} />
                        {article.commentCount || 0}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
          {favTotal > 10 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={page}
                total={favTotal}
                pageSize={10}
                showSizeChanger={false}
                onChange={(p) => fetchFavorites(p)}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: 'following',
      label: <span><TeamOutlined /> 关注 ({followings.length})</span>,
      children: (
        <List
          dataSource={followings}
          loading={loading}
          locale={{ emptyText: <Empty description="暂无关注用户" /> }}
          renderItem={(user) => (
            <List.Item
              actions={[
                <Button 
                  key="unfollow" 
                  danger 
                  size="small" 
                  onClick={() => handleUnfollow(user.id)}
                >
                  取消关注
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    style={{ width: 48, height: 48, borderRadius: '50%' }}
                    alt=""
                  />
                }
                title={user.nickname || user.username}
                description={
                  <Space>
                    <Text type="secondary">{user.articleCount || 0} 文章</Text>
                    <Text type="secondary">{user.followerCount || 0} 粉丝</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 0' }}>
      <Title level={2} style={{ marginBottom: 24 }}>我的收藏与关注</Title>
      <Card>
        <Tabs items={tabItems} defaultActiveKey="favorites" />
      </Card>
    </div>
  );
};

export default Favorites;