import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      logout();
      navigate('/');
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: 'articles',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/articles">Articles</Link>,
    },
    {
      key: 'categories',
      icon: <FolderOutlined />,
      label: <Link to="/admin/categories">Categories</Link>,
    },
    {
      key: 'tags',
      icon: <TagsOutlined />,
      label: <Link to="/admin/tags">Tags</Link>,
    },
    {
      key: 'comments',
      icon: <MessageOutlined />,
      label: <Link to="/admin/comments">Comments</Link>,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/admin/profile">Profile</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Back to Blog</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={styles.logo}>Admin Dashboard</div>
        <Menu mode="inline" items={menuItems} style={{ height: '100%', borderRight: 0 }} />
      </Sider>

      <Layout>
        <Header style={styles.header}>
          <div style={styles.headerContent}>
            <div />
            <Dropdown menu={{ items: userMenuItems }}>
              <Avatar
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  logo: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    borderBottom: '1px solid #f0f0f0',
  },
  header: {
    background: '#fff',
    padding: '0 24px',
    borderBottom: '1px solid #f0f0f0',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
};

export default AdminLayout;
