import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Blog from '@/pages/Blog';
import Search from '@/pages/Search';
import AISearch from '@/pages/AISearch';
import ArticleDetail from '@/pages/ArticleDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AdminLayout from '@/components/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import ArticleList from '@/pages/admin/ArticleList';
import ArticleEditor from '@/pages/admin/ArticleEditor';
import CategoryList from '@/pages/admin/CategoryList';
import TagList from '@/pages/admin/TagList';
import CommentList from '@/pages/admin/CommentList';
import Profile from '@/pages/admin/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';
import Favorites from '@/pages/Favorites';
import DownloadPage from '@/pages/DownloadPage';
import Study from '@/pages/Study';
import Community from '@/pages/Community';
import Subscribe from '@/pages/Subscribe';
import Follow from '@/pages/Follow';
import History from '@/pages/History';
import TechMeeting from '@/pages/TechMeeting';
import MeetingRoom from '@/pages/MeetingRoom';
import UserProfile from '@/pages/UserProfile';
import MemberCenter from '@/pages/MemberCenter';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#ff6b00',
          colorLink: '#ff6b00',
          borderRadius: 8,
          fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.06)',
        },
        components: {
          Card: {
            paddingLG: 24,
            borderRadiusLG: 10,
            boxShadowTertiary: '0 1px 3px rgba(0, 0, 0, 0.04)',
          },
          Button: {
            borderRadiusLG: 8,
            fontWeight: 500,
          },
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 8,
            itemMarginBlock: 2,
          },
          Input: {
            borderRadius: 8,
            borderRadiusLG: 8,
          },
          Select: {
            borderRadius: 8,
            borderRadiusLG: 8,
          },
          Modal: {
            borderRadiusLG: 12,
          },
          Table: {
            borderRadiusLG: 10,
          },
        },
      }}
    >
      <AntdApp>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="blog" element={<Blog />} />
            <Route path="search" element={<Search />} />
            <Route path="ai-search" element={<AISearch />} />
            <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="download" element={<DownloadPage />} />
            <Route path="study" element={<Study />} />
            <Route path="community" element={<Community />} />
            <Route path="subscribe" element={<Subscribe />} />
            <Route path="follow" element={<Follow />} />
            <Route path="history" element={<History />} />
            <Route path="tech-meeting" element={<TechMeeting />} />
            <Route path="meeting/:id" element={<MeetingRoom />} />
            <Route
              path="meeting/create"
              element={<ProtectedRoute><TechMeeting /></ProtectedRoute>}
            />
            <Route path="article/:id" element={<ArticleDetail />} />
            <Route path="user/:id" element={<UserProfile />} />
            <Route
              path="member"
              element={
                <ProtectedRoute>
                  <MemberCenter />
                </ProtectedRoute>
              }
            />
            <Route
              path="creator/articles/new"
              element={
                <ProtectedRoute>
                  <ArticleEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="creator/articles/edit/:id"
              element={
                <ProtectedRoute>
                  <ArticleEditor />
                </ProtectedRoute>
              }
            />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="articles" element={<ArticleList />} />
            <Route path="articles/new" element={<ArticleEditor />} />
            <Route path="articles/edit/:id" element={<ArticleEditor />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="tags" element={<TagList />} />
            <Route path="comments" element={<CommentList />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
