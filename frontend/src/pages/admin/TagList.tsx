import { Table, Button, Modal, Form, Input, App } from 'antd';
import { useEffect, useState } from 'react';
import { ColumnType } from 'antd/es/table';
import { Tag } from '@/types';
import { tagApi } from '@/api/tag';
import dayjs from 'dayjs';

const TagList = () => {
  const { message } = App.useApp();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await tagApi.getAllTags();
      setTags(data);
    } catch {
      message.error('加载标签失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await tagApi.createTag(values);
      message.success('创建成功');
      setModalVisible(false);
      form.resetFields();
      fetchTags();
    } catch {
      message.error('创建失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await tagApi.deleteTag(id);
      message.success('删除成功');
      fetchTags();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnType<Tag>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
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
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ display: 'inline-block', marginRight: 16 }}>标签管理</h1>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          新建标签
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="新建标签"
        open={modalVisible}
        onOk={handleAdd}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入标签名称！' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagList;
