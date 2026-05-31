import { Form, Input, Select, Button, Card, Spin, App } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articleApi } from '@/api/article';
import { categoryApi } from '@/api/category';
import { tagApi } from '@/api/tag';
import { Category } from '@/types';
import { Tag as TagType } from '@/types';

const { TextArea } = Input;

const ArticleEditor = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [initialLoading, setInitialLoading] = useState(!!id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, tgs] = await Promise.all([
          categoryApi.getAllCategories(),
          tagApi.getAllTags(),
        ]);
        setCategories(cats);
        setTags(tgs);

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
        }
      } catch {
        message.error('加载数据失败');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (id) {
        await articleApi.updateArticle(Number(id), values);
        message.success('文章更新成功');
      } else {
        await articleApi.createArticle(values);
        message.success('文章创建成功');
      }
      navigate('/admin/articles');
    } catch {
      message.error('保存文章失败');
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
            label="摘要"
            name="summary"
          >
            <TextArea rows={2} placeholder="文章摘要" />
          </Form.Item>

          <Form.Item
            label="封面图片URL"
            name="coverImage"
          >
            <Input placeholder="https://..." />
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
            <TextArea rows={20} placeholder="使用 Markdown 编写文章内容..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate('/admin/articles')}
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
