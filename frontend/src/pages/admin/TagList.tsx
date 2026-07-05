import { Table, Button, Modal, Form, Input, App, Card, Space } from 'antd';
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

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

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    editForm.setFieldsValue({
      name: tag.name,
      slug: (tag as any).slug || '',
      color: (tag as any).color || '#000000',
    });
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!editingTag) return;
    try {
      const values = await editForm.validateFields();
      await tagApi.updateTag(editingTag.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      setEditingTag(null);
      editForm.resetFields();
      fetchTags();
    } catch {
      message.error('更新失败');
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
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>标签管理</h2>
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>管理文章标签</span>
        </div>
        <Button type="primary" onClick={() => setModalVisible(true)} style={{ borderRadius: 8, fontWeight: 500 }}>
          新建标签
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

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

      <Modal
        title="编辑标签"
        open={editModalVisible}
        onOk={handleEditSave}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingTag(null);
          editForm.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入标签名称！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="别名">
            <Input placeholder="用于URL，如: spring-boot" />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Input type="color" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagList;
