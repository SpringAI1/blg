import { Card, List, Typography, Button, Tag, Space, Switch, Empty, Spin, App } from 'antd';
import { BellOutlined, MailOutlined, TeamOutlined, MessageOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title, Text } = Typography;

interface Subscription {
  id: number;
  name: string;
  description: string;
  type: 'community' | 'author' | 'tag' | 'category';
  icon: string;
  isSubscribed: boolean;
}

const Subscribe = () => {
  const { message } = App.useApp();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const mockData: Subscription[] = [
        {
          id: 1,
          name: 'HarmonyOS开发者社区',
          description: '获取最新HarmonyOS技术文章和活动通知',
          type: 'community',
          icon: '🐛',
          isSubscribed: true,
        },
        {
          id: 2,
          name: 'NVIDIA AI技术专区',
          description: 'CUDA和深度学习最新技术动态',
          type: 'community',
          icon: '🟢',
          isSubscribed: true,
        },
        {
          id: 3,
          name: 'Java技术交流圈',
          description: 'Java技术文章推送',
          type: 'community',
          icon: '☕',
          isSubscribed: false,
        },
        {
          id: 4,
          name: 'Python爱好者社区',
          description: 'Python数据分析、机器学习相关文章',
          type: 'community',
          icon: '🐍',
          isSubscribed: true,
        },
        {
          id: 5,
          name: '人工智能',
          description: 'AI、机器学习、深度学习相关内容',
          type: 'tag',
          icon: '🤖',
          isSubscribed: true,
        },
        {
          id: 6,
          name: 'Java',
          description: 'Java技术栈相关内容',
          type: 'tag',
          icon: '☕',
          isSubscribed: false,
        },
        {
          id: 7,
          name: 'Spring Boot',
          description: 'Spring Boot实战文章',
          type: 'tag',
          icon: '🍃',
          isSubscribed: false,
        },
        {
          id: 8,
          name: '前端开发',
          description: 'React、Vue等前端技术',
          type: 'tag',
          icon: '⚛️',
          isSubscribed: true,
        },
      ];
      setSubscriptions(mockData);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: number) => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === id ? { ...sub, isSubscribed: !sub.isSubscribed } : sub
    ));
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      message.success(sub.isSubscribed ? '已取消订阅' : '订阅成功');
    }
  };

  const getTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      community: '社区',
      author: '作者',
      tag: '标签',
      category: '分类',
    };
    return typeMap[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'community':
        return <TeamOutlined />;
      case 'author':
        return <MessageOutlined />;
      case 'tag':
        return <BellOutlined />;
      case 'category':
        return <MailOutlined />;
      default:
        return <BellOutlined />;
    }
  };

  const communities = subscriptions.filter(s => s.type === 'community');
  const tags = subscriptions.filter(s => s.type === 'tag');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ margin: 0 }}>订阅管理</Title>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={styles.cardHeader}>
          <Text strong>我的订阅</Text>
          <Text type="secondary">
            已订阅 {subscriptions.filter(s => s.isSubscribed).length} 个项目
          </Text>
        </div>
      </Card>

      <Title level={4}>社区订阅</Title>
      {communities.length === 0 ? (
        <Empty description="暂无社区订阅" />
      ) : (
        <List
          dataSource={communities}
          renderItem={(sub) => (
            <List.Item
              style={styles.listItem}
              actions={[
                <Switch
                  key="switch"
                  checked={sub.isSubscribed}
                  onChange={() => handleToggle(sub.id)}
                />
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={styles.iconBox}>
                    <span style={{ fontSize: 24 }}>{sub.icon}</span>
                  </div>
                }
                title={sub.name}
                description={sub.description}
              />
            </List.Item>
          )}
        />
      )}

      <Title level={4} style={{ marginTop: 32 }}>标签订阅</Title>
      {tags.length === 0 ? (
        <Empty description="暂无标签订阅" />
      ) : (
        <List
          dataSource={tags}
          renderItem={(sub) => (
            <List.Item
              style={styles.listItem}
              actions={[
                <Switch
                  key="switch"
                  checked={sub.isSubscribed}
                  onChange={() => handleToggle(sub.id)}
                />
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={styles.tagIcon}>
                    <Tag color="blue">{sub.icon}</Tag>
                  </div>
                }
                title={<Space>{sub.name} <Tag>{getTypeName(sub.type)}</Tag></Space>}
                description={sub.description}
              />
            </List.Item>
          )}
        />
      )}
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
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    padding: '12px 0',
  },
  iconBox: {
    width: 48,
    height: 48,
    background: '#f5f5f5',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagIcon: {
    display: 'flex',
    alignItems: 'center',
  },
};

export default Subscribe;
