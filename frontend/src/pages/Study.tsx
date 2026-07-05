import { useState, useEffect, useCallback } from 'react';
import { Card, List, Typography, Tag, Empty, Spin, App, Space, Button, Progress, Row, Col } from 'antd';
import { BookOutlined, PlayCircleOutlined, PauseCircleOutlined, EyeOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Article, Category } from '@/types';
import { articleApi } from '@/api/article';
import { categoryApi } from '@/api/category';
import { loadAllProgress, saveProgress, StudyProgress } from '@/utils/progress';

const { Title, Text } = Typography;

const Study = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [studyProgress, setStudyProgress] = useState<Map<number, StudyProgress>>(new Map());

  useEffect(() => {
    setStudyProgress(loadAllProgress());
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const handleSaveProgress = (articleId: number, updates: Partial<StudyProgress>) => {
    saveProgress(articleId, updates, (map) => setStudyProgress(map));
  };

  const handleStartOrContinue = (article: Article) => {
    const progress = studyProgress.get(article.id);
    if (!progress) {
      handleSaveProgress(article.id, {
        status: 'in_progress', progress: 10, startedAt: new Date().toISOString(),
      });
    } else if (progress.status === 'paused') {
      handleSaveProgress(article.id, { status: 'in_progress' });
    }
    navigate(`/article/${article.id}`);
  };

  const handlePause = (e: React.MouseEvent, articleId: number) => {
    e.stopPropagation();
    e.preventDefault();
    handleSaveProgress(articleId, { status: 'paused' });
    message.success('已暂停学习');
  };

  const handleComplete = (e: React.MouseEvent, articleId: number) => {
    e.stopPropagation();
    e.preventDefault();
    handleSaveProgress(articleId, { status: 'completed', progress: 100 });
    message.success('已完成学习！');
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articleApi.getPublishedArticles(1, 50, selectedCategory || undefined);
      setArticles(data.records || []);
    } catch (error) {
      message.error('加载学习资料失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data || []);
    } catch { message.error('加载分类失败'); }
  };

  const getProgress = (articleId: number): StudyProgress | undefined => studyProgress.get(articleId);

  // 排序：进行中 > 已暂停 > 已完成 > 未开始
  const sortedArticles = [...articles].sort((a, b) => {
    const pa = getProgress(a.id);
    const pb = getProgress(b.id);
    const order = { 'in_progress': 0, 'paused': 1, 'completed': 2 };
    const oa = pa ? (order[pa.status] ?? 3) : 3;
    const ob = pb ? (order[pb.status] ?? 3) : 3;
    return oa - ob;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ margin: 0 }}>
          <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          学习中心
        </Title>
        <Space>
          <Text type="secondary">
            学习中: {Array.from(studyProgress.values()).filter(p => p.status === 'in_progress').length}
            {' | '}已完成: {Array.from(studyProgress.values()).filter(p => p.status === 'completed').length}
          </Text>
          <Button size="small" icon={<ReloadOutlined />} onClick={() => setStudyProgress(loadAllProgress())}>刷新</Button>
        </Space>
      </div>

      <div style={styles.filterBar}>
        <Button type={selectedCategory === null ? 'primary' : 'default'} shape="round"
          onClick={() => setSelectedCategory(null)} style={{ marginRight: 8, marginBottom: 8 }}>
          全部
        </Button>
        {categories.map(cat => (
          <Button key={cat.id} type={selectedCategory === cat.id ? 'primary' : 'default'} shape="round"
            onClick={() => setSelectedCategory(cat.id)} style={{ marginRight: 8, marginBottom: 8 }}>
            {cat.name}
          </Button>
        ))}
      </div>

      <Spin spinning={loading}>
        {sortedArticles.length === 0 ? (
          <Empty description="暂无学习内容" style={{ padding: 48 }} />
        ) : (
          <Row gutter={[16, 16]}>
            {sortedArticles.map((article) => {
              const progress = getProgress(article.id);
              return (
                <Col xs={24} sm={12} lg={8} key={article.id}>
                  <Card
                    hoverable
                    style={{
                      height: '100%', borderRadius: 12,
                      borderLeft: progress?.status === 'in_progress' ? '3px solid #1890ff' :
                                  progress?.status === 'completed' ? '3px solid #52c41a' :
                                  progress?.status === 'paused' ? '3px solid #faad14' : 'none',
                    }}
                    onClick={() => navigate(`/article/${article.id}`)}
                  >
                    <div style={styles.cardIcon}>
                      {progress?.status === 'completed' ? (
                        <CheckCircleOutlined style={{ fontSize: 28, color: '#52c41a' }} />
                      ) : (
                        <BookOutlined style={{ fontSize: 28, color: '#1890ff' }} />
                      )}
                    </div>
                    <Title level={4} style={{ marginTop: 12, marginBottom: 8, color: '#1a1a1a', fontSize: 16 }}>
                      {article.title}
                    </Title>
                    <Text style={{ color: '#666', fontSize: 13, display: 'block', marginBottom: 8, lineHeight: 1.5 }}>
                      {article.summary || article.content?.substring(0, 60) || ''}...
                    </Text>
                    <Space size="small" style={{ marginBottom: 8 }}>
                      {article.categoryName && <Tag color="blue" style={{ borderRadius: 8 }}>{article.categoryName}</Tag>}
                      {progress?.status === 'completed' && <Tag color="success">已完成</Tag>}
                      {progress?.status === 'paused' && <Tag color="warning">已暂停</Tag>}
                      {progress?.status === 'in_progress' && <Tag color="processing">学习中</Tag>}
                    </Space>
                    <Progress
                      percent={progress?.progress ?? 0}
                      size="small"
                      strokeColor={progress?.status === 'completed' ? '#52c41a' : '#1890ff'}
                      format={() => `${progress?.progress ?? 0}%`}
                    />
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space size={12}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          <EyeOutlined style={{ marginRight: 2 }} />{article.views?.toLocaleString()}
                        </Text>
                        {progress?.status === 'paused' && (
                          <Button type="link" size="small" icon={<PlayCircleOutlined />}
                            onClick={() => handleStartOrContinue(article)}>继续</Button>
                        )}
                      </Space>
                      <Space>
                        {(!progress || progress.status === 'paused') && (
                          <Button type="primary" size="small" icon={<PlayCircleOutlined />}
                            onClick={() => handleStartOrContinue(article)}>
                            {progress?.status === 'paused' ? '继续' : '开始学习'}
                          </Button>
                        )}
                        {progress?.status === 'in_progress' && (
                          <>
                            <Button size="small" icon={<PauseCircleOutlined />}
                              onClick={(e) => handlePause(e, article.id)}>暂停</Button>
                            <Button type="primary" size="small" icon={<CheckCircleOutlined />}
                              onClick={(e) => handleComplete(e, article.id)}>完成</Button>
                          </>
                        )}
                        {progress?.status === 'completed' && (
                          <Button size="small" icon={<ReloadOutlined />}
                            onClick={() => { handleSaveProgress(article.id, { status: 'in_progress', progress: 0 }); }}>
                            重新学习
                          </Button>
                        )}
                      </Space>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Spin>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { background: '#fff', borderRadius: 8, padding: 24 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  filterBar: { marginBottom: 24, display: 'flex', flexWrap: 'wrap' },
  cardIcon: { width: 56, height: 56, borderRadius: 12, background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default Study;
