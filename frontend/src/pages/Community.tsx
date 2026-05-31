import { Card, List, Typography, Button, Tag, Space, Avatar, Empty, Spin, App } from 'antd';
import { TeamOutlined, MessageOutlined, HeartOutlined, StarOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title, Text, Paragraph } = Typography;

interface Community {
  id: number;
  name: string;
  description: string;
  avatar: string;
  members: number;
  posts: number;
  category: string;
  isFollowing: boolean;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  community: string;
  likes: number;
  comments: number;
  createTime: string;
}

const Community = () => {
  const { message } = App.useApp();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'communities' | 'posts'>('communities');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const mockCommunities: Community[] = [
        {
          id: 1,
          name: '高通开发者中文社区',
          description: '高通开发者社区，交流骁龙系列芯片开发经验',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qualcomm',
          members: 125400,
          posts: 8950,
          category: '硬件',
          isFollowing: false,
        },
        {
          id: 2,
          name: 'NVIDIA AI技术专区',
          description: 'NVIDIA AI技术交流，讨论CUDA、深度学习最新技术',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nvidia',
          members: 98300,
          posts: 7230,
          category: 'AI',
          isFollowing: true,
        },
        {
          id: 3,
          name: 'HarmonyOS开发者社区',
          description: '鸿蒙系统开发技术交流，分享HarmonyOS应用开发经验',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harmony',
          members: 234500,
          posts: 15680,
          category: '移动开发',
          isFollowing: false,
        },
        {
          id: 4,
          name: 'Java技术交流圈',
          description: 'Java技术交流，包括Spring、MyBatis等主流框架',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=java',
          members: 456200,
          posts: 34210,
          category: '后端',
          isFollowing: true,
        },
        {
          id: 5,
          name: 'Python爱好者社区',
          description: 'Python编程交流，数据分析、机器学习、爬虫等',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=python',
          members: 389100,
          posts: 28760,
          category: '后端',
          isFollowing: false,
        },
        {
          id: 6,
          name: '前端开发联盟',
          description: 'React、Vue、Angular等前端技术交流',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frontend',
          members: 298700,
          posts: 21340,
          category: '前端',
          isFollowing: false,
        },
      ];

      const mockPosts: Post[] = [
        {
          id: 1,
          title: '如何在HarmonyOS上开发一个时钟应用',
          content: '本文将详细介绍如何在HarmonyOS上开发一个精美的时钟应用...',
          author: '鸿蒙开发者',
          authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
          community: 'HarmonyOS开发者社区',
          likes: 234,
          comments: 45,
          createTime: '2小时前',
        },
        {
          id: 2,
          title: 'CUDA 12.0新特性解析',
          content: 'CUDA 12.0带来了许多新特性，本文将深入解析这些变化...',
          author: 'NVIDIA研究员',
          authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
          community: 'NVIDIA AI技术专区',
          likes: 567,
          comments: 89,
          createTime: '5小时前',
        },
        {
          id: 3,
          title: 'Spring Boot 3.0实战指南',
          content: 'Spring Boot 3.0正式发布，新版本有哪些变化？',
          author: 'Java架构师',
          authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
          community: 'Java技术交流圈',
          likes: 890,
          comments: 123,
          createTime: '1天前',
        },
      ];

      setCommunities(mockCommunities);
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to fetch community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = (communityId: number) => {
    setCommunities(communities.map(c =>
      c.id === communityId ? { ...c, isFollowing: !c.isFollowing } : c
    ));
    const community = communities.find(c => c.id === communityId);
    if (community) {
      message.success(community.isFollowing ? '已取消关注' : '关注成功');
    }
  };

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
        <Title level={2} style={{ margin: 0 }}>社区</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          创建社区
        </Button>
      </div>

      <div style={styles.tabs}>
        <Button
          type={activeTab === 'communities' ? 'primary' : 'default'}
          icon={<TeamOutlined />}
          onClick={() => setActiveTab('communities')}
        >
          推荐社区
        </Button>
        <Button
          type={activeTab === 'posts' ? 'primary' : 'default'}
          icon={<MessageOutlined />}
          onClick={() => setActiveTab('posts')}
        >
          精选帖子
        </Button>
      </div>

      {activeTab === 'communities' ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={communities}
          renderItem={(community) => (
            <List.Item>
              <Card hoverable style={styles.communityCard}>
                <div style={styles.cardHeader}>
                  <Avatar src={community.avatar} size={64} />
                  <Tag color="blue">{community.category}</Tag>
                </div>
                <Title level={4} style={{ marginTop: 16 }}>{community.name}</Title>
                <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666' }}>
                  {community.description}
                </Paragraph>
                <div style={styles.cardMeta}>
                  <Space size="large">
                    <span>成员 {community.members.toLocaleString()}</span>
                    <span>帖子 {community.posts.toLocaleString()}</span>
                  </Space>
                </div>
                <Button
                  type={community.isFollowing ? 'default' : 'primary'}
                  block
                  style={{ marginTop: 16 }}
                  onClick={() => handleFollow(community.id)}
                >
                  {community.isFollowing ? '已关注' : '关注'}
                </Button>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <List
          dataSource={posts}
          renderItem={(post) => (
            <List.Item style={styles.postItem}>
              <Card hoverable style={{ width: '100%' }}>
                <div style={styles.postHeader}>
                  <Avatar src={post.authorAvatar} />
                  <div style={styles.postAuthor}>
                    <Text strong>{post.author}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>发布于 {post.community}</Text>
                  </div>
                </div>
                <Title level={4} style={{ marginTop: 16 }}>{post.title}</Title>
                <Paragraph ellipsis={{ rows: 3 }} style={{ color: '#666' }}>
                  {post.content}
                </Paragraph>
                <div style={styles.postFooter}>
                  <Space>
                    <span><HeartOutlined /> {post.likes}</span>
                    <span><MessageOutlined /> {post.comments}</span>
                    <Text type="secondary">{post.createTime}</Text>
                  </Space>
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
  container: {
    background: '#fff',
    borderRadius: 8,
    padding: 24,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tabs: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
  },
  communityCard: {
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardMeta: {
    color: '#999',
    fontSize: 13,
    marginTop: 12,
  },
  postItem: {
    padding: '16px 0',
  },
  postHeader: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  postAuthor: {
    display: 'flex',
    flexDirection: 'column',
  },
  postFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1px solid #f0f0f0',
  },
};

export default Community;
