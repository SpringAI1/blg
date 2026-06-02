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

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#ff6b00',
        },
      }}
    >
      <AntdApp>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/" element={<Layout />}>
            <Route path="blog" element={<Blog />} />
            <Route path="search" element={<Search />} />
            <Route path="ai-search" element={<AISearch />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="download" element={<DownloadPage />} />
            <Route path="study" element={<Study />} />
            <Route path="community" element={<Community />} />
            <Route path="subscribe" element={<Subscribe />} />
            <Route path="follow" element={<Follow />} />
            <Route path="history" element={<History />} />
            <Route path="tech-meeting" element={<TechMeeting />} />
            <Route path="article/:id" element={<ArticleDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
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
