import { Form, Input, Select, Button, Card, Spin, App, Upload, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { articleApi } from '@/api/article';
import { categoryApi } from '@/api/category';
import { tagApi } from '@/api/tag';
import { fileApi } from '@/api/file';
import { Category } from '@/types';
import { Tag as TagType } from '@/types';
import { useAuthStore } from '@/store/auth';
import MDEditor from '@uiw/react-md-editor';

const { TextArea } = Input;

const ArticleEditor = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatorRoute = location.pathname.startsWith('/creator');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const { isAuthenticated, token } = useAuthStore();

  // 草稿自动保存
  const DRAFT_KEY = `draft_${id || 'new'}`;
  const [contentValue, setContentValue] = useState<string>('');

  useEffect(() => {
    // 从 localStorage 检查草稿
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved && !id) {
        const draft = JSON.parse(saved);
        if (window.confirm('检测到未发布的草稿，是否恢复？')) {
          form.setFieldsValue(draft);
          if (draft.content) setContentValue(draft.content);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch { /* ignore */ }
    const fetchData = async () => {
      try {
        const [cats, tgs] = await Promise.all([
          categoryApi.getAllCategories(),
          tagApi.getAllTags(),
        ]);
        setCategories(cats || []);
        setTags(tgs || []);

        if (id) {
          const article = await articleApi.getArticle(Number(id));
          form.setFieldsValue({
            title: article.title,
            content: article.content,
            summary: article.summary,
            coverImage: article.coverImage,
            status: article.status,
            categoryId: article.categoryId,
            tagIds: article.tags?.map((t) => t.id),
          });
          if (article.coverImage) {
            setCoverImageUrl(article.coverImage);
          }
        }
      } catch (err: any) {
        message.error('加载数据失败: ' + (err.message || '未知错误'));
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id, form, navigate, message]);

  // 自动保存草稿 — 每3秒将表单值写入 localStorage
  useEffect(() => {
    const timer = setInterval(() => {
      const values = form.getFieldsValue();
      if (values.title || values.content) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      }
    }, 3000);
    return () => {
      clearInterval(timer);
      // 提交成功后清理草稿
      const submitHandler = () => localStorage.removeItem(DRAFT_KEY);
      window.addEventListener('beforeunload', submitHandler);
    };
  }, [form, DRAFT_KEY]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await fileApi.upload(file);
      if (result?.url) {
        form.setFieldValue('coverImage', result.url);
        setCoverImageUrl(result.url);
        message.success('图片上传成功');
      }
    } catch (err: any) {
      message.error('图片上传失败: ' + (err.message || '未知错误'));
    } finally {
      setUploading(false);
    }
    return Promise.resolve(false);
  };

  const onFinish = async (values: any) => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await articleApi.updateArticle(Number(id), values);
        message.success('文章更新成功！');
        navigate(isCreatorRoute ? `/article/${id}` : '/admin/articles');
      } else {
        const result = await articleApi.createArticle(values);
        message.success('文章创建成功！');
        navigate(isCreatorRoute ? (result?.id ? `/article/${result.id}` : '/blog') : '/admin/articles');
      }
    } catch (err: any) {
      message.error('保存文章失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1>{id ? '编辑文章' : '新建文章'}</h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题！' }]}
          >
            <Input placeholder="文章标题" />
          </Form.Item>

          <Form.Item
            label="文章摘要"
            name="summary"
            rules={[{ required: true, message: '请输入文章摘要！' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入文章摘要，这将显示在文章列表中" 
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="封面图片"
            name="coverImage"
          >
            <div>
              {coverImageUrl && (
                <div style={{ marginBottom: 16 }}>
                  <Image
                    width={200}
                    src={coverImageUrl}
                    alt="封面预览"
                  />
                </div>
              )}
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploading}
                >
                  点击上传封面图片
                </Button>
              </Upload>
              <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                支持 JPG、PNG、GIF 格式，建议尺寸 1200x630
              </div>
            </div>
          </Form.Item>

          <Form.Item
            label="分类"
            name="categoryId"
          >
            <Select
              placeholder="选择分类"
              allowClear
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>

          <Form.Item
            label="标签"
            name="tagIds"
          >
            <Select
              mode="multiple"
              placeholder="选择标签"
              allowClear
              options={tags.map((t) => ({ label: t.name, value: t.id }))}
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            initialValue="DRAFT"
          >
            <Select
              options={[
                { label: '草稿', value: 'DRAFT' },
                { label: '已发布', value: 'PUBLISHED' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入内容！' }]}
          >
            <MDEditor height={500} preview="live" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate(isCreatorRoute ? '/blog' : '/admin/articles')}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ArticleEditor;
