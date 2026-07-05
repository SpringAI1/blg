import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Avatar, Button, Space, Spin, App, Tabs, Form, Input, Statistic, Row, Col, Modal, Tag, List, Empty, Upload, message as Msg } from 'antd';
import { UserOutlined, EditOutlined, WalletOutlined, FileTextOutlined, StarOutlined, TeamOutlined, SafetyOutlined, LogoutOutlined, PlusOutlined, EyeOutlined, LikeOutlined, ClockCircleOutlined, MessageOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { userApi } from '@/api/user';
import { walletApi } from '@/api/wallet';
import { articleApi } from '@/api/article';
import { commentApi, CommentDTO } from '@/api/comment';
import { favoriteApi } from '@/api/favorite';
import { followApi } from '@/api/follow';
import { fileApi } from '@/api/file';
import { Article } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const MemberCenter = () => {
  const navigate = useNavigate();
  const { user, setAuth, logout, isAuthenticated } = useAuthStore();
  const { message } = App.useApp();
  const [balance, setBalance] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileForm] = Form.useForm();
  const [profileLoading, setProfileLoading] = useState(false);
  const [rechargeModal, setRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balanceData, articleData, favData, followData] = await Promise.all([
        walletApi.getBalance().catch(() => 0),
        articleApi.getArticlesByUser(1, 100).catch(() => ({ records: [], total: 0 }) as any),
        favoriteApi.getMyFavorites(1, 1).catch(() => ({ total: 0 }) as any),
        followApi.getMyFollowing(1, 1).catch(() => ({ total: 0 }) as any),
      ]);
      setBalance(balanceData ?? 0);
      setArticles(articleData?.records || []);
      setFavoriteCount(favData?.total || 0);
      setFollowingCount(followData?.total || 0);

      // 加载我的评论
      try {
        const allComments = await commentApi.getAllComments();
        const myId = user?.id;
        if (myId && allComments) {
          // 递归提取所有评论及其子评论
          const extractMine = (items: CommentDTO[]): CommentDTO[] => {
            const result: CommentDTO[] = [];
            for (const item of items) {
              if (item.userId === myId) result.push(item);
              if (item.children) result.push(...extractMine(item.children));
            }
            return result;
          };
          setComments(extractMine(allComments));
        }
      } catch { /* 评论加载失败不影响主流程 */ }

      if (user) {
        profileForm.setFieldsValue({
          nickname: user.nickname || user.username,
          email: user.email || '',
          bio: user.bio || '',
        });
      }
    } catch (error: any) {
      message.error(error?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.warning('请上传图片文件');
      return false;
    }
    setUploading(true);
    try {
      const result = await fileApi.upload(file);
      if (result?.url) {
        // 更新头像
        const updatedUser = await userApi.updateProfile({ avatar: result.url });
        if (updatedUser) {
          setAuth(updatedUser, localStorage.getItem('token') || '');
        }
        message.success('头像更新成功');
      }
    } catch (err: any) {
      message.error('头像上传失败: ' + (err.message || '未知错误'));
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleProfileUpdate = async (values: any) => {
    setProfileLoading(true);
    try {
      const updatedUser = await userApi.updateProfile({
        email: values.email,
        password: values.password || undefined,
        nickname: values.nickname,
        bio: values.bio,
      });
      if (updatedUser) {
        setAuth(updatedUser, localStorage.getItem('token') || '');
      }
      message.success('个人信息更新成功');
    } catch (error: any) {
      message.error(error.message || '更新失败');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (rechargeAmount <= 0) {
      message.warning('请选择充值金额');
      return;
    }
    setRechargeLoading(true);
    try {
      const newBalance = await walletApi.recharge(rechargeAmount);
      setBalance(newBalance);
      message.success(`充值成功！当前余额：${newBalance} 积分`);
      setRechargeModal(false);
      setRechargeAmount(0);
    } catch (error: any) {
      message.error(error.message || '充值失败');
    } finally {
      setRechargeLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentApi.deleteComment(commentId);
      message.success('评论已删除');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  const tabItems = [
    {
      key: 'profile',
      label: <span><EditOutlined /> 个人资料</span>,
      children: (
        <Card>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar src={user?.avatar} size={96} icon={<UserOutlined />} style={{ border: '3px solid #f0f0f0' }} />
              <div style={{ marginTop: 8 }}>
                <Upload
                  beforeUpload={handleAvatarUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button size="small" icon={<UploadOutlined />} loading={uploading}>
                    更换头像
                  </Button>
                </Upload>
              </div>
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>{user?.nickname || user?.username}</Title>
              <Text type="secondary">@{user?.username}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{user?.role === 'ADMIN' ? '管理员' : '普通用户'}</Tag>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  加入于 {user?.createTime ? dayjs(user.createTime).format('YYYY-MM') : '未知'}
                </Text>
              </div>
            </div>
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card size="small"><Statistic title="文章" value={articles.length} prefix={<FileTextOutlined />} /></Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small"><Statistic title="评论" value={comments.length} prefix={<MessageOutlined />} /></Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small"><Statistic title="收藏" value={favoriteCount} prefix={<StarOutlined />} /></Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small"><Statistic title="关注" value={followingCount} prefix={<TeamOutlined />} /></Card>
            </Col>
          </Row>

          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="昵称" name="nickname">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="用户名">
                  <Input value={user?.username} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="邮箱" name="email" rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="个人简介" name="bio">
                  <Input.TextArea rows={3} maxLength={200} showCount />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="新密码" name="password">
                  <Input.Password placeholder="留空则保持当前密码" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={profileLoading} icon={<SafetyOutlined />}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'wallet',
      label: <span><WalletOutlined /> 我的钱包</span>,
      children: (
        <Card>
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Statistic
              title="当前余额"
              value={balance}
              prefix={<WalletOutlined style={{ color: '#faad14' }} />}
              suffix="积分"
              valueStyle={{ fontSize: 36, fontWeight: 'bold', color: '#faad14' }}
            />
            <div style={{ marginTop: 24 }}>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setRechargeModal(true)}>
                充值积分
              </Button>
            </div>
          </div>

          <Card title="充值方案" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              {[100, 500, 1000, 5000].map(amount => (
                <Col xs={12} sm={6} key={amount}>
                  <Card
                    hoverable
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => { setRechargeAmount(amount); setRechargeModal(true); }}
                  >
                    <Title level={3} style={{ color: '#faad14', margin: 0 }}>{amount}</Title>
                    <Text type="secondary">积分</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Card>
      ),
    },
    {
      key: 'articles',
      label: <span><FileTextOutlined /> 我的文章 ({articles.length})</span>,
      children: (
        <Card>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>共 {articles.length} 篇文章</Text>
            <Link to="/creator/articles/new">
              <Button type="primary" icon={<PlusOutlined />}>写文章</Button>
            </Link>
          </div>
          {articles.length === 0 ? (
            <Empty description="还没有发表文章">
              <Link to="/creator/articles/new"><Button type="primary">写第一篇</Button></Link>
            </Empty>
          ) : (
            <List
              dataSource={articles}
              renderItem={(article) => (
                <List.Item
                  actions={[
                    <Button key="view" type="link" size="small" onClick={() => navigate(`/article/${article.id}`)}>查看</Button>,
                    <Button key="edit" type="link" size="small" onClick={() => navigate(`/creator/articles/edit/${article.id}`)}>编辑</Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Link to={`/article/${article.id}`}>{article.title}</Link>
                        <Tag color={article.status === 'PUBLISHED' ? 'green' : 'orange'}>
                          {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space size="middle">
                        <Text type="secondary"><EyeOutlined /> {article.views}</Text>
                        <Text type="secondary"><LikeOutlined /> {article.likes}</Text>
                        <Text type="secondary"><ClockCircleOutlined /> {dayjs(article.createTime).format('YYYY-MM-DD')}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      ),
    },
    {
      key: 'comments',
      label: <span><MessageOutlined /> 我的评论 ({comments.length})</span>,
      children: (
        <Card>
          {comments.length === 0 ? (
            <Empty description="还没有发表过评论" />
          ) : (
            <List
              dataSource={comments.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="view" type="link" size="small" onClick={() => navigate(`/article/${item.articleId}`)}>
                      查看原文
                    </Button>,
                    <Button key="delete" type="link" size="small" danger icon={<DeleteOutlined />}
                      onClick={() => handleDeleteComment(item.id)}>
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.userAvatar} icon={<UserOutlined />} size={36} />}
                    title={
                      <Space>
                        <Text strong>{item.username}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(item.createTime).format('YYYY-MM-DD HH:mm')}
                        </Text>
                        <Tag color="blue" style={{ fontSize: 11 }}>文章 #{item.articleId}</Tag>
                      </Space>
                    }
                    description={
                      <Text style={{ whiteSpace: 'pre-wrap', color: '#666' }}>
                        {item.content}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ margin: 0 }}>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          会员中心
        </Title>
        <Space>
          <Text type="secondary">
            <WalletOutlined /> 余额: <Text strong style={{ color: '#faad14' }}>{balance}</Text> 积分
          </Text>
          <Button icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/'); }}>退出登录</Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="profile" items={tabItems} />

      <Modal
        title="充值积分"
        open={rechargeModal}
        onCancel={() => setRechargeModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setRechargeModal(false)}>取消</Button>,
          <Button key="pay" type="primary" loading={rechargeLoading} onClick={handleRecharge}>
            确认支付 {rechargeAmount} 积分
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <WalletOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
          <Title level={3}>充值积分</Title>
          <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
            {[100, 500, 1000, 5000].map(amount => (
              <Col span={6} key={amount}>
                <Card
                  hoverable
                  size="small"
                  style={{
                    textAlign: 'center',
                    borderColor: rechargeAmount === amount ? '#faad14' : undefined,
                    background: rechargeAmount === amount ? '#fffbe6' : undefined,
                  }}
                  onClick={() => setRechargeAmount(amount)}
                >
                  <Text strong style={{ fontSize: 18, color: '#faad14' }}>{amount}</Text>
                  <br />
                  <Text type="secondary">积分</Text>
                </Card>
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">模拟充值，无需真实支付</Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1000, margin: '0 auto', padding: '24px 0' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
};

export default MemberCenter;
