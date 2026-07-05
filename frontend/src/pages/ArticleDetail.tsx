import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spin, Typography, Tag, Button, App as AntdApp, Space, Input, Avatar, Form, Tooltip } from 'antd';
import { EyeOutlined, LikeOutlined, EditOutlined, StarOutlined, StarFilled, UserOutlined, UserAddOutlined, SendOutlined, LikeFilled, ArrowLeftOutlined, HomeOutlined, MessageOutlined, ClockCircleOutlined, ShareAltOutlined, WechatOutlined, WeiboOutlined, LinkOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import { Article } from '@/types';
import { CommentDTO } from '@/api/comment';
import { articleApi } from '@/api/article';
import { favoriteApi } from '@/api/favorite';
import { followApi } from '@/api/follow';
import { commentApi } from '@/api/comment';
import { useAuthStore } from '@/store/auth';
import { recordHistory } from '@/pages/History';
import { saveProgress } from '@/utils/progress';

const { Title, Text } = Typography;
const { TextArea } = Input;


const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentDTO | null>(null);
  const [replyForm] = Form.useForm();
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  
  const handleReply = (comment: CommentDTO) => {
    setReplyingTo(comment);
    setTimeout(() => {
      replyForm.setFieldsValue({ replyContent: '' });
    }, 0);
  };

  const handleCancelReply = () => {
    if (replyingTo) {
      replyForm.resetFields();
    }
    setReplyingTo(null);
  };
  const { user, isAuthenticated } = useAuthStore();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();

  const markStudyProgress = (articleId: number, updates: { status: 'in_progress' | 'completed' | 'paused'; progress: number }) => {
    saveProgress(articleId, updates);
  };

  const countComments = (items: CommentDTO[]): number =>
    items.reduce((sum, item) => sum + 1 + countComments(item.children || []), 0);

  const fetchArticle = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await articleApi.getPublishedArticle(Number(id));
      setArticle(data);
      if (id) {
        recordHistory(Number(id));
        if (searchParams.get('study') === '1') {
          markStudyProgress(Number(id), { status: 'in_progress', progress: 60 });
        }
      }
      fetchComments();
      articleApi.getRelatedArticles(Number(id)).then(setRelatedArticles).catch(() => {});
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
    }
  };

  const checkFollow = async () => {
    if (!article?.userId) return;
    try {
      const res = await followApi.checkFollow(article.userId);
      setIsFollowing(res || false);
    } catch (error) {
    }
  };

  const checkLike = async () => {
    if (!id) return;
    try {
      const res = await articleApi.checkLike(Number(id));
      setIsLiked(res || false);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (article && isAuthenticated) {
      checkFavorite();
      checkLike();
      checkFollow();
    } else {
      setIsFavorited(false);
      setIsLiked(false);
      setIsFollowing(false);
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
      if (article) {
        setArticle({
          ...article,
          likes: article.likes + (isLiked ? -1 : 1),
        });
      }
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
      } else {
        await favoriteApi.addFavorite(Number(id));
      }
      setIsFavorited(!isFavorited);
      if (article) {
        setArticle({
          ...article,
          favoriteCount: (article.favoriteCount || 0) + (isFavorited ? -1 : 1),
        });
      }
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
      } else {
        await followApi.follow(article!.userId);
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
        content: values.content.trim(),
        parentId: replyingTo?.id || undefined
      });
      if (result) {
        form.resetFields();
        handleCancelReply();
        fetchComments();
      articleApi.getRelatedArticles(Number(id)).then(setRelatedArticles).catch(() => {});
      }
    } catch (error: any) {
      message.error(error.message || '评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCommentItem = (comment: CommentDTO) => (
    <div key={comment.id} style={styles.commentItem}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar src={comment.userAvatar} icon={<UserOutlined />} size={36} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Space>
            <Text strong style={{ fontSize: 14 }}>{comment.username}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(comment.createTime).format('MM-DD HH:mm')}
            </Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            <Text style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{comment.content}</Text>
          </div>
          <div style={{ marginTop: 6 }}>
            {isAuthenticated && (
              <Button
                type="link"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => handleReply(comment)}
                style={{ padding: 0, height: 24, fontSize: 13 }}
              >
                {comment.children?.length ? `回复(${comment.children.length})` : '回复'}
              </Button>
            )}
          </div>

          {replyingTo?.id === comment.id && (
            <div style={{ marginTop: 12, padding: '16px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
              <Form form={replyForm} onFinish={async (values) => {
                setSubmitting(true);
                try {
                  await commentApi.addComment(Number(id), { 
                    content: values.replyContent?.trim(),
                    parentId: comment.id
                  });
                  message.success('回复成功');
                  handleCancelReply();
                  fetchComments();
      articleApi.getRelatedArticles(Number(id)).then(setRelatedArticles).catch(() => {});
                } catch (err: any) {
                  message.error(err.message || '回复失败');
                } finally {
                  setSubmitting(false);
                }
              }}>
                <Form.Item name="replyContent" style={{ marginBottom: 8 }}>
                  <TextArea
                    rows={2}
                    placeholder={`回复 @${comment.username}...`}
                    maxLength={500}
                    showCount
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" size="small" loading={submitting} style={{ borderRadius: 6 }}>
                    回复
                  </Button>
                  <Button size="small" onClick={handleCancelReply} style={{ borderRadius: 6 }}>
                    取消
                  </Button>
                </Space>
              </Form>
            </div>
          )}

          {/* 子评论 - 抖音样式：平铺展示，每行前面加 @用户名 标识 */}
          {comment.children && comment.children.length > 0 && (
            <div style={{ marginTop: 12, background: '#f8f8f8', borderRadius: 8, padding: '12px 16px' }}>
              {comment.children.map((child, idx) => (
                <div key={child.id} style={{ 
                  padding: '8px 0', 
                  borderBottom: idx < comment.children!.length - 1 ? '1px solid #eee' : 'none' 
                }}>
                  <Space>
                    <Text strong style={{ fontSize: 13 }}>{child.username}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <ClockCircleOutlined style={{ marginRight: 2 }} />
                      {dayjs(child.createTime).format('MM-DD HH:mm')}
                    </Text>
                  </Space>
                  <div style={{ marginTop: 2 }}>
                    <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      回复 <Text style={{ color: '#1677ff' }}>@{comment.username}</Text>：{child.content}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {isAuthenticated && (
                      <Button
                        type="link"
                        size="small"
                        icon={<MessageOutlined />}
                        onClick={() => handleReply(comment)}
                        style={{ padding: 0, height: 20, fontSize: 12 }}
                      >
                        回复
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Text type="secondary" style={{ fontSize: 16 }}>文章不存在或已被删除</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="fade-in-up" style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
      {/* 阅读进度条 */}
      <div id="reading-progress" style={{
        position: 'fixed', top: 0, left: 0, width: '0%', height: 3,
        background: 'linear-gradient(90deg, #ff6b00, #ff8c38)',
        zIndex: 1001, transition: 'width 0.1s linear',
      }} />
      {/* 导航栏 */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ borderRadius: 8, display: 'flex', alignItems: 'center' }}
        >
          返回
        </Button>
        <Button 
          icon={<HomeOutlined />} 
          onClick={() => navigate('/')}
          style={{ borderRadius: 8, display: 'flex', alignItems: 'center' }}
        >
          首页
        </Button>
      </div>

      {/* 文章内容 */}
      <Card
        style={{ borderRadius: 12, border: '1px solid var(--color-border-light)', overflow: 'hidden' }}
        styles={{ body: { padding: 32 } }}
      >
        {/* 标题和标签 */}
        <div style={{ marginBottom: 20 }}>
          <Title level={2} style={{ marginBottom: 12, fontWeight: 700, fontSize: 26, lineHeight: 1.4 }}>{article.title}</Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {article.tags && article.tags.map((tag: any) => (
              <Tag key={tag.id} color="blue" style={{ borderRadius: 8, padding: '2px 12px', lineHeight: '24px' }}>{tag.name}</Tag>
            ))}
          </div>
        </div>

        {/* 元信息 */}
        <div style={styles.meta}>
          <Space size="large" wrap>
            <Space>
              <Avatar 
                src={article.userAvatar}
                size={36}
                icon={<UserOutlined />}
                style={{ border: '2px solid var(--color-border-light)' }}
              />
              <Text strong style={{ fontSize: 14 }}>{article.username || '匿名'}</Text>
            </Space>
            {isAuthenticated && user?.id !== article.userId && (
              <Button
                size="small"
                type={isFollowing ? 'default' : 'primary'}
                icon={isFollowing ? <UserOutlined /> : <UserAddOutlined />}
                onClick={handleFollow}
                style={{ borderRadius: 6 }}
              >
                {isFollowing ? '已关注' : '关注'}
              </Button>
            )}
            {article.categoryName && (
              <Tag color="geekblue" style={{ borderRadius: 6, lineHeight: '22px' }}>{article.categoryName}</Tag>
            )}
            <Text type="secondary" style={{ fontSize: 13 }}>
              <EyeOutlined style={{ marginRight: 4 }} />
              {article.views} 阅读
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(article.createTime).format('YYYY-MM-DD HH:mm')}
            </Text>
          </Space>
          <Space>
            {isAuthenticated && user?.id === article.userId && (
              <Link to={`/admin/articles/edit/${article.id}`}>
                <Button icon={<EditOutlined />} style={{ borderRadius: 6 }}>编辑</Button>
              </Link>
            )}
            <Button
              icon={isFavorited ? <StarFilled /> : <StarOutlined />}
              type={isFavorited ? 'primary' : 'default'}
              onClick={handleFavorite}
              style={{ borderRadius: 6 }}
            >
              {isFavorited ? '已收藏' : '收藏'}
            </Button>
          </Space>
        </div>

        {/* 封面图 */}
        {article.coverImage && (
          <div style={{ marginBottom: 24, borderRadius: 10, overflow: 'hidden' }}>
            <img 
              src={article.coverImage} 
              alt={article.title} 
              style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Markdown 内容 */}
        <div className="markdown-body">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* 点赞按钮 */}
        <div style={styles.actions}>
          <Button
            size="large"
            icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
            onClick={handleLike}
            type={isLiked ? 'primary' : 'default'}
            style={{ borderRadius: 8, height: 44, padding: '0 32px', fontWeight: 500 }}
          >
            点赞 {article.likes || 0}
          </Button>
        </div>
      </Card>

      {/* 评论区 */}
      <Card
        style={{ marginTop: 20, borderRadius: 12, border: '1px solid var(--color-border-light)' }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageOutlined style={{ fontSize: 18, color: 'var(--color-primary)' }} />
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            评论 ({countComments(comments)})
          </Title>
        </div>

        {/* 评论输入框 */}
        {isAuthenticated ? (
          <div style={{ marginBottom: 28, padding: 20, background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
            {replyingTo && (
              <div style={{ padding: '8px 14px', marginBottom: 12, background: '#fff7e6', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ffe7ba' }}>
                <Space>
                  <MessageOutlined style={{ color: '#faad14' }} />
                  <Text type="secondary">正在回复 <Text strong>@{replyingTo.username}</Text></Text>
                </Space>
                <Button size="small" type="link" onClick={handleCancelReply} style={{ color: '#999' }}>取消</Button>
              </div>
            )}
            <Form form={form} onFinish={handleSubmitComment}>
              <Form.Item name="content" style={{ marginBottom: 12 }}>
                <TextArea
                  rows={3}
                  placeholder={replyingTo ? `回复 @${replyingTo.username}...` : '写下你的评论...'}
                  maxLength={500}
                  showCount
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={submitting}
                  style={{ borderRadius: 8, height: 38, padding: '0 24px' }}
                >
                  {replyingTo ? '发布回复' : '发表评论'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', marginBottom: 20, background: '#fafafa', borderRadius: 10 }}>
            <Text style={{ color: 'var(--color-text-tertiary)' }}>
              <Link to="/login" style={{ fontWeight: 500 }}>登录</Link> 后发表评论
            </Text>
          </div>
        )}

        {/* 评论列表 */}
        <Spin spinning={commentLoading}>
          {comments.length > 0 ? (
            <div style={{ borderTop: '1px solid #f0f0f0' }}>
              {comments.map(comment => renderCommentItem(comment))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
              <MessageOutlined style={{ fontSize: 32, display: 'block', marginBottom: 8, color: '#ddd' }} />
              <Text>暂无评论，快来抢沙发！</Text>
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
    justifyContent: 'space-between',
    gap: 16,
    color: 'var(--color-text-tertiary)',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: '1px solid var(--color-border-light)',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actions: {
    marginTop: 32,
    paddingTop: 24,
    borderTop: '1px solid var(--color-border-light)',
    textAlign: 'center',
  },
  commentItem: {
    padding: '16px 0',
    borderBottom: '1px solid #f5f5f5',
  },
};

export default ArticleDetail;
