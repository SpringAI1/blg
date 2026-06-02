import { Form, Input, Button, App } from 'antd';
import { userApi } from '@/api/user';
import { useAuthStore } from '@/store/auth';

const Profile = () => {
  const { user, setAuth } = useAuthStore();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const updatedUser = await userApi.updateProfile(values);
      setAuth(updatedUser, localStorage.getItem('token') || '');
      message.success('个人信息更新成功');
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败');
    }
  };

  return (
    <div>
      <h1>个人设置</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          username: user?.username,
          email: user?.email,
          avatar: user?.avatar || '',
        }}
      >
        <Form.Item label="用户名" name="username">
          <Input disabled />
        </Form.Item>

        <Form.Item label="邮箱" name="email" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="头像URL" name="avatar">
          <Input />
        </Form.Item>

        <Form.Item label="新密码" name="password">
          <Input.Password placeholder="留空则保持当前密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            更新个人信息
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;
