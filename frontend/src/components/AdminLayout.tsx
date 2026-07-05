import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Grid, Drawer, Space } from 'antd';
import {
  DashboardOutlined, FileTextOutlined, FolderOutlined, TagsOutlined,
  MessageOutlined, UserOutlined, LogoutOutlined, HomeOutlined,
  ArrowLeftOutlined, MenuOutlined, TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';
import { useState } from 'react';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* */ } finally {
      localStorage.removeItem('token'); localStorage.removeItem('user');
      logout(); navigate('/');
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin') return 'dashboard';
    if (path.startsWith('/admin/articles')) return 'articles';
    if (path.startsWith('/admin/categories')) return 'categories';
    if (path.startsWith('/admin/tags')) return 'tags';
    if (path.startsWith('/admin/comments')) return 'comments';
    if (path.startsWith('/admin/profile')) return 'profile';
    if (path.startsWith('/admin/users')) return 'users';
    return '';
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/admin">控制台</Link> },
    { key: 'articles', icon: <FileTextOutlined />, label: <Link to="/admin/articles">文章管理</Link> },
    { key: 'categories', icon: <FolderOutlined />, label: <Link to="/admin/categories">分类管理</Link> },
    { key: 'tags', icon: <TagsOutlined />, label: <Link to="/admin/tags">标签管理</Link> },
    { key: 'comments', icon: <MessageOutlined />, label: <Link to="/admin/comments">评论管理</Link> },
    { key: 'users', icon: <TeamOutlined />, label: <Link to="/admin/users">用户管理</Link> },
    { key: 'profile', icon: <UserOutlined />, label: <Link to="/admin/profile">个人资料</Link> },
  ];

  const menu = (
    <Menu mode="inline" items={menuItems} selectedKeys={[getSelectedKey()]}
      style={{ height: '100%', borderRight: 0, background: 'transparent' }}
      onClick={() => setMobileMenuOpen(false)} />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面侧边栏 */}
      {!isMobile && (
        <Sider theme="light" width={220} style={{ borderRight: '1px solid var(--color-border-light)' }}>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, borderBottom: '1px solid var(--color-border-light)' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>🦊 管理后台</Link>
          </div>
          {menu}
        </Sider>
      )}

      <Layout>
        <Header style={{ background: '#fff', padding: isMobile ? '0 12px' : '0 24px', borderBottom: '1px solid var(--color-border-light)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <Space>
              {isMobile && (
                <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)}
                  style={{ fontSize: 18 }} />
              )}
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}
                style={{ borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                {!isMobile && '返回首页'}
              </Button>
            </Space>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!isMobile && <Text style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{user?.username}</Text>}
              <Dropdown menu={{ items: [
                { key: 'home', icon: <HomeOutlined />, label: <Link to="/">返回博客</Link> },
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
              ]}}>
                <Avatar src={user?.avatar} icon={<UserOutlined />}
                  style={{ cursor: 'pointer', border: '2px solid var(--color-border-light)' }} />
              </Dropdown>
            </div>
          </div>
        </Header>

        {/* 手机侧边栏 Drawer */}
        {isMobile && (
          <Drawer title="🦊 管理后台" placement="left" onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen} width={240} styles={{ body: { padding: 0 } }}>
            {menu}
          </Drawer>
        )}

        <Content style={{ margin: isMobile ? 12 : 24, background: 'transparent' }}>
          <div className="fade-in-up"><Outlet /></div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
