import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Spin, Typography, Tag, Button, App as AntdApp, Space, Input, List, Avatar, Form, Breadcrumb } from 'antd';
import { EyeOutlined, LikeOutlined, EditOutlined, StarOutlined, StarFilled, UserOutlined, UserAddOutlined, SendOutlined, LikeFilled, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import { Article } from '@/types';
import { articleApi } from '@/api/article';
import { favoriteApi } from '@/api/favorite';
import { followApi } from '@/api/follow';
import { commentApi } from '@/api/comment';
import { useAuthStore } from '@/store/auth';
import { recordHistory } from '@/pages/History';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Comment {
  id: number;
  content: string;
  userId: number;
  username: string;
  userAvatar?: string | null;
  parentId: number | null;
  children?: Comment[];
  createTime: string;
  likes?: number;
}

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();

  const fetchArticle = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await articleApi.getPublishedArticle(Number(id));
      setArticle(data);
      if (id) recordHistory(Number(id));
      fetchComments();
    } catch (error) {
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    setCommentLoading(true);
    try {
      const res = await commentApi.getCommentsByArticle(Number(id));
      setComments(res || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!id) return;
    try {
      const res = await favoriteApi.checkFavorite(Number(id));
      setIsFavorited(res || false);
    } catch (error) {
      console.error('Check favorite failed:', error);
    }
  };

  const checkFollow = async () => {
    if (!article?.userId) return;
    try {
      const res = await followApi.checkFollow(article.userId);
      setIsFollowing(res || false);
    } catch (error) {
      console.error('Check follow failed:', error);
    }
  };

  const checkLike = async () => {
    if (!id) return;
    try {
      const res = await articleApi.checkLike(Number(id));
      setIsLiked(res || false);
    } catch (error) {
      console.error('Check like failed:', error);
    }
  };

  useEffect(() => {
    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (article) {
      checkFavorite();
      checkLike();
      if (isAuthenticated) {
        checkFollow();
      }
    }
  }, [article, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    try {
      await articleApi.likeArticle(Number(id));
      setIsLiked(!isLiked);
      message.success(isLiked ? '取消点赞成功' : '点赞成功');
      fetchArticle();
    } catch {
      message.error('操作失败');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    try {
      if (isFavorited) {
        await favoriteApi.removeFavorite(Number(id));
        message.success('取消收藏成功');
      } else {
        await favoriteApi.addFavorite(Number(id));
        message.success('收藏成功');
      }
      setIsFavorited(!isFavorited);
      fetchArticle();
    } catch {
      message.error('操作失败');
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    try {
      if (isFollowing) {
        await followApi.unfollow(article!.userId);
        message.success('取消关注成功');
      } else {
        await followApi.follow(article!.userId);
        message.success('关注成功');
      }
      setIsFollowing(!isFollowing);
    } catch {
      message.error('操作失败');
    }
  };

  const handleSubmitComment = async (values: any) => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    if (!values.content?.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    setSubmitting(true);
    try {
      const result = await commentApi.addComment(Number(id), { 
        content: values.content.trim()
      });
      if (result) {
        message.success('评论成功');
        form.resetFields();
        fetchComments();
      }
    } catch (error: any) {
      message.error(error.message || '评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCommentItem = (comment: Comment) => (
    <List.Item key={comment.id} style={styles.commentItem}>
      <List.Item.Meta
        avatar={<Avatar src={comment.userAvatar} icon={<UserOutlined />} />}
        title={
          <Space>
            <Text strong>{comment.username}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(comment.createTime).format('YYYY-MM-DD HH:mm')}
            </Text>
          </Space>
        }
        description={<Text style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Text>}
      />
      {comment.children && comment.children.length > 0 && (
        <div style={{ marginLeft: 54, marginTop: 8, paddingLeft: 16, borderLeft: '2px solid #f0f0f0' }}>
          <List dataSource={comment.children} renderItem={renderCommentItem} />
        </div>
      )}
    </List.Item>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Text type="secondary">文章不存在或已被删除</Text>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* 返回按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginRight: 8 }}
        >
          返回
        </Button>
        <Button 
          icon={<HomeOutlined />} 
          onClick={() => navigate('/')}
        >
          首页
        </Button>
      </div>

      <Card
        title={
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>{article.title}</Title>
            <div style={{ marginTop: 8 }}>
              {article.tags && article.tags.map((tag: any) => (
                <Tag key={tag.id} color="blue" style={{ marginBottom: 4 }}>{tag.name}</Tag>
              ))}
            </div>
          </div>
        }
        extra={
          <Space>
            {isAuthenticated && user?.id === article.userId && (
              <Link to={`/admin/articles/edit/${article.id}`}>
                <Button icon={<EditOutlined />}>编辑</Button>
              </Link>
            )}
            <Button
              icon={isFavorited ? <StarFilled /> : <StarOutlined />}
              type={isFavorited ? 'primary' : 'default'}
              onClick={handleFavorite}
            >
              {isFavorited ? '已收藏' : '收藏'}
            </Button>
          </Space>
        }
      >
        <div style={styles.meta}>
          <Space size="large" wrap>
            <Space>
              <Avatar 
                src={article.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                size={32}
                icon={<UserOutlined />}
              />
              <Text strong>{article.username || '匿名'}</Text>
            </Space>
            {isAuthenticated && user?.id !== article.userId && (
              <Button
                size="small"
                icon={isFollowing ? <UserOutlined /> : <UserAddOutlined />}
                onClick={handleFollow}
              >
                {isFollowing ? '已关注' : '关注'}
              </Button>
            )}
            {article.categoryName && (
              <Tag color="geekblue">{article.categoryName}</Tag>
            )}
            <Text type="secondary">
              <EyeOutlined style={{ marginRight: 4 }} />
              {article.views} 阅读
            </Text>
            <Text type="secondary">
              {dayjs(article.createTime).format('YYYY-MM-DD HH:mm')}
            </Text>
          </Space>
        </div>

        {article.coverImage && (
          <img 
            src={article.coverImage} 
            alt={article.title} 
            style={styles.coverImage}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        <div style={styles.content}>
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        <div style={styles.actions}>
          <Button
            icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
            onClick={handleLike}
            type={isLiked ? 'primary' : 'default'}
          >
            点赞 {article.likes || 0}
          </Button>
        </div>
      </Card>

      <Card title={`评论 (${comments.length})`} style={{ marginTop: 16 }}>
        {isAuthenticated ? (
          <Form form={form} onFinish={handleSubmitComment} style={{ marginBottom: 24 }}>
            <Form.Item name="content">
              <TextArea
                rows={4}
                placeholder="写下你的评论..."
                maxLength={500}
                showCount
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={submitting}
              >
                发表评论
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
            请先<Link to="/login">登录</Link>后发表评论
          </div>
        )}

        <Spin spinning={commentLoading}>
          {comments.length > 0 ? (
            <List dataSource={comments} renderItem={renderCommentItem} />
          ) : (
            <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
              暂无评论，快来抢沙发！
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  meta: {
    display: 'flex',
    gap: 16,
    color: '#999',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '1px solid #f0f0f0',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  coverImage: {
    width: '100%',
    maxHeight: 400,
    objectFit: 'cover',
    marginBottom: 16,
    borderRadius: 8,
  },
  content: {
    lineHeight: 1.8,
    fontSize: 16,
  },
  actions: {
    marginTop: 24,
    paddingTop: 16,
    borderTop: '1px solid #f0f0f0',
    textAlign: 'center',
  },
  commentItem: {
    padding: '12px 0',
  },
};

export default ArticleDetail;
