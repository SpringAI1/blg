import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Avatar, Button, Space, Spin, App, Tag, List, Empty } from 'antd';
import { UserOutlined, PlusOutlined, CheckOutlined, TeamOutlined, StarOutlined, FileTextOutlined, EyeOutlined, LikeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { User, Article } from '@/types';
import { userApi } from '@/api/user';
import { articleApi } from '@/api/article';
import { followApi } from '@/api/follow';
import { useAuthStore } from '@/store/auth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { message } = App.useApp();
  const [profile, setProfile] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile(Number(id));
    }
  }, [id]);

  useEffect(() => {
    if (profile && isAuthenticated && currentUser?.id !== profile.id) {
      checkFollowStatus();
    }
  }, [profile, isAuthenticated]);

  const fetchProfile = async (userId: number) => {
    setLoading(true);
    try {
      const userData = await userApi.getUserInfo(userId);
      setProfile(userData);

      // 获取该用户发布的文章
      const articleData = await articleApi.getArticlesByUserId(userId, 1, 20);
      setArticles(articleData.records || []);
    } catch (error) {
      message.error('用户不存在');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!profile) return;
    try {
      const res = await followApi.checkFollow(profile.id);
      setIsFollowing(res);
    } catch {
      // ignore
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followApi.unfollow(profile.id);
        message.success('已取消关注');
      } else {
        await followApi.follow(profile.id);
        message.success('关注成功');
      }
      setIsFollowing(!isFollowing);
    } catch (error: any) {
      message.error(error.message || '操作失败');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Text type="secondary">用户不存在</Text>
        </div>
      </Card>
    );
  }

  return (
    <div style={styles.container}>
      {/* 用户信息头部 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={styles.profileHeader}>
          <Avatar
            src={profile.avatar}
            size={96}
            icon={<UserOutlined />}
            style={{ border: '3px solid #f0f0f0' }}
          />
          <div style={styles.profileInfo}>
            <div style={styles.nameRow}>
              <Title level={3} style={{ margin: 0 }}>
                {profile.nickname || profile.username}
              </Title>
              {currentUser?.id !== profile.id && isAuthenticated && (
                <Button
                  type={isFollowing ? 'default' : 'primary'}
                  icon={isFollowing ? <CheckOutlined /> : <PlusOutlined />}
                  onClick={handleFollowToggle}
                  loading={followLoading}
                >
                  {isFollowing ? '已关注' : '关注'}
                </Button>
              )}
              {currentUser?.id === profile.id && (
                <Link to="/admin/profile">
                  <Button>编辑资料</Button>
                </Link>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 14 }}>
              @{profile.username}
            </Text>
            {profile.bio && (
              <Text style={{ display: 'block', marginTop: 8, color: '#666' }}>
                {profile.bio}
              </Text>
            )}
            <Space size="large" style={{ marginTop: 12 }}>
              <Text>
                <TeamOutlined style={{ marginRight: 4 }} />
                <strong>{profile.followerCount || 0}</strong> 粉丝
              </Text>
              <Text>
                <StarOutlined style={{ marginRight: 4 }} />
                <strong>{profile.followingCount || 0}</strong> 关注
              </Text>
              <Text>
                <FileTextOutlined style={{ marginRight: 4 }} />
                <strong>{profile.articleCount || articles.length}</strong> 文章
              </Text>
            </Space>
          </div>
        </div>
      </Card>

      {/* 文章列表 */}
      <Card title={<span><FileTextOutlined style={{ marginRight: 8 }} />发布的文章</span>}>
        {articles.length === 0 ? (
          <Empty description="该用户还没有发布文章" />
        ) : (
          <List
            dataSource={articles}
            renderItem={(article) => (
              <List.Item style={styles.articleItem}>
                <Link to={`/article/${article.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 15, color: '#1a1a1a' }}>
                        {article.title}
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        <Space size="middle">
                          {article.categoryName && (
                            <Tag color="blue" style={{ borderRadius: 8 }}>{article.categoryName}</Tag>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EyeOutlined style={{ marginRight: 4 }} />
                            {article.views}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <LikeOutlined style={{ marginRight: 4 }} />
                            {article.likes}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {dayjs(article.createTime).format('YYYY-MM-DD')}
                          </Text>
                        </Space>
                      </div>
                    </div>
                  </div>
                </Link>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1000, margin: '0 auto', padding: '24px 0' },
  profileHeader: { display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' },
  profileInfo: { flex: 1, minWidth: 200 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4, flexWrap: 'wrap' },
  articleItem: { padding: '12px 0' },
};

export default UserProfile;
