import { useState, useEffect } from 'react';
import { Card, List, Typography, Tag, Avatar, Empty, Spin, App, Space, Button } from 'antd';
import { CalendarOutlined, UserOutlined, RightOutlined, ClockCircleOutlined, EyeOutlined, LikeOutlined, StarOutlined, StarFilled, TeamOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Article } from '@/types';
import { articleApi } from '@/api/article';
import { favoriteApi } from '@/api/favorite';
import { followApi } from '@/api/follow';
import { useAuthStore } from '@/store/auth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Community = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritedMap, setFavoritedMap] = useState<Record<number, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articleApi.getPublishedArticles(1, 20);
      const records = data.records || [];
      setArticles(records);
      
      // 检查收藏状态（全部文章）
      if (isAuthenticated && records.length > 0) {
        Promise.all(records.map(a => 
          favoriteApi.checkFavorite(a.id).then(r => ({id: a.id, fav: r})).catch(() => null)
        )).then(results => {
          const map: Record<number, boolean> = {};
          results.forEach(r => { if (r) map[r.id] = r.fav; });
          setFavoritedMap(map);
        });
        
        // 检查关注状态（去重作者）
        const authorIds = [...new Set(records.map(a => a.userId))];
        Promise.all(authorIds.map(uid =>
          followApi.checkFollow(uid).then(r => ({id: uid, following: r})).catch(() => null)
        )).then(results => {
          const map: Record<number, boolean> = {};
          results.forEach(r => { if (r) map[r.id] = r.following; });
          setFollowingMap(map);
        });
      }
    } catch (error) {
      message.error('加载社区内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, articleId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { message.warning('请先登录'); return; }
    try {
      await articleApi.likeArticle(articleId);
      message.success('点赞成功');
      // 刷新数据
      const data = await articleApi.getPublishedArticles(1, 20);
      setArticles(data.records || []);
    } catch { message.error('操作失败'); }
  };

  const handleFavorite = async (e: React.MouseEvent, articleId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { message.warning('请先登录'); return; }
    try {
      if (favoritedMap[articleId]) {
        await favoriteApi.removeFavorite(articleId);
        message.success('取消收藏成功');
      } else {
        await favoriteApi.addFavorite(articleId);
        message.success('收藏成功');
      }
      setFavoritedMap(prev => ({...prev, [articleId]: !prev[articleId]}));
    } catch { message.error('操作失败'); }
  };

  const handleFollow = async (e: React.MouseEvent, userId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { message.warning('请先登录'); return; }
    const isFollowing = followingMap[userId];
    try {
      if (isFollowing) {
        await followApi.unfollow(userId);
        message.success('已取消关注');
      } else {
        await followApi.follow(userId);
        message.success('关注成功');
      }
      setFollowingMap(prev => ({...prev, [userId]: !isFollowing}));
    } catch { message.error('操作失败'); }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div className="fade-in-up" style={styles.container}>
      <div style={styles.banner}>
        <TeamOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
        <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>社区</Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 8, display: 'block' }}>
          发现热门技术文章，与开发者互动交流
        </Text>
      </div>

      {articles.length === 0 ? (
        <Empty description="暂无内容" style={{ padding: 48 }} />
      ) : (
          <List
            dataSource={articles}
            renderItem={(article) => (
              <List.Item style={{ padding: '6px 0' }}>
                <Card 
                  hoverable 
                  style={{ width: '100%', borderRadius: 12, border: '1px solid var(--color-border-light)' }}
                  styles={{ body: { padding: 20 } }}
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <div style={styles.meta}>
                    <Space>
                      <Avatar size={28} icon={<UserOutlined />} src={article.userAvatar} style={{ border: '1px solid var(--color-border-light)' }} />
                      <Text strong style={{ fontSize: 14 }}>{article.username}</Text>
                      {isAuthenticated && user?.id !== article.userId && (
                        <Button
                          size="small"
                          type={followingMap[article.userId] ? 'default' : 'link'}
                          onClick={(e) => handleFollow(e, article.userId)}
                          style={{ borderRadius: 6, height: 26 }}
                        >
                          {followingMap[article.userId] ? '已关注' : '关注'}
                        </Button>
                      )}
                      <Tag color="orange" style={{ borderRadius: 6, lineHeight: '22px' }}>{article.categoryName || '技术'}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {dayjs(article.createTime).format('YYYY-MM-DD')}
                      </Text>
                    </Space>
                  </div>
                  <Title level={4} style={{ margin: '14px 0 8px', color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 17 }}>{article.title}</Title>
                  <Text style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 14, lineHeight: 1.6, fontSize: 14 }}>
                    {article.summary || article.content?.substring(0, 120) || ''}...
                  </Text>
                  <div style={styles.actions}>
                    <Button type="text" icon={<EyeOutlined />} size="small" style={{ color: 'var(--color-text-tertiary)' }}>
                      {article.views?.toLocaleString()}
                    </Button>
                    <Button type="text" icon={favoritedMap[article.id] ? <StarFilled style={{color:'#faad14'}} /> : <StarOutlined />}
                      size="small" onClick={(e) => handleFavorite(e, article.id)} style={{ color: 'var(--color-text-tertiary)' }}>
                      {article.favoriteCount || 0}
                    </Button>
                    <Button type="text" icon={<LikeOutlined />} size="small"
                      onClick={(e) => handleLike(e, article.id)} style={{ color: 'var(--color-text-tertiary)' }}>
                      {article.likes || 0}
                    </Button>
                    {article.tags?.slice(0, 3).map(tag => (
                      <Tag key={tag.id} color="blue" style={{ fontSize: 11, borderRadius: 6, lineHeight: '20px' }}>{tag.name}</Tag>
                    ))}
                  </div>
                </Card>
              </List.Item>
            )}
          />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100%' },
  banner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 12, padding: '36px 32px', marginBottom: 24, textAlign: 'center',
  },
  meta: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  actions: { display: 'flex', gap: 12, alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12, flexWrap: 'wrap' },
};

export default Community;
