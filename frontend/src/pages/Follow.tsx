import { Card, List, Typography, Button, Tabs, Space, Avatar, Empty, Spin, App } from 'antd';
import { PlusOutlined, UserOutlined, CheckOutlined, TeamOutlined, StarOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { followApi } from '@/api/follow';
import { useAuthStore } from '@/store/auth';

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

const Follow = () => {
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const { message } = App.useApp();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [followingRes, followersRes] = await Promise.all([
        followApi.getMyFollowing(1, 50),
        followApi.getMyFollowers(1, 50),
      ]);
      setFollowing(followingRes?.records || []);
      setFollowers(followersRes?.records || []);
    } catch (error) {
      console.error('Failed to fetch follow data:', error);
      message.error('获取关注数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await followApi.unfollow(userId);
        message.success('已取消关注');
      } else {
        await followApi.follow(userId);
        message.success('关注成功');
      }
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const renderUserItem = (user: FollowUser, showFollowAction: boolean = true) => (
    <List.Item
      style={styles.listItem}
      actions={
        showFollowAction
          ? [
              <Button
                key="follow"
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleFollow(user.id, false)}
              >
                关注
              </Button>,
            ]
          : []
      }
    >
      <List.Item.Meta
        avatar={
          <Avatar 
            src={user.avatar} 
            size={56} 
            icon={<UserOutlined />}
            style={{ border: '2px solid #f0f0f0' }}
          />
        }
        title={
          <Space>
            <Text strong style={{ fontSize: 16 }}>{user.nickname || user.username}</Text>
            <Text type="secondary">@{user.username}</Text>
          </Space>
        }
        description={
          <div>
            {user.bio && (
              <Text style={{ display: 'block', marginBottom: 8, color: '#666' }}>
                {user.bio}
              </Text>
            )}
            <Space size="middle">
              <Text type="secondary">
                <TeamOutlined style={{ marginRight: 4 }} />
                {user.followerCount || 0} 粉丝
              </Text>
              <Text type="secondary">
                <StarOutlined style={{ marginRight: 4 }} />
                {user.articleCount || 0} 文章
              </Text>
            </Space>
          </div>
        }
      />
    </List.Item>
  );

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <Title level={2} style={{ margin: 0, marginBottom: 24 }}>关注</Title>
        <Card>
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Text type="secondary">请先登录后查看关注列表</Text>
          </div>
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'following',
      label: <span>关注 <span style={{ fontSize: 12, color: '#999' }}>({following.length})</span></span>,
      children: (
        <Spin spinning={loading}>
          {following.length > 0 ? (
            <List
              dataSource={following}
              renderItem={(user) => renderUserItem(user, false)}
            />
          ) : (
            <Empty 
              description="还没有关注任何人" 
              style={{ padding: 48 }}
            >
              <Text type="secondary">去博客页面发现感兴趣的作者吧</Text>
            </Empty>
          )}
        </Spin>
      ),
    },
    {
      key: 'followers',
      label: <span>粉丝 <span style={{ fontSize: 12, color: '#999' }}>({followers.length})</span></span>,
      children: (
        <Spin spinning={loading}>
          {followers.length > 0 ? (
            <List
              dataSource={followers}
              renderItem={(user) => renderUserItem(user, true)}
            />
          ) : (
            <Empty 
              description="还没有粉丝" 
              style={{ padding: 48 }}
            >
              <Text type="secondary">发表优质内容吸引更多关注</Text>
            </Empty>
          )}
        </Spin>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ margin: 0 }}>关注</Title>
      </div>

      <Card>
        <Tabs items={tabItems} defaultActiveKey="following" />
      </Card>
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
    marginBottom: 24,
  },
  listItem: {
    padding: '16px 0',
  },
};

export default Follow;