import { useEffect, useState } from 'react';
import { Badge, Dropdown, List, Typography, Button, Space, App, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { notificationApi, Notification } from '@/api/notification';
import { useAuthStore } from '@/store/auth';
import dayjs from 'dayjs';

const { Text } = Typography;

const NotificationBell = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const timer = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(timer);
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count ?? 0);
    } catch { /* */ }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications(1, 10);
      setNotifications(res?.records || []);
    } catch { /* */ } finally {
      setLoading(false);
    }
  };

  const handleOpen = (visible: boolean) => {
    setOpen(visible);
    if (visible) fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      message.success('全部标记为已读');
    } catch { /* */ }
  };

  const handleClick = async (item: Notification) => {
    if (!item.isRead) {
      await notificationApi.markAsRead(item.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (item.relatedArticleId) {
      navigate(`/article/${item.relatedArticleId}`);
    }
  };

  const typeLabels: Record<string, string> = {
    COMMENT: '评论了你的文章',
    REPLY: '回复了你的评论',
    LIKE: '赞了你的文章',
    FOLLOW: '关注了你',
  };

  return (
    <Dropdown
      open={open}
      onOpenChange={handleOpen}
      dropdownRender={() => (
        <div style={{ width: 340, maxHeight: 480, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 15 }}>通知</Text>
            {unreadCount > 0 && (
              <Button type="link" size="small" icon={<CheckOutlined />} onClick={handleMarkAllRead} style={{ fontSize: 12 }}>
                全部已读
              </Button>
            )}
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <Spin spinning={loading}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#bbb' }}>暂无通知</div>
              ) : (
                <List
                  dataSource={notifications}
                  renderItem={(item) => (
                    <List.Item
                      onClick={() => handleClick(item)}
                      style={{ padding: '10px 16px', cursor: 'pointer', background: item.isRead ? '#fff' : '#fff7e6', borderBottom: '1px solid #f5f5f5' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 13, color: item.isRead ? '#666' : '#1a1a1a', fontWeight: item.isRead ? 400 : 500 }}>
                          {typeLabels[item.type] || item.type}
                        </Text>
                        <Text ellipsis style={{ display: 'block', fontSize: 12, color: '#999', marginTop: 2 }}>
                          {item.content?.substring(0, 60)}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#ccc' }}>{dayjs(item.createTime).format('MM-DD HH:mm')}</Text>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </div>
        </div>
      )}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button type="text" size="large" style={{ fontSize: 18, color: 'var(--color-text-secondary)' }}>
          <BellOutlined />
        </Button>
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
