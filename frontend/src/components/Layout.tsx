import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Badge, Input, Drawer, Grid } from 'antd';
import {
  HomeOutlined, UserOutlined, LogoutOutlined, BookOutlined,
  DownloadOutlined, ReadOutlined, TeamOutlined, AppstoreOutlined,
  ApiOutlined, CodeOutlined, CalendarOutlined, BellOutlined, PlusOutlined,
  SearchOutlined, HeartOutlined, HistoryOutlined, StarOutlined, MenuOutlined,
  SunOutlined, MoonOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';
import { useState } from 'react';
import { useThemeStore } from '@/store/theme';
import NotificationBell from './NotificationBell';

const { Header, Content, Sider } = AntLayout;
const { useBreakpoint } = Grid;

const LayoutComponent = () => {
  const { user, isAuthenticated, logout, _hydrated } = useAuthStore();
  const { mode, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < 768px 视为手机

  const [headerSearch, setHeaderSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* */ } finally {
      logout();
      navigate('/');
    }
  };

  const goSiteSearch = () => {
    const keyword = headerSearch.trim();
    navigate(keyword ? `/search?q=${encodeURIComponent(keyword)}` : '/search');
  };

  const goAiSearch = () => {
    navigate(headerSearch.trim() ? `/ai-search?q=${encodeURIComponent(headerSearch.trim())}` : '/ai-search');
  };

  const userMenuItems = isAuthenticated
    ? [
        ...(user?.role === 'ADMIN' ? [{ key: 'admin', label: <Link to="/admin">管理后台</Link> }] : []),
        { key: 'write', label: <Link to="/creator/articles/new">写博客</Link>, icon: <PlusOutlined /> },
        { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
      ]
    : [];

  const handleMenuClick = (key: string) => {
    setMobileMenuOpen(false);
    switch (key) {
      case 'home': navigate('/'); break;
      case 'blog': navigate('/blog'); break;
      case 'download': navigate('/download'); break;
      case 'study': navigate('/study'); break;
      case 'community': navigate('/community'); break;
      case 'search': navigate('/search'); break;
      case 'ai-search': navigate('/ai-search'); break;
      case 'tech-meeting': navigate('/tech-meeting'); break;
      case 'subscribe': navigate('/subscribe'); break;
      case 'follow': navigate('/follow'); break;
      case 'collection': navigate('/favorites'); break;
      case 'history': navigate('/history'); break;
      case 'member-center': navigate(isAuthenticated ? '/member' : '/login'); break;
      case 'create': navigate(isAuthenticated ? '/creator/articles/new' : '/login'); break;
      case 'model-market': window.open('https://modelscope.cn', '_blank'); break;
      case 'atomgit': window.open('https://atomgit.com', '_blank'); break;
      case 'inscode': window.open('https://inscode.net', '_blank'); break;
      case 'my-power': window.open('https://compute.dev', '_blank'); break;
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
    if (path.startsWith('/tech-meeting')) return 'tech-meeting';
    if (path.startsWith('/creator')) return 'create';
    return '';
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页' },
    { key: 'blog', icon: <BookOutlined />, label: '博客' },
    { key: 'download', icon: <DownloadOutlined />, label: '下载' },
    { key: 'study', icon: <ReadOutlined />, label: '学习' },
    { key: 'community', icon: <TeamOutlined />, label: '社区' },
    { key: 'search', icon: <SearchOutlined />, label: '搜索' },
    { type: 'divider' as const },
    { key: 'model-market', icon: <AppstoreOutlined />, label: <span>模型市场<Badge count="热门" style={{ marginLeft: 6, backgroundColor: '#f5222d', fontSize: 9 }} /></span> },
    { key: 'ai-search', icon: <ApiOutlined />, label: 'AI 搜索' },
    { key: 'atomgit', icon: <CodeOutlined />, label: 'AtomGit' },
    { key: 'inscode', icon: <CodeOutlined />, label: 'InsCode' },
    { key: 'tech-meeting', icon: <CalendarOutlined />, label: '技术会议' },
    { type: 'divider' as const },
    { key: 'subscribe', icon: <BellOutlined />, label: '订阅' },
    { key: 'follow', icon: <UserOutlined />, label: '关注' },
    { key: 'collection', icon: <StarOutlined />, label: '收藏' },
    { key: 'history', icon: <HistoryOutlined />, label: '历史' },
    { key: 'member-center', icon: <UserOutlined />, label: '会员中心' },
    { key: 'create', icon: <PlusOutlined />, label: '创作中心' },
    { key: 'my-power', icon: <ApiOutlined />, label: <span>我的算力<Badge count="NEW" style={{ marginLeft: 6, backgroundColor: '#faad14', fontSize: 9 }} /></span> },
  ];

  const renderSearchBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Input
        placeholder="搜索..."
        prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
        style={{ width: isMobile ? 140 : 260, borderRadius: 8 }}
        size={isMobile ? 'middle' : 'large'}
        value={headerSearch}
        onChange={e => setHeaderSearch(e.target.value)}
        onPressEnter={goSiteSearch}
      />
      <Button size={isMobile ? 'middle' : 'large'} style={{ borderRadius: 8 }} onClick={goSiteSearch}>搜索</Button>
      {!isMobile && (
        <Button type="primary" size="large" style={{ borderRadius: 8 }} onClick={goAiSearch}>AI</Button>
      )}
    </div>
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* 顶栏 */}
      <Header style={{
        position: 'sticky', top: 0, zIndex: 1000, padding: '0 12px',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border-light)', height: isMobile ? 50 : 60,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: 1400, margin: '0 auto', height: '100%',
        }}>
          {/* 左：汉堡+logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isMobile && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)}
                style={{ fontSize: 18, color: 'var(--color-text-secondary)' }} />
            )}
            <Link to="/" style={{ color: 'var(--color-text-primary)', fontSize: isMobile ? 16 : 20, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: isMobile ? 22 : 28 }}>🦊</span>
              {!isMobile && '二灵湃湃树'}
            </Link>
          </div>

          {/* 中：搜索 */}
          {!isMobile && renderSearchBar()}
          {isMobile && showMobileSearch && (
            <div style={{ position: 'absolute', top: 50, left: 0, right: 0, background: '#fff', padding: 10, borderBottom: '1px solid var(--color-border-light)', zIndex: 999 }}>
              {renderSearchBar()}
            </div>
          )}

          {/* 右：操作区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 12 }}>
            {isMobile && (
              <Button type="text" icon={<SearchOutlined />} onClick={() => setShowMobileSearch(!showMobileSearch)}
                style={{ color: 'var(--color-text-secondary)' }} />
            )}
            {/* 主题切换 */}
            <Button type="text" size={isMobile ? 'small' : 'large'}
              onClick={toggleTheme}
              style={{ fontSize: isMobile ? 16 : 18, color: 'var(--color-text-secondary)' }}>
              {mode === 'light' ? <MoonOutlined /> : <SunOutlined />}
            </Button>
            <Button type="text" size={isMobile ? 'small' : 'large'} onClick={() => navigate('/subscribe')}
              style={{ fontSize: isMobile ? 16 : 18, color: 'var(--color-text-secondary)' }}>
              <BellOutlined />
            </Button>
            {isAuthenticated && <NotificationBell />}
            {!_hydrated ? (
              <div style={{ width: 80 }} />
            ) : isAuthenticated && user ? (
              <Dropdown menu={{ items: userMenuItems }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '2px 6px', borderRadius: 8 }}>
                  <Avatar src={user.avatar} icon={<UserOutlined />} size={isMobile ? 28 : 32} style={{ border: '2px solid var(--color-border-light)' }} />
                  {!isMobile && <span style={{ fontWeight: 500, fontSize: 14 }}>{user.nickname || user.username}</span>}
                </div>
              </Dropdown>
            ) : (
              <Link to="/login">
                <Button type="primary" size={isMobile ? 'small' : 'large'} style={{ borderRadius: 8, fontWeight: 500 }}>
                  {isMobile ? '登录' : <><PlusOutlined /> 创作</>}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Header>

      <AntLayout>
        {/* 桌面侧边栏 */}
        {!isMobile && (
          <Sider width={220} theme="light" style={{
            position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflow: 'auto',
            borderRight: '1px solid var(--color-border-light)', background: '#fff', paddingTop: 4,
          }}>
            <Menu mode="inline" selectedKeys={[getSelectedKey()]} items={menuItems}
              style={{ border: 'none', background: 'transparent' }} onClick={({ key }) => handleMenuClick(key)} />
          </Sider>
        )}

        {/* 手机侧边栏（Drawer） */}
        {isMobile && (
          <Drawer
            title={<><span style={{ fontSize: 20 }}>🦊</span> 二灵湃湃树</>}
            placement="left"
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            width={260}
            styles={{ body: { padding: 0 } }}
          >
            <Menu mode="inline" selectedKeys={[getSelectedKey()]} items={menuItems}
              style={{ border: 'none' }} onClick={({ key }) => handleMenuClick(key)} />
          </Drawer>
        )}

        <Content style={{ background: 'var(--color-bg)', overflow: 'auto' }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            padding: isMobile ? '12px 10px' : '24px 24px',
            minHeight: isMobile ? 'calc(100vh - 50px)' : 'calc(100vh - 60px)',
          }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default LayoutComponent;
