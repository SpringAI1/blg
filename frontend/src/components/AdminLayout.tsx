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
  ArrowLeftOutlined,
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
      label: <Link to="/admin">控制台</Link>,
    },
    {
      key: 'articles',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/articles">文章管理</Link>,
    },
    {
      key: 'categories',
      icon: <FolderOutlined />,
      label: <Link to="/admin/categories">分类管理</Link>,
    },
    {
      key: 'tags',
      icon: <TagsOutlined />,
      label: <Link to="/admin/tags">标签管理</Link>,
    },
    {
      key: 'comments',
      icon: <MessageOutlined />,
      label: <Link to="/admin/comments">评论管理</Link>,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/admin/profile">个人资料</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">返回博客</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={styles.logo}>管理后台</div>
        <Menu mode="inline" items={menuItems} style={{ height: '100%', borderRight: 0 }} />
      </Sider>

      <Layout>
        <Header style={styles.header}>
          <div style={styles.headerContent}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{ marginRight: 16 }}
            >
              返回首页
            </Button>
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
