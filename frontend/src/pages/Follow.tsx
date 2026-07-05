import { Card, List, Typography, Button, Tabs, Space, Avatar, Empty, Spin, App, Pagination } from 'antd';
import { PlusOutlined, UserOutlined, TeamOutlined, StarOutlined, CheckOutlined, StopOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import { followApi, FollowUser } from '@/api/follow';
import { useAuthStore } from '@/store/auth';

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

const Follow = () => {
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [followingTotal, setFollowingTotal] = useState(0);
  const [followersTotal, setFollowersTotal] = useState(0);
  const [followingPage, setFollowingPage] = useState(1);
  const [followersPage, setFollowersPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('following');
  const { isAuthenticated, user } = useAuthStore();
  const { message } = App.useApp();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFollowing(1);
      fetchFollowers(1);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFollowing = useCallback(async (page: number) => {
    try {
      const res = await followApi.getMyFollowing(page, PAGE_SIZE);
      setFollowing(res?.records || []);
      setFollowingTotal(res?.total || 0);
      setFollowingPage(page);
    } catch (error) {
      message.error('获取关注列表失败');
    }
  }, [message]);

  const fetchFollowers = useCallback(async (page: number) => {
    try {
      const res = await followApi.getMyFollowers(page, PAGE_SIZE);
      setFollowers(res?.records || []);
      setFollowersTotal(res?.total || 0);
      setFollowersPage(page);
    } catch (error) {
      message.error('获取粉丝列表失败');
    }
  }, [message]);

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    // 防止关注自己
    if (user?.id === userId) {
      message.warning('不能关注自己');
      return;
    }
    try {
      if (isFollowing) {
        await followApi.unfollow(userId);
        message.success('已取消关注');
      } else {
        await followApi.follow(userId);
        message.success('关注成功');
      }
      fetchFollowing(followingPage);
      fetchFollowers(followersPage);
    } catch {
      message.error('操作失败');
    }
  };

  const renderUser = (userItem: FollowUser, showActions = true, isFollowingUser = false) => (
    <List.Item
      style={styles.listItem}
      actions={
        showActions
          ? [
              user?.id === userItem.id ? (
                <Button key="self" size="small" disabled icon={<StopOutlined />}>
                  自己
                </Button>
              ) : (
                <Button
                  key="action"
                  type={isFollowingUser ? 'default' : 'primary'}
                  size="small"
                  icon={isFollowingUser ? <CheckOutlined /> : <PlusOutlined />}
                  onClick={() => handleFollow(userItem.id, isFollowingUser)}
                >
                  {isFollowingUser ? '已关注' : '关注'}
                </Button>
              ),
            ]
          : []
      }
    >
      <List.Item.Meta
        avatar={
          <Avatar 
            src={userItem.avatar} 
            size={56} 
            icon={<UserOutlined />}
            style={{ border: '2px solid #f0f0f0' }}
          />
        }
        title={
          <Space>
            <Text strong style={{ fontSize: 16 }}>{userItem.nickname || userItem.username}</Text>
            <Text type="secondary">@{userItem.username}</Text>
          </Space>
        }
        description={
          <div>
            {userItem.bio && (
              <Text style={{ display: 'block', marginBottom: 8, color: '#666' }}>
                {userItem.bio}
              </Text>
            )}
            <Space size="middle">
              <Text type="secondary">
                <TeamOutlined style={{ marginRight: 4 }} />
                {userItem.followerCount || 0} 粉丝
              </Text>
              <Text type="secondary">
                <StarOutlined style={{ marginRight: 4 }} />
                {userItem.articleCount || 0} 文章
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ margin: 0 }}>关注</Title>
      </div>

      <Card>
        <Tabs
          defaultActiveKey="following"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: 'following',
              label: <span>关注 <span style={{ fontSize: 12, color: '#999' }}>({followingTotal})</span></span>,
              children: (
                <Spin spinning={loading && following.length === 0}>
                  {following.length > 0 ? (
                    <>
                      <List
                        dataSource={following}
                        renderItem={(item) => renderUser(item, true, true)}
                      />
                      <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Pagination
                          current={followingPage}
                          total={followingTotal}
                          pageSize={PAGE_SIZE}
                          showSizeChanger={false}
                          onChange={(p) => fetchFollowing(p)}
                        />
                      </div>
                    </>
                  ) : (
                    <Empty description="还没有关注任何人">
                      <Text type="secondary">去博客页面发现感兴趣的作者吧</Text>
                    </Empty>
                  )}
                </Spin>
              ),
            },
            {
              key: 'followers',
              label: <span>粉丝 <span style={{ fontSize: 12, color: '#999' }}>({followersTotal})</span></span>,
              children: (
                <Spin spinning={loading && followers.length === 0}>
                  {followers.length > 0 ? (
                    <>
                      <List
                        dataSource={followers}
                        renderItem={(item) => renderUser(item, true, following.some(f => f.id === item.id))}
                      />
                      <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Pagination
                          current={followersPage}
                          total={followersTotal}
                          pageSize={PAGE_SIZE}
                          showSizeChanger={false}
                          onChange={(p) => fetchFollowers(p)}
                        />
                      </div>
                    </>
                  ) : (
                    <Empty description="还没有粉丝">
                      <Text type="secondary">发表优质内容吸引更多关注</Text>
                    </Empty>
                  )}
                </Spin>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { background: '#fff', borderRadius: 8, padding: 24 },
  header: { marginBottom: 24 },
  listItem: { padding: '16px 0' },
};

export default Follow;
