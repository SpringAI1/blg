import { useEffect, useState } from 'react';
import {
  List,
  Card,
  Tag,
  Button,
  Input,
  Space,
  Spin,
  App,
  Pagination,
  Rate,
  Badge,
  Modal,
  Descriptions,
  Typography
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  FileTextOutlined,
  EyeOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import {
  downloadApi,
  DownloadCategory,
  DownloadResource
} from '@/api/download';

const { Search } = Input;

const DownloadPage = () => {
  const { message } = App.useApp();
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  const [resources, setResources] = useState<DownloadResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailModal, setDetailModal] = useState<DownloadResource | null>(null);
  const pageSize = 12;

  useEffect(() => {
    fetchCategories();
    fetchResources(1, null, '');
  }, []);

  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const result = await downloadApi.getCategories();
      setCategories(result || []);
    } catch (error) {
      console.error('获取分类失败:', error);
      message.error('获取分类失败');
      setCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchResources = async (page: number, categoryId: number | null, kw: string) => {
    setLoading(true);
    try {
      const result = await downloadApi.getResources(page, pageSize, categoryId || undefined, kw);
      setResources(result?.records || []);
      setTotal(result?.total || 0);
    } catch (error) {
      console.error('获取资源失败:', error);
      message.error('获取资源失败');
      setResources([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    fetchResources(1, categoryId, keyword);
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
    fetchResources(1, selectedCategory, value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResources(page, selectedCategory, keyword);
  };

  const handleDownload = async (resource: DownloadResource) => {
    try {
      await downloadApi.recordDownload(resource.id);
      downloadApi.redirectToDownload(resource.id);
      message.success('开始下载');
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败');
    }
  };

  return (
    <div style={styles.container}>
      {/* 顶部标题和搜索 */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>下载中心</h2>
          <p style={styles.subtitle}>海量编程资料，免费下载学习</p>
        </div>
        <Search
          placeholder="搜索你需要的资源..."
          allowClear
          enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
          size="large"
          onSearch={handleSearch}
          style={styles.searchBox}
        />
      </div>

      <div style={styles.mainContent}>
        {/* 左侧分类 */}
        <div style={styles.sidebar}>
          <Card title="资源分类" style={styles.categoryCard}>
            <div style={styles.categoryList}>
              <div
                style={{
                  ...styles.categoryItem,
                  ...(selectedCategory === null ? styles.categoryItemActive : {})
                }}
                onClick={() => handleCategoryClick(null)}
              >
                <span style={styles.categoryIcon}>📚</span>
                <span>全部</span>
              </div>
              {categoryLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : (
                categories.map(category => (
                  <div
                    key={category.id}
                    style={{
                      ...styles.categoryItem,
                      ...(selectedCategory === category.id ? styles.categoryItemActive : {})
                    }}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <span style={styles.categoryIcon}>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* 热门下载 */}
          <Card title="热门下载" style={{ marginTop: 16 }}>
            <List
              dataSource={resources.slice(0, 5)}
              renderItem={(item, index) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <span style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      backgroundColor: index < 3 ? '#fc5531' : '#e8e8ed',
                      color: index < 3 ? '#fff' : '#999',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </span>
                    <span style={{
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: 13
                    }}>
                      {item.title}
                    </span>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* 右侧资源列表 */}
        <div style={styles.contentArea}>
          {/* 筛选和排序 */}
          <Card style={{ marginBottom: 16 }}>
            <Space>
              <span style={{ color: '#999' }}>排序：</span>
              <Button type="primary" size="small">最新发布</Button>
              <Button size="small">下载最多</Button>
              <Button size="small">评分最高</Button>
              <Button size="small">浏览最多</Button>
            </Space>
          </Card>

          {/* 资源网格 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <div style={styles.resourceGrid}>
                {resources.map(resource => (
                  <Card
                    key={resource.id}
                    hoverable
                    style={styles.resourceCard}
                    onClick={() => setDetailModal(resource)}
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(resource)}
                      >
                        立即下载
                      </Button>
                    ]}
                  >
                    <div style={styles.cardTop}>
                      <div style={styles.iconBox}>
                        <span style={{ fontSize: 32 }}>{resource.icon || '📄'}</span>
                      </div>
                      <div style={styles.cardInfo}>
                        <h4 style={styles.resourceTitle}>{resource.title}</h4>
                        <p style={styles.resourceDesc}>{resource.description}</p>
                      </div>
                    </div>

                    <div style={styles.cardMeta}>
                      <Space size="middle" style={{ marginBottom: 12 }}>
                        {resource.categoryName && (
                          <Tag color="blue">{resource.categoryName}</Tag>
                        )}
                        {resource.fileType && (
                          <Tag color="orange">{resource.fileType}</Tag>
                        )}
                        {resource.isFree ? (
                          <Tag color="success">免费</Tag>
                        ) : (
                          <Tag color="red">¥{resource.price}</Tag>
                        )}
                      </Space>

                      <div style={styles.stats}>
                        <span style={styles.statItem}>
                          <FileTextOutlined /> {resource.fileSize}
                        </span>
                        <span style={styles.statItem}>
                          <DownloadOutlined /> {resource.downloadCount.toLocaleString()}
                        </span>
                        <span style={styles.statItem}>
                          <EyeOutlined /> {resource.views.toLocaleString()}
                        </span>
                        <Rate
                          disabled
                          allowHalf
                          value={resource.rating}
                          style={{ fontSize: 12 }}
                        />
                        <span style={{ color: '#999', fontSize: 12 }}>
                          ({resource.ratingCount})
                        </span>
                      </div>
                    </div>

                    {resource.tagList && resource.tagList.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <Space wrap size={[4, 4]}>
                          {resource.tagList.map((tag, index) => (
                            <Tag key={index} style={{ fontSize: 11 }}>
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {total > 0 && (
                <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 24 }}>
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `第 ${range[0]}-${range[1]} 个，共 ${total} 个资源`
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 资源详情弹窗 */}
      <Modal
        title={detailModal?.title || '资源详情'}
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(null)}>关闭</Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}
            onClick={() => { if (detailModal) handleDownload(detailModal); setDetailModal(null); }}>
            立即下载
          </Button>,
        ]}
        width={700}
      >
        {detailModal && (
          <div style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'center' }}>
              <div style={{ fontSize: 48, width: 80, height: 80, background: '#f5f5f5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {detailModal.icon || '📄'}
              </div>
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>{detailModal.title}</Typography.Title>
                <Space style={{ marginTop: 8 }}>
                  {detailModal.categoryName && <Tag color="blue">{detailModal.categoryName}</Tag>}
                  {detailModal.fileType && <Tag color="orange">{detailModal.fileType}</Tag>}
                  <Tag color={detailModal.isFree ? 'success' : 'red'}>
                    {detailModal.isFree ? '免费' : `¥${detailModal.price}`}
                  </Tag>
                </Space>
              </div>
            </div>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="文件大小">{detailModal.fileSize || '未知'}</Descriptions.Item>
              <Descriptions.Item label="文件类型">{detailModal.fileType || '未知'}</Descriptions.Item>
              <Descriptions.Item label="下载次数">{detailModal.downloadCount?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="浏览次数">{detailModal.views?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="评分">
                <Rate disabled allowHalf value={detailModal.rating} style={{ fontSize: 14 }} />
                <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>({detailModal.ratingCount}人评价)</span>
              </Descriptions.Item>
              <Descriptions.Item label="链接">{detailModal.fileUrl}</Descriptions.Item>
            </Descriptions>
            {detailModal.description && (
              <div style={{ marginTop: 16 }}>
                <Typography.Title level={5}>资源简介</Typography.Title>
                <Typography.Paragraph style={{ color: '#666', lineHeight: 1.8 }}>
                  {detailModal.description}
                </Typography.Paragraph>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f5f6f7',
    minHeight: '100%',
    padding: '24px 0',
  } as const,
  header: {
    maxWidth: 1200,
    margin: '0 auto 24px',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap' as const,
    gap: 16,
  } as const,
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: '#222226',
    margin: 0,
  } as const,
  subtitle: {
    fontSize: 14,
    color: '#999',
    margin: '8px 0 0',
  } as const,
  searchBox: {
    width: 400,
  } as const,
  mainContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    gap: 24,
  } as const,
  sidebar: {
    width: 240,
    flexShrink: 0 as const,
  } as const,
  categoryCard: {
    borderRadius: 8,
  } as const,
  categoryList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  } as const,
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#666',
  } as const,
  categoryItemActive: {
    backgroundColor: '#fff1f0',
    color: '#fc5531',
    fontWeight: 500,
  } as const,
  categoryIcon: {
    fontSize: 18,
  } as const,
  contentArea: {
    flex: 1,
  } as const,
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  } as const,
  resourceCard: {
    borderRadius: 8,
    overflow: 'hidden',
  } as const,
  cardTop: {
    display: 'flex',
    gap: 12,
    marginBottom: 12,
  } as const,
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as const,
  cardInfo: {
    flex: 1,
    minWidth: 0,
  } as const,
  resourceTitle: {
    fontSize: 15,
    fontWeight: 500,
    color: '#222226',
    margin: '0 0 8px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as const,
  resourceDesc: {
    fontSize: 12,
    color: '#999',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  } as const,
  cardMeta: {
    paddingTop: 12,
    borderTop: '1px solid #f0f0f0',
  } as const,
  stats: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 16,
    alignItems: 'center',
  } as const,
  statItem: {
    fontSize: 12,
    color: '#999',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  } as const,
};

export default DownloadPage;
