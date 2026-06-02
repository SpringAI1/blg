import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Input, Badge as BadgeComponent } from 'antd';
import {
  HomeOutlined, UserOutlined, LogoutOutlined, BookOutlined,
  DownloadOutlined, ReadOutlined, TeamOutlined, AppstoreOutlined,
  ApiOutlined, CodeOutlined, CalendarOutlined, BellOutlined, PlusOutlined,
  SearchOutlined, HeartOutlined, HistoryOutlined, StarOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

const { Header, Content, Footer, Sider } = Layout;

const LayoutComponent = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

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

  const userMenuItems = isAuthenticated
    ? [
        {
          key: 'admin',
          label: <Link to="/admin">Admin Dashboard</Link>,
        },
        {
          key: 'logout',
          label: 'Logout',
          icon: <LogoutOutlined />,
          onClick: handleLogout,
        },
      ]
    : [];

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'blog':
        navigate('/blog');
        break;
      case 'download':
        navigate('/download');
        break;
      case 'study':
        navigate('/study');
        break;
      case 'community':
        navigate('/community');
        break;
      case 'model-market':
        window.open('https://modelscope.cn', '_blank');
        break;
      case 'ai-search':
        navigate('/ai-search');
        break;
      case 'atomgit':
        window.open('https://atomgit.com', '_blank');
        break;
      case 'inscode':
        window.open('https://inscode.net', '_blank');
        break;
      case 'tech-meeting':
        navigate('/tech-meeting');
        break;
      case 'subscribe':
        navigate('/subscribe');
        break;
      case 'follow':
        navigate('/follow');
        break;
      case 'collection':
        navigate('/favorites');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'member-center':
        if (isAuthenticated) {
          navigate('/admin/profile');
        } else {
          navigate('/login');
        }
        break;
      case 'create':
        if (isAuthenticated) {
          navigate('/admin/articles/new');
        } else {
          navigate('/login');
        }
        break;
      case 'my-power':
        window.open('https://compute.dev', '_blank');
        break;
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/download')) return 'download';
    if (path.startsWith('/study')) return 'study';
    if (path.startsWith('/community')) return 'community';
    if (path.startsWith('/ai-search')) return 'ai-search';
    if (path.startsWith('/subscribe')) return 'subscribe';
    if (path.startsWith('/follow')) return 'follow';
    if (path.startsWith('/favorites')) return 'collection';
    if (path.startsWith('/search')) return 'search';
    if (path.startsWith('/history')) return 'history';
    return '';
  };

  const sideMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => handleMenuClick('home'),
    },
    {
      key: 'blog',
      icon: <BookOutlined />,
      label: '博客',
      onClick: () => handleMenuClick('blog'),
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: '下载',
      onClick: () => handleMenuClick('download'),
    },
    {
      key: 'study',
      icon: <ReadOutlined />,
      label: '学习',
      onClick: () => handleMenuClick('study'),
    },
    {
      key: 'community',
      icon: <TeamOutlined />,
      label: '社区',
      onClick: () => handleMenuClick('community'),
    },
    { type: 'divider' as const },
    {
      key: 'model-market',
      icon: <AppstoreOutlined />,
      label: (
        <span>
          模型市场
          <BadgeComponent count="热门" style={{ marginLeft: 8, backgroundColor: '#f5222d', fontSize: 10 }} />
        </span>
      ),
      onClick: () => handleMenuClick('model-market'),
    },
    {
      key: 'ai-search',
      icon: <ApiOutlined />,
      label: 'AI 搜索',
      onClick: () => handleMenuClick('ai-search'),
    },
    {
      key: 'atomgit',
      icon: <CodeOutlined />,
      label: 'AtomGit',
      onClick: () => handleMenuClick('atomgit'),
    },
    {
      key: 'inscode',
      icon: <CodeOutlined />,
      label: 'InsCode',
      onClick: () => handleMenuClick('inscode'),
    },
    {
      key: 'tech-meeting',
      icon: <CalendarOutlined />,
      label: '技术会议',
      onClick: () => handleMenuClick('tech-meeting'),
    },
    { type: 'divider' as const },
    {
      key: 'subscribe',
      icon: <BellOutlined />,
      label: '订阅',
      onClick: () => handleMenuClick('subscribe'),
    },
    {
      key: 'follow',
      icon: <UserOutlined />,
      label: '关注',
      onClick: () => handleMenuClick('follow'),
    },
    {
      key: 'collection',
      icon: <StarOutlined />,
      label: '收藏',
      onClick: () => handleMenuClick('collection'),
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '历史',
      onClick: () => handleMenuClick('history'),
    },
    {
      key: 'member-center',
      icon: <UserOutlined />,
      label: '会员中心',
      onClick: () => handleMenuClick('member-center'),
    },
    {
      key: 'create',
      icon: <PlusOutlined />,
      label: '创作中心',
      onClick: () => handleMenuClick('create'),
    },
    {
      key: 'my-power',
      icon: <ApiOutlined />,
      label: (
        <span>
          我的算力
          <BadgeComponent count="NEW" style={{ marginLeft: 8, backgroundColor: '#faad14', fontSize: 10 }} />
        </span>
      ),
      onClick: () => handleMenuClick('my-power'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.logo}>
            <Link to="/" style={styles.logoText}>
              <span style={{ fontSize: 28, marginRight: 8 }}>🦊</span>
              二灵湃湃树
            </Link>
          </div>

          <div style={styles.searchArea}>
            <Input
              placeholder="搜索..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              size="large"
              onPressEnter={() => {
                const input = document.querySelector('.ant-input') as HTMLInputElement;
                if (input?.value) {
                  navigate(`/search?q=${encodeURIComponent(input.value)}`);
                }
              }}
            />
            <Button
              type="primary"
              size="large"
              style={{ marginLeft: 8 }}
              onClick={() => navigate('/ai-search')}
            >
              AI 搜索
            </Button>
          </div>

          <div style={styles.auth}>
            <Button
              type="text"
              size="large"
              onClick={() => navigate('/subscribe')}
            >
              <BellOutlined style={{ fontSize: 18 }} />
            </Button>
            {isAuthenticated && user ? (
              <Dropdown menu={{ items: userMenuItems }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <Avatar src={user.avatar} icon={<UserOutlined />} />
                  <span>会员中心</span>
                </div>
              </Dropdown>
            ) : (
              <>
                <Link to="/login">
                  <Button type="text" size="large">登录</Button>
                </Link>
                <Link to="/register">
                  <Button type="primary" size="large">
                    <PlusOutlined /> 创作
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Header>

      <Layout>
        <Sider width={240} theme="light" style={styles.sider}>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={sideMenuItems}
            style={{ border: 'none' }}
          />
        </Sider>

        <Content style={{ background: '#f5f5f5' }}>
          <div style={styles.content}>
            <Outlet />
          </div>
        </Content>
      </Layout>

      <Footer style={styles.footer}>
        二灵湃湃树 ©2024 Created with Ant Design
      </Footer>
    </Layout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: '0 24px',
    background: '#fff',
    borderBottom: '1px solid #e8e8e8',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1400,
    margin: '0 auto',
    height: 56,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 600,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  searchArea: {
    display: 'flex',
    alignItems: 'center',
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  sider: {
    position: 'sticky',
    top: 56,
    height: 'calc(100vh - 56px)',
    overflow: 'auto',
    borderRight: '1px solid #e8e8e8',
  },
  content: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 20px',
    minHeight: 'calc(100vh - 120px)',
  },
  footer: {
    textAlign: 'center',
    background: '#fff',
    borderTop: '1px solid #e8e8e8',
  },
};

export default LayoutComponent;
