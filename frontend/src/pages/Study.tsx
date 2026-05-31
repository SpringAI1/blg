import { Card, List, Typography, Button, Tag, Space, Empty, Spin, Progress } from 'antd';
import { BookOutlined, PlayCircleOutlined, CheckCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title, Text, Paragraph } = Typography;

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  progress: number;
  lessons: number;
  completedLessons: number;
  students: number;
  icon: string;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  courses: number;
  duration: string;
  level: string;
  icon: string;
}

const Study = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'paths'>('courses');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const mockCourses: Course[] = [
        {
          id: 1,
          title: 'Java入门到精通',
          description: '从零开始学习Java编程，掌握Java基础语法、面向对象思想和常用框架。',
          category: 'Java',
          progress: 65,
          lessons: 120,
          completedLessons: 78,
          students: 15420,
          icon: '☕',
        },
        {
          id: 2,
          title: 'Python数据分析',
          description: '学习Python数据分析的核心技能，包括Pandas、NumPy和数据可视化。',
          category: 'Python',
          progress: 30,
          lessons: 85,
          completedLessons: 25,
          students: 23150,
          icon: '🐍',
        },
        {
          id: 3,
          title: 'React实战开发',
          description: '深入学习React生态系统，包括Hooks、Redux和Next.js。',
          category: '前端',
          progress: 0,
          lessons: 95,
          completedLessons: 0,
          students: 12380,
          icon: '⚛️',
        },
        {
          id: 4,
          title: '机器学习基础',
          description: '机器学习入门课程，涵盖监督学习、无监督学习和深度学习基础。',
          category: 'AI',
          progress: 15,
          lessons: 150,
          completedLessons: 22,
          students: 35670,
          icon: '🤖',
        },
      ];

      const mockPaths: LearningPath[] = [
        {
          id: 1,
          title: 'Java工程师学习路径',
          description: '从Java基础到高级架构师的学习路径，循序渐进掌握Java核心技术。',
          courses: 15,
          duration: '120小时',
          level: '中级',
          icon: '☕',
        },
        {
          id: 2,
          title: '前端工程师学习路径',
          description: '从HTML/CSS到React/Vue全栈开发，打造完整的前端知识体系。',
          courses: 18,
          duration: '150小时',
          level: '初级',
          icon: '⚛️',
        },
        {
          id: 3,
          title: 'AI工程师学习路径',
          description: '从机器学习基础到深度学习实战，迈向AI工程师的必经之路。',
          courses: 20,
          duration: '200小时',
          level: '高级',
          icon: '🤖',
        },
      ];

      setCourses(mockCourses);
      setPaths(mockPaths);
    } catch (error) {
      console.error('Failed to fetch study data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Title level={2} style={{ margin: 0 }}>学习中心</Title>
      </div>

      <div style={styles.tabs}>
        <Button
          type={activeTab === 'courses' ? 'primary' : 'default'}
          icon={<BookOutlined />}
          onClick={() => setActiveTab('courses')}
        >
          我的课程
        </Button>
        <Button
          type={activeTab === 'paths' ? 'primary' : 'default'}
          icon={<TeamOutlined />}
          onClick={() => setActiveTab('paths')}
        >
          学习路径
        </Button>
      </div>

      {activeTab === 'courses' ? (
        courses.length === 0 ? (
          <Empty description="暂无学习课程" />
        ) : (
          <List
            dataSource={courses}
            renderItem={(course) => (
              <List.Item style={styles.listItem}>
                <Card hoverable style={{ width: '100%' }}>
                  <div style={styles.courseContent}>
                    <div style={styles.iconBox}>
                      <span style={{ fontSize: 36 }}>{course.icon}</span>
                    </div>
                    <div style={styles.courseInfo}>
                      <div style={styles.courseHeader}>
                        <Title level={4} style={{ margin: 0 }}>{course.title}</Title>
                        <Tag color="blue">{course.category}</Tag>
                      </div>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ margin: '12px 0', color: '#666' }}>
                        {course.description}
                      </Paragraph>
                      <div style={styles.courseMeta}>
                        <Space size="large">
                          <span>课程数: {course.lessons}</span>
                          <span>学习人数: {course.students.toLocaleString()}</span>
                          <span>
                            已完成: {course.completedLessons}/{course.lessons}
                          </span>
                        </Space>
                      </div>
                      <div style={styles.progressSection}>
                        <Progress
                          percent={course.progress}
                          status="active"
                          strokeColor="#1890ff"
                        />
                      </div>
                    </div>
                    <div style={styles.courseActions}>
                      <Button type="primary" icon={<PlayCircleOutlined />} size="large">
                        {course.progress > 0 ? '继续学习' : '开始学习'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
          dataSource={paths}
          renderItem={(path) => (
            <List.Item>
              <Card hoverable style={styles.pathCard}>
                <div style={styles.pathIcon}>
                  <span style={{ fontSize: 48 }}>{path.icon}</span>
                </div>
                <Title level={4} style={{ marginTop: 16 }}>{path.title}</Title>
                <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666', margin: '12px 0' }}>
                  {path.description}
                </Paragraph>
                <div style={styles.pathMeta}>
                  <Space size="middle">
                    <Tag icon={<BookOutlined />}>{path.courses}门课程</Tag>
                    <Tag>{path.duration}</Tag>
                    <Tag color={path.level === '初级' ? 'green' : path.level === '中级' ? 'orange' : 'red'}>
                      {path.level}
                    </Tag>
                  </Space>
                </div>
                <Button type="primary" block style={{ marginTop: 16 }}>
                  开始学习
                </Button>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#fff',
    borderRadius: 8,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  tabs: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
  },
  listItem: {
    padding: '16px 0',
  },
  courseContent: {
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 80,
    height: 80,
    background: '#f5f5f5',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  courseInfo: {
    flex: 1,
  },
  courseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  courseMeta: {
    color: '#999',
    fontSize: 13,
    marginTop: 8,
  },
  progressSection: {
    marginTop: 12,
  },
  courseActions: {
    flexShrink: 0,
  },
  pathCard: {
    textAlign: 'center',
    height: '100%',
  },
  pathIcon: {
    marginBottom: 8,
  },
  pathMeta: {
    marginTop: 12,
  },
};

export default Study;
