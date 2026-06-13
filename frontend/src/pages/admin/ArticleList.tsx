import { Table, Button, Tag, App, Card } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnType } from 'antd/es/table';
import { Article } from '@/types';
import { articleApi } from '@/api/article';
import dayjs from 'dayjs';

const ArticleList = () => {
  const { message } = App.useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchArticles = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await articleApi.getArticlesByUser(pageNum, 10);
      setArticles(data.records);
      setTotal(data.total);
      setPage(pageNum);
    } catch {
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1);
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await articleApi.deleteArticle(id);
      message.success('删除成功');
      fetchArticles(page);
    } catch {
      message.error('删除失败');
    }
  };

  const getStatusText = (status: string) => {
    return status === 'PUBLISHED' ? '已发布' : '草稿';
  };

  const columns: ColumnType<Article>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '浏览',
      dataIndex: 'views',
      key: 'views',
      width: 80,
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => navigate(`/article/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            onClick={() => navigate(`/admin/articles/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>文章管理</h2>
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>管理所有文章</span>
        </div>
        <Button
          type="primary"
          onClick={() => navigate('/admin/articles/new')}
          style={{ borderRadius: 8, fontWeight: 500 }}
        >
          新建文章
        </Button>
      </div>
      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total: total,
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 篇文章`,
            onChange: (p) => fetchArticles(p),
          }}
        />
      </Card>
    </div>
  );
};

export default ArticleList;
