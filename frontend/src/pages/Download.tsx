import { Card, List, Typography, Button, Tag, Space, message, Empty, Spin, Rate } from 'antd';
import { DownloadOutlined, StarOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title, Text, Paragraph } = Typography;

interface DownloadItem {
  id: number;
  title: string;
  description: string;
  category: string;
  size: string;
  downloads: number;
  rating: number;
  icon: string;
  fileUrl: string;
}

const Download = () => {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchDownloadItems();
  }, []);

  const fetchDownloadItems = async () => {
    setLoading(true);
    try {
      const mockItems: DownloadItem[] = [
        {
          id: 1,
          title: 'Java核心技术卷',
          description: 'Java核心技术卷I和卷II，涵盖Java语言的所有核心知识点，适合Java初学者和进阶开发者。',
          category: 'Java',
          size: '25.6 MB',
          downloads: 15420,
          rating: 4.8,
          icon: '☕',
          fileUrl: '#',
        },
        {
          id: 2,
          title: 'Python编程：从入门到实践',
          description: 'Python编程经典教材，附带大量实战项目，帮助你快速掌握Python开发。',
          category: 'Python',
          size: '18.3 MB',
          downloads: 23150,
          rating: 4.9,
          icon: '🐍',
          fileUrl: '#',
        },
        {
          id: 3,
          title: 'Spring Boot实战',
          description: 'Spring Boot实战指南，包含完整的项目案例和最佳实践。',
          category: 'Java',
          size: '32.1 MB',
          downloads: 12380,
          rating: 4.7,
          icon: '🍃',
          fileUrl: '#',
        },
        {
          id: 4,
          title: 'React进阶之路',
          description: 'React进阶指南，深入讲解React生态系统和高级特性。',
          category: '前端',
          size: '15.7 MB',
          downloads: 9870,
          rating: 4.6,
          icon: '⚛️',
          fileUrl: '#',
        },
        {
          id: 5,
          title: '算法竞赛入门经典',
          description: '算法竞赛入门经典教材，涵盖基础算法和数据结构。',
          category: '算法',
          size: '28.4 MB',
          downloads: 18290,
          rating: 4.8,
          icon: '🏆',
          fileUrl: '#',
        },
        {
          id: 6,
          title: '机器学习实战',
          description: '机器学习实战指南，包含Scikit-Learn和TensorFlow实战案例。',
          category: 'AI',
          size: '42.5 MB',
          downloads: 25670,
          rating: 4.9,
          icon: '🤖',
          fileUrl: '#',
        },
      ];
      setItems(mockItems);
    } catch (error) {
      console.error('Failed to fetch download items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item: DownloadItem) => {
    message.success(`开始下载: ${item.title}`);
  };

  const categories = ['全部', 'Java', 'Python', '前端', '算法', 'AI'];
  const filteredItems = selectedCategory && selectedCategory !== '全部'
    ? items.filter(item => item.category === selectedCategory)
    : items;

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
        <Title level={2} style={{ margin: 0 }}>下载中心</Title>
      </div>

      <div style={styles.categories}>
        <Space wrap>
          {categories.map((cat) => (
            <Tag
              key={cat}
              style={{
                padding: '6px 16px',
                cursor: 'pointer',
                fontSize: 14,
                background: selectedCategory === cat || (cat === '全部' && !selectedCategory) ? '#1890ff' : '#f5f5f5',
                color: selectedCategory === cat || (cat === '全部' && !selectedCategory) ? '#fff' : '#666',
                border: 'none',
              }}
              onClick={() => setSelectedCategory(cat === '全部' ? null : cat)}
            >
              {cat}
            </Tag>
          ))}
        </Space>
      </div>

      {filteredItems.length === 0 ? (
        <Empty description="暂无下载资源" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
          dataSource={filteredItems}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.iconBox}>
                    <span style={{ fontSize: 32 }}>{item.icon}</span>
                  </div>
                  <div style={styles.cardTitle}>
                    <Title level={4} style={{ margin: 0 }}>{item.title}</Title>
                    <Tag color="blue">{item.category}</Tag>
                  </div>
                </div>
                <Paragraph ellipsis={{ rows: 2 }} style={{ margin: '16px 0', color: '#666' }}>
                  {item.description}
                </Paragraph>
                <div style={styles.cardMeta}>
                  <Space size="large">
                    <span style={styles.metaItem}>
                      <DownloadOutlined /> {item.downloads.toLocaleString()}
                    </span>
                    <span style={styles.metaItem}>
                      <FileTextOutlined /> {item.size}
                    </span>
                    <span style={styles.metaItem}>
                      <StarOutlined /> {item.rating}
                    </span>
                  </Space>
                </div>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  size="large"
                  block
                  style={{ marginTop: 16 }}
                  onClick={() => handleDownload(item)}
                >
                  下载
                </Button>
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
    marginBottom: 24,
  },
  categories: {
    marginBottom: 24,
    padding: 16,
    background: '#f5f5f5',
    borderRadius: 8,
  },
  card: {
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  iconBox: {
    width: 64,
    height: 64,
    background: '#f0f0f0',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
  },
  cardMeta: {
    color: '#999',
    fontSize: 13,
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
};

export default Download;
