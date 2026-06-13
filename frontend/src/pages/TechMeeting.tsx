import { useState, useEffect } from 'react';
import { Card, Typography, Tag, Empty, App, Space, Button, Row, Col, Avatar, Spin, Input, Modal, Form, DatePicker, Select, Tabs, message as Msg } from 'antd';
import { CalendarOutlined, UserOutlined, TeamOutlined, VideoCameraOutlined, PlusOutlined, ClockCircleOutlined, EnvironmentOutlined, RightOutlined, SearchOutlined, HistoryOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { meetingApi, Meeting } from '@/api/meeting';
import { useAuthStore } from '@/store/auth';
import { categoryApi } from '@/api/category';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: '即将开始', color: '#1890ff' },
  ONGOING: { label: '进行中', color: '#52c41a' },
  ENDED: { label: '已结束', color: '#999' },
  CANCELLED: { label: '已取消', color: '#ff4d4f' },
};

const TechMeeting = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { isAuthenticated } = useAuthStore();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [myMeetings, setMyMeetings] = useState<Meeting[]>([]);
  const [joinedMeetings, setJoinedMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('browse');
  // 加入码弹窗
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinMeetingId, setJoinMeetingId] = useState<number | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    fetchMeetings();
    categoryApi.getAllCategories().then(setCategories).catch(() => {});
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const data = await meetingApi.getAll();
      setMeetings(data || []);
    } catch {
      message.error('加载会议列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMeetings = async () => {
    if (!isAuthenticated) return;
    try {
      const [mine, joined] = await Promise.all([
        meetingApi.getMyMeetings().catch(() => []),
        meetingApi.getJoinedMeetings().catch(() => []),
      ]);
      setMyMeetings(Array.isArray(mine) ? mine : []);
      setJoinedMeetings(Array.isArray(joined) ? joined : []);
    } catch { /* */ }
  };

  useEffect(() => {
    if (activeTab !== 'browse') fetchMyMeetings();
  }, [activeTab, isAuthenticated]);

  const handleJoinMeeting = (meetingId: number) => {
    setJoinMeetingId(meetingId);
    setJoinCode('');
    setJoinModalOpen(true);
  };

  const confirmJoin = async () => {
    if (!joinMeetingId) return;
    setJoinLoading(true);
    try {
      await meetingApi.join(joinMeetingId, joinCode || undefined);
      message.success('加入成功！');
      setJoinModalOpen(false);
      navigate(`/meeting/${joinMeetingId}`);
    } catch (err: any) {
      message.error(err.message || '加入失败');
    } finally {
      setJoinLoading(false);
    }
  };

  const filtered = meetings
    .filter(m => filter === 'all' || m.status === filter)
    .filter(m => !searchText || m.title.toLowerCase().includes(searchText.toLowerCase()));

  const handleCreate = async (values: any) => {
    if (!isAuthenticated) { message.warning('请先登录'); return; }
    setCreateLoading(true);
    try {
      const payload = {
        title: values.title,
        description: values.description || '',
        startTime: values.timeRange?.[0]?.toISOString(),
        endTime: values.timeRange?.[1]?.toISOString(),
        location: values.location || '',
        maxParticipants: values.maxParticipants || 50,
        categoryId: values.categoryId || null,
        tags: values.tags?.join(',') || '',
      };
      const meeting = await meetingApi.create(payload);
      message.success(`会议创建成功！加入码: ${meeting.joinCode || '无需验证'}`);
      setCreateOpen(false);
      form.resetFields();
      // 提示可复制加入码
      if (meeting.joinCode) {
        navigator.clipboard.writeText(meeting.joinCode).catch(() => {});
      }
      navigate(`/meeting/${meeting.id}`);
    } catch (err: any) {
      message.error(err.message || '创建失败');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="fade-in-up" style={styles.container}>
      {/* Banner */}
      <div style={styles.banner}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <VideoCameraOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
          <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 800, fontSize: 30 }}>技术会议</Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 8, display: 'block' }}>
            创建和参与技术分享、专题讨论、线上沙龙
          </Text>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => isAuthenticated ? setCreateOpen(true) : navigate('/login')}
            style={{ marginTop: 20, borderRadius: 10, height: 44, padding: '0 28px', fontWeight: 600, fontSize: 15, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
          >
            创建会议
          </Button>
        </div>
        {/* 装饰光晕 */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
      </div>

      <Tabs activeKey={activeTab} onChange={key => setActiveTab(key)} style={{ marginTop: 0 }}
        items={[
          {
            key: 'browse',
            label: <span><VideoCameraOutlined /> 浏览会议</span>,
            children: (
              <>
                {/* 搜索+筛选 */}
                <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space size={8} wrap>
          {[
            { key: 'all', label: '全部' },
            { key: 'UPCOMING', label: '即将开始' },
            { key: 'ONGOING', label: '进行中' },
            { key: 'ENDED', label: '已结束' },
          ].map(s => (
            <Button key={s.key} shape="round" type={filter === s.key ? 'primary' : 'default'} onClick={() => setFilter(s.key)} style={{ borderRadius: 20, fontSize: 13 }}>
              {s.label}
            </Button>
          ))}
        </Space>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索会议..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 240, borderRadius: 10 }}
          allowClear
        />
      </div>

      {/* 列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <Empty description="暂无会议" style={{ padding: 60 }}>
          <Button type="primary" onClick={() => isAuthenticated ? setCreateOpen(true) : navigate('/login')}>创建第一个会议</Button>
        </Empty>
      ) : (
        <Row gutter={[20, 20]}>
          {filtered.map(meeting => {
            const st = STATUS_MAP[meeting.status] || STATUS_MAP.UPCOMING;
            const isPast = meeting.status === 'ENDED' || meeting.status === 'CANCELLED';
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={meeting.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 14, overflow: 'hidden', height: '100%', border: '1px solid var(--color-border-light)', position: 'relative' }}
                  onClick={() => isPast ? navigate(`/meeting/${meeting.id}`) : handleJoinMeeting(meeting.id)}
                >
                  {/* 顶部渐变日期条 */}
                  <div style={{
                    background: isPast
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #ff6b00 0%, #ff8c38 50%, #ff6b00 100%)',
                    margin: -24, marginBottom: 16,
                    padding: '22px 24px', color: '#fff',
                  }}>
                    <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
                      {dayjs(meeting.startTime).format('MM月DD日')}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ClockCircleOutlined />
                      {dayjs(meeting.startTime).format('HH:mm')} - {meeting.endTime ? dayjs(meeting.endTime).format('HH:mm') : '待定'}
                    </div>
                    <Tag color={st.color} style={{ position: 'absolute', top: 12, right: 12, borderRadius: 10, fontSize: 11, border: 'none', fontWeight: 500 }}>
                      {st.label}
                    </Tag>
                  </div>

                  <Title level={5} style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }} ellipsis={{ rows: 2 }}>
                    {meeting.title}
                  </Title>

                  <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 12, lineHeight: 1.6, minHeight: 36 }}>
                    {(meeting.description || '暂无描述').substring(0, 80)}{(meeting.description?.length || 0) > 80 ? '...' : ''}
                  </Text>

                  {/* 地点 */}
                  {meeting.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <EnvironmentOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }} />
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis>{meeting.location}</Text>
                    </div>
                  )}

                  {/* 底栏 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border-light)', paddingTop: 12, marginTop: 4 }}>
                    <Space size={4}>
                      <TeamOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>{meeting.participantCount || 0}/{meeting.maxParticipants || '∞'} 人</Text>
                    </Space>
                    {meeting.joinCode && !isPast && (
                      <Tag icon={<KeyOutlined />} color="blue" style={{ fontSize: 10, borderRadius: 6 }}>{meeting.joinCode}</Tag>
                    )}
                    <Space>
                      <Button size="small" type={isPast ? 'default' : 'primary'} shape="round" style={{ fontSize: 12, height: 28 }}
                        onClick={(e) => { e.stopPropagation(); isPast ? navigate(`/meeting/${meeting.id}`) : handleJoinMeeting(meeting.id); }}>
                        {isPast ? '查看回放' : '进入'}
                      </Button>
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
            </>
          )
        },
        {
          key: 'mine',
          label: <span><UserOutlined /> 我创建的 ({myMeetings.length})</span>,
          children: (
            <div style={{ padding: '12px 0' }}>
              {myMeetings.length === 0 ? (
                <Empty description="还没有创建过会议" style={{ padding: 40 }}>
                  <Button type="primary" onClick={() => isAuthenticated ? setCreateOpen(true) : navigate('/login')}>创建会议</Button>
                </Empty>
              ) : (
                <Row gutter={[20, 20]}>
                  {myMeetings.map(meeting => (
                    <Col xs={24} sm={12} lg={8} key={meeting.id}>
                      <Card hoverable style={{ borderRadius: 14, overflow: 'hidden' }}
                        onClick={() => navigate(`/meeting/${meeting.id}`)}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#1a3a5c' }}>{meeting.title}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(meeting.startTime).format('MM-DD HH:mm')}</Text>
                        {meeting.joinCode && <Tag icon={<KeyOutlined />} color="blue" style={{ marginLeft: 8, fontSize: 10 }}>{meeting.joinCode}</Tag>}
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )
        },
        {
          key: 'joined',
          label: <span><TeamOutlined /> 我加入的 ({joinedMeetings.length})</span>,
          children: (
            <div style={{ padding: '12px 0' }}>
              {joinedMeetings.length === 0 ? (
                <Empty description="还没有加入过会议" style={{ padding: 40 }} />
              ) : (
                <Row gutter={[20, 20]}>
                  {joinedMeetings.map(meeting => (
                    <Col xs={24} sm={12} lg={8} key={meeting.id}>
                      <Card hoverable style={{ borderRadius: 14, overflow: 'hidden' }}
                        onClick={() => navigate(`/meeting/${meeting.id}`)}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#1a3a5c' }}>{meeting.title}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(meeting.startTime).format('MM-DD HH:mm')}</Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )
        },
      ]} />

      {/* 创建会议弹窗 */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 700 }}><VideoCameraOutlined style={{ marginRight: 8 }} />创建会议</span>}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        width={560}
        destroyOnHidden
        style={{ borderRadius: 16 }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} size="large" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="会议标题" rules={[{ required: true, message: '请输入会议标题' }]}>
            <Input placeholder="给会议起个名字" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="description" label="会议描述">
            <Input.TextArea rows={3} placeholder="会议内容介绍..." style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="timeRange" label="会议时间">
            <RangePicker showTime style={{ width: '100%', borderRadius: 10 }} placeholder={['开始时间', '结束时间']} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>不选择时间则创建后立即开始</Text>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="地点">
                <Input placeholder="线上/线下地址" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxParticipants" label="人数上限" initialValue={50}>
                <Select style={{ borderRadius: 10 }} options={[
                  { value: 10, label: '10人' }, { value: 20, label: '20人' },
                  { value: 50, label: '50人' }, { value: 100, label: '100人' },
                  { value: 200, label: '200人' }, { value: 500, label: '500人' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="分类">
                <Select allowClear placeholder="选择分类" style={{ borderRadius: 10 }}
                  options={categories.map(c => ({ label: c.name, value: c.id }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="标签">
                <Select mode="tags" placeholder="输入标签" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginTop: 8 }}>
            <Space style={{ width: '100%' }} direction="vertical">
              <Button type="primary" htmlType="submit" loading={createLoading} block style={{ height: 46, borderRadius: 10, fontWeight: 600, fontSize: 15 }}>
                创建并进入会议
              </Button>
              <Button block style={{ height: 46, borderRadius: 10, fontWeight: 500, fontSize: 14 }}
                onClick={() => {
                  form.setFieldsValue({
                    timeRange: [dayjs(), dayjs().add(1, 'hour')]
                  });
                  form.submit();
                }} loading={createLoading}>
                快速创建（立即开始）
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 加入码弹窗 */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 700 }}><KeyOutlined style={{ marginRight: 8 }} />输入加入码</span>}
        open={joinModalOpen}
        onCancel={() => setJoinModalOpen(false)}
        footer={null}
        width={400}
        destroyOnHidden
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <KeyOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
          <p style={{ color: '#666', marginBottom: 20 }}>请输入会议加入码以加入会议</p>
          <Input
            size="large"
            placeholder="6位数字加入码"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8, borderRadius: 10, height: 50 }}
            maxLength={6}
            onPressEnter={confirmJoin}
            prefix={<KeyOutlined />}
          />
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <Button block onClick={() => setJoinModalOpen(false)} style={{ borderRadius: 10, height: 44 }}>取消</Button>
            <Button type="primary" block onClick={confirmJoin} loading={joinLoading} style={{ borderRadius: 10, height: 44, fontWeight: 600 }}>
              加入会议
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100%' },
  banner: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    borderRadius: 16, padding: '44px 36px', marginBottom: 28, position: 'relative', overflow: 'hidden',
  },
};

export default TechMeeting;
