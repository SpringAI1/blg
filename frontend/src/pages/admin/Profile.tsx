import { Form, Input, Button, App, Upload, Avatar, message as Msg } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { userApi } from '@/api/user';
import { fileApi } from '@/api/file';
import { useAuthStore } from '@/store/auth';

const Profile = () => {
  const { user, setAuth } = useAuthStore();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.warning('请上传图片文件');
      return false;
    }
    setUploading(true);
    try {
      const result = await fileApi.upload(file);
      if (result?.url) {
        const updatedUser = await userApi.updateProfile({ avatar: result.url });
        if (updatedUser) {
          setAuth(updatedUser, localStorage.getItem('token') || '');
        }
        message.success('头像更新成功');
      }
    } catch (err: any) {
      message.error('上传失败: ' + (err.message || '未知错误'));
    } finally {
      setUploading(false);
    }
    return false;
  };

  const onFinish = async (values: any) => {
    try {
      const updatedUser = await userApi.updateProfile(values);
      if (updatedUser) {
        setAuth(updatedUser, localStorage.getItem('token') || '');
      }
      message.success('个人信息更新成功');
    } catch (error: any) {
      message.error(error.message || '更新失败');
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
          nickname: user?.nickname || user?.username,
          bio: user?.bio || '',
        }}
      >
        {/* 头像上传 */}
        <Form.Item label="头像">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar src={user?.avatar} size={80} icon={<UserOutlined />} style={{ border: '2px solid #f0f0f0' }} />
            <Upload
              beforeUpload={handleAvatarUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>更换头像</Button>
            </Upload>
          </div>
        </Form.Item>

        <Form.Item label="用户名">
          <Input value={user?.username} disabled />
        </Form.Item>

        <Form.Item label="昵称" name="nickname">
          <Input />
        </Form.Item>

        <Form.Item label="个人简介" name="bio">
          <Input.TextArea rows={3} maxLength={200} showCount />
        </Form.Item>

        <Form.Item label="邮箱" name="email" rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
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
