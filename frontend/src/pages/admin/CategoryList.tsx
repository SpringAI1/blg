import { Table, Button, Modal, Form, Input, App, Card } from 'antd';
import { useEffect, useState } from 'react';
import { ColumnType } from 'antd/es/table';
import { Category } from '@/types';
import { categoryApi } from '@/api/category';
import dayjs from 'dayjs';

const CategoryList = () => {
  const { message } = App.useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch {
      message.error('加载分类失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryApi.deleteCategory(id);
      message.success('删除成功');
      fetchCategories();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, values);
        message.success('更新成功');
      } else {
        await categoryApi.createCategory(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchCategories();
    } catch {
      message.error('操作失败');
    }
  };

  const columns: ColumnType<Category>[] = [
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
      title: '别名',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
      width: 150,
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
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
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>分类管理</h2>
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>管理文章分类</span>
        </div>
        <Button type="primary" onClick={handleAdd} style={{ borderRadius: 8, fontWeight: 500 }}>
          新建分类
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)', padding: 0 }}>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入分类名称！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="别名">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryList;
