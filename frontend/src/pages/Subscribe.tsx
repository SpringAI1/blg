import { Card, List, Typography, Button, Tag, Space, Switch, Empty, Spin, App, Tabs } from 'antd';
import { BellOutlined, TeamOutlined, CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { followApi, FollowUser } from '@/api/follow';
import { tagApi } from '@/api/tag';
import { categoryApi } from '@/api/category';
import { useAuthStore } from '@/store/auth';

const { Title, Text } = Typography;

const Subscribe = () => {
  const { message } = App.useApp();
  const { isAuthenticated } = useAuthStore();
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [categories] = useState<any[]>([]);
  const [tags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // 获取关注列表作为订阅来源
      const res = await followApi.getMyFollowing(1, 100);
      const list = res?.records || [];
      setFollowing(list);
      setFollowingIds(new Set(list.map(u => u.id)));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await followApi.unfollow(userId);
      message.success('已取消关注');
      fetchSubscriptions();
    } catch {
      message.error('操作失败');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <Title level={2} style={{ margin: 0, marginBottom: 24 }}>订阅管理</Title>
        <Card>
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Text type="secondary">请先登录后管理订阅</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          订阅管理
        </Title>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>我的订阅</Text>
          <Text type="secondary">
            已关注 {following.length} 位作者
          </Text>
        </div>
      </Card>

      <Spin spinning={loading}>
        <Card title={<span><TeamOutlined style={{ marginRight: 8 }} />已关注的作者</span>}>
          {following.length === 0 ? (
            <Empty description="还没有关注任何作者" style={{ padding: 32 }}>
              <Text type="secondary">去博客页面发现感兴趣的作者并关注</Text>
            </Empty>
          ) : (
            <List
              dataSource={following}
              renderItem={(user) => (
                <List.Item
                  style={styles.listItem}
                  actions={[
                    <Button
                      key="unfollow"
                      size="small"
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => handleUnfollow(user.id)}
                    >
                      取消关注
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={styles.avatarBox}>
                        {user.avatar ? (
                          <img src={user.avatar} style={{ width: 48, height: 48, borderRadius: '50%' }} alt="" />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#999' }}>
                            <UserOutlined />
                          </div>
                        )}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{user.nickname || user.username}</Text>
                        <Text type="secondary">@{user.username}</Text>
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary">{user.articleCount || 0} 篇文章</Text>
                        <Text type="secondary">{user.followerCount || 0} 粉丝</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Spin>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { background: '#fff', borderRadius: 8, padding: 24 },
  header: { marginBottom: 24 },
  listItem: { padding: '12px 0' },
  avatarBox: { display: 'flex', alignItems: 'center' },
};

export default Subscribe;
