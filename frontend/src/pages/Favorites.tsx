import { useEffect, useState } from 'react';
import { Card, List, Typography, Empty, Spin, Button, Space, App, Pagination, Modal, Input, Tag, Select,   } from 'antd';
import { LikeOutlined, EyeOutlined, DeleteOutlined, StarFilled, MessageOutlined, ClockCircleOutlined, FolderOutlined, PlusOutlined, FolderViewOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { favoriteApi } from '@/api/favorite';
import { useAuthStore } from '@/store/auth';
import { Article } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Favorites = () => {
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [favTotal, setFavTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [collections, setCollections] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const { isAuthenticated } = useAuthStore();
  const { message } = App.useApp();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections();
      fetchFavorites(1, '');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async (pageNum: number, collectionName?: string) => {
    setLoading(true);
    try {
      const res = await favoriteApi.getMyFavorites(pageNum, 10, collectionName || undefined);
      setFavorites(res?.records || []);
      setFavTotal(res?.total || 0);
      setPage(pageNum);
    } catch (error) {
      message.error('加载收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await favoriteApi.getCollections();
      setCollections(res || []);
    } catch { /* */ }
  };

  const switchCollection = (name: string) => {
    setActiveCollection(name);
    fetchFavorites(1, name);
  };

  const handleAddCollection = async () => {
    if (!newCollectionName.trim()) return;
    setCollections(prev => [...prev, newCollectionName.trim()]);
    setNewCollectionName('');
    setAddModalOpen(false);
    message.success('收藏夹已创建');
  };

  const handleRemoveFavorite = async (articleId: number) => {
    try {
      await favoriteApi.removeFavorite(articleId);
      message.success('取消收藏成功');
      fetchFavorites(page, activeCollection);
      fetchCollections();
    } catch (error) {
      message.error('取消收藏失败');
    }
  };

  const handleMoveToCollection = async (articleId: number) => {
    let name = '';
    Modal.confirm({
      title: '移动收藏到分类',
      content: (
        <div>
          <Select
            style={{ width: '100%' }}
            placeholder="选择或输入新分类"
            mode="tags"
            maxCount={1}
            onChange={(val: string[]) => { name = val[0] || ''; }}
            options={collections.map(c => ({ value: c, label: c }))}
          />
        </div>
      ),
      onOk: async () => {
        if (name) {
          await favoriteApi.updateCollection(articleId, name);
          message.success('移动成功');
          fetchFavorites(page, activeCollection);
          fetchCollections();
        }
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <Card style={{ borderRadius: 12 }}>
          <div style={{ textAlign: 'center', padding: 48 }}>
            <StarFilled style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }} />
            <Text type="secondary" style={{ fontSize: 16, display: 'block' }}>请先登录后查看收藏</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <Title level={2} style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarFilled style={{ color: '#faad14' }} />
          我的收藏
        </Title>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧分类栏 */}
        <Card style={{ width: 200, borderRadius: 12, border: '1px solid var(--color-border-light)', flexShrink: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 13, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>分类</Text>
          </div>
          <div
            onClick={() => switchCollection('')}
            style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: !activeCollection ? 'var(--color-primary-bg)' : 'transparent', color: !activeCollection ? 'var(--color-primary)' : 'var(--color-text-primary)', fontWeight: !activeCollection ? 600 : 400 }}
          >
            <FolderViewOutlined style={{ marginRight: 8 }} />全部 ({favTotal})
          </div>
          {collections.map(name => (
            <div
              key={name}
              onClick={() => switchCollection(name)}
              style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: activeCollection === name ? 'var(--color-primary-bg)' : 'transparent', color: activeCollection === name ? 'var(--color-primary)' : 'var(--color-text-primary)', fontWeight: activeCollection === name ? 600 : 400 }}
            >
              <FolderOutlined style={{ marginRight: 8 }} />{name}
            </div>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ marginTop: 8, borderRadius: 8, fontSize: 12 }}>
            新建分类
          </Button>
        </Card>

        {/* 右侧列表 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
            <Spin spinning={loading}>
              <List
                dataSource={favorites}
                locale={{ emptyText: (
                  <div style={{ padding: 48 }}>
                    <StarFilled style={{ fontSize: 48, color: '#eee', display: 'block', marginBottom: 16 }} />
                    <Empty description={activeCollection ? `"${activeCollection}" 中没有文章` : '暂无收藏文章'} />
                  </div>
                )}}
                renderItem={(article) => (
                  <List.Item
                    style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
                    actions={[
                      <Button type="link" size="small" onClick={() => handleMoveToCollection(article.id)} key="move" style={{ borderRadius: 6 }}>
                        分类
                      </Button>,
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveFavorite(article.id)} key="remove" style={{ borderRadius: 6 }}>
                        取消收藏
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Link to={`/article/${article.id}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {article.title}
                        </Link>
                      }
                      description={
                        <Space wrap>
                          <Text type="secondary" ellipsis style={{ maxWidth: 400 }}>
                            {article.summary || '暂无摘要'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EyeOutlined style={{ marginRight: 4 }} />
                            {article.views || 0}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <LikeOutlined style={{ marginRight: 4 }} />
                            {article.likes || 0}
                          </Text>
                          <MessageOutlined style={{ marginRight: 4 }} />
                          {article.commentCount || 0}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {article.createTime ? dayjs(article.createTime).format('MM-DD') : ''}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              {favTotal > 10 && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <Pagination
                    current={page}
                    total={favTotal}
                    pageSize={10}
                    showSizeChanger={false}
                    onChange={(p) => fetchFavorites(p, activeCollection)}
                  />
                </div>
              )}
            </Spin>
          </Card>
        </div>
      </div>

      <Modal title="新建收藏分类" open={addModalOpen} onOk={handleAddCollection} onCancel={() => setAddModalOpen(false)} okText="创建" cancelText="取消">
        <Input placeholder="输入分类名称..." value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)} style={{ borderRadius: 8 }} />
      </Modal>
    </div>
  );
};

export default Favorites;