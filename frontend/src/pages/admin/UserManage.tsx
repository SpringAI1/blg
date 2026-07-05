import { Table, Button, Modal, Select, App, Card, Input, Space, Tag, Avatar } from 'antd';
import { useEffect, useState } from 'react';
import { ColumnType } from 'antd/es/table';
import { User } from '@/types';
import { userApi } from '@/api/user';
import dayjs from 'dayjs';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
const UserManage = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('USER');

  const fetchUsers = async (pageNum: number, kw?: string) => {
    setLoading(true);
    try {
      const data = await userApi.getUserList(pageNum, 10, kw || undefined);
      setUsers(data.records || []);
      setTotal(data.total);
      setPage(pageNum);
    } catch {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearch = () => {
    fetchUsers(1, keyword);
  };

  const handleRoleEdit = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
    setRoleModalVisible(true);
  };

  const handleRoleSave = async () => {
    if (!editingUser) return;
    try {
      await userApi.updateUserRole(editingUser.id, newRole);
      message.success('角色更新成功');
      setRoleModalVisible(false);
      setEditingUser(null);
      fetchUsers(page, keyword);
    } catch {
      message.error('角色更新失败');
    }
  };

  const columns: ColumnType<User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '用户',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} size="small" />
          <span>{record.nickname || record.username}</span>
        </Space>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role === 'ADMIN' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '文章数',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 80,
    },
    {
      title: '签到',
      dataIndex: 'coins',
      key: 'coins',
      width: 80,
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type="link" onClick={() => handleRoleEdit(record)}>
          修改角色
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>用户管理</h2>
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>
            共 {total} 位用户
          </span>
        </div>
        <Space>
          <Input.Search
            placeholder="搜索用户名/昵称/邮箱"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 260 }}
          />
        </Space>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total: total,
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 位用户`,
            onChange: (p) => fetchUsers(p, keyword),
          }}
        />
      </Card>

      <Modal
        title="修改用户角色"
        open={roleModalVisible}
        onOk={handleRoleSave}
        onCancel={() => {
          setRoleModalVisible(false);
          setEditingUser(null);
        }}
        okText="确定"
        cancelText="取消"
      >
        {editingUser && (
          <div>
            <p>用户：{editingUser.nickname || editingUser.username}（ID: {editingUser.id}）</p>
            <Select
              value={newRole}
              onChange={setNewRole}
              style={{ width: 200 }}
              options={[
                { value: 'USER', label: '普通用户 (USER)' },
                { value: 'ADMIN', label: '管理员 (ADMIN)' },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManage;
