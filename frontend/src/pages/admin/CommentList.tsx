import { Table, Button, Modal, Tag, App } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnType } from 'antd/es/table';
import { commentApi, CommentDTO } from '@/api/comment';
import dayjs from 'dayjs';

const CommentList = () => {
  const { message } = App.useApp();
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentApi.getAllComments();
      setComments(data);
    } catch {
      message.error('加载评论失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await commentApi.deleteComment(id);
      message.success('删除成功');
      fetchComments();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnType<CommentDTO>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '文章',
      dataIndex: 'articleId',
      key: 'articleId',
      width: 100,
      render: (id: number) => (
        <Button type="link" onClick={() => navigate(`/article/${id}`)}>
          #{id}
        </Button>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'username',
      key: 'username',
      width: 120,
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
      width: 100,
      render: (_, record) => (
        <Button type="link" danger onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>评论管理</h1>
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default CommentList;
