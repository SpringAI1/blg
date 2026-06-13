import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { authApi } from '@/api/auth';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPeek, setShowPeek] = useState(true);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values: { username: string; password: string; email: string }) => {
    setLoading(true);
    try {
      await authApi.register(values);
      message.success('注册成功！请登录');
      navigate('/login');
    } catch (error: any) {
      message.error(error?.message || '注册失败，用户名可能已存在');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* 左侧装饰区 */}
        <div style={styles.decoSection}>
          <div style={styles.characterArea}>
            {/* 小人 - 紫色侦探风 */}
            <div style={{
              ...styles.body,
              transform: showPeek ? 'translateY(0)' : 'translateY(80px)',
              opacity: showPeek ? 1 : 0,
            }}>
              {/* 侦探帽 */}
              <div style={styles.hat}>
                <div style={styles.hatTop} />
                <div style={styles.hatBrim} />
                <div style={styles.hatBand} />
              </div>
              {/* 头部 */}
              <div style={styles.head}>
                {/* 左眼 */}
                <div style={{
                  ...styles.eye,
                  left: 28,
                  height: passwordFocused ? 2 : 14,
                  top: passwordFocused ? 24 : 20,
                }} />
                {/* 右眼 */}
                <div style={{
                  ...styles.eye,
                  right: 28,
                  height: passwordFocused ? 2 : 14,
                  top: passwordFocused ? 24 : 20,
                }} />
                {/* 嘴巴 */}
                <div style={{
                  ...styles.mouth,
                  borderRadius: passwordFocused ? '0 0 20px 20px' : '20px 20px 0 0',
                }} />
                {/* 腮红 */}
                <div style={styles.blushLeft} />
                <div style={styles.blushRight} />
              </div>
              {/* 身子（紫色衣服） */}
              <div style={styles.torso}>
                <div style={styles.collar} />
                {/* 纽扣 */}
                <div style={styles.button1} />
                <div style={styles.button2} />
              </div>
              {/* 左手 */}
              <div style={styles.handLeft}>
                <div style={styles.fingers} />
              </div>
              {/* 右手 */}
              <div style={styles.handRight}>
                <div style={styles.fingers} />
              </div>
            </div>
            <div style={{
              ...styles.peekLabel,
              opacity: passwordFocused ? 0 : 0.7,
              transition: 'opacity 0.4s',
            }}>
              {passwordFocused ? '🙈 我啥也没看见~' : '🔍 新朋友来啦！'}
            </div>
          </div>
          <div style={styles.welcomeText}>
            <span style={{ fontSize: 32, marginBottom: 8, display: 'block' }}>🚀</span>
            <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>加入我们</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 13 }}>
              开启你的技术探索之旅
            </p>
          </div>
        </div>

        {/* 右侧表单区 */}
        <div style={styles.formSection}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>注册</h2>
            <p style={{ margin: '6px 0 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
              创建一个新账号
            </p>
          </div>

          <Form
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 20, message: '用户名最多20个字符' },
              ]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: 'var(--color-text-tertiary)' }} />} 
                placeholder="用户名" 
                style={{ borderRadius: 10, height: 46 }}
                onFocus={() => setShowPeek(true)}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: 'var(--color-text-tertiary)' }} />} 
                placeholder="邮箱" 
                style={{ borderRadius: 10, height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: 'var(--color-text-tertiary)' }} />} 
                placeholder="密码" 
                style={{ borderRadius: 10, height: 46 }}
                onFocus={() => { setPasswordFocused(true); setShowPeek(true); }}
                onBlur={() => setPasswordFocused(false)}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: 'var(--color-text-tertiary)' }} />} 
                placeholder="确认密码" 
                style={{ borderRadius: 10, height: 46 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 8 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block
                style={{ 
                  height: 46, 
                  borderRadius: 10, 
                  fontSize: 15, 
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(255,107,0,0.3)'
                }}
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>已有账号？</span>
            <Link to="/login" style={{ marginLeft: 4, fontSize: 13, fontWeight: 500 }}>去登录</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 88px)',
    padding: '24px 16px',
  },
  container: {
    display: 'flex',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 25px 80px rgba(0,0,0,0.12)',
    maxWidth: 820,
    width: '100%',
    background: '#fff',
    minHeight: 500,
  },
  decoSection: {
    flex: 1,
    background: 'linear-gradient(150deg, #667eea 0%, #764ba2 60%, #667eea 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative' as const,
    overflow: 'hidden',
    minHeight: 420,
  },
  characterArea: {
    position: 'relative' as const,
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  body: {
    position: 'relative' as const,
    width: 160,
    height: 200,
    margin: '0 auto',
    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s',
  },
  hat: {
    position: 'absolute' as const,
    top: 0,
    left: '50%',
    marginLeft: -35,
    zIndex: 10,
  },
  hatTop: {
    width: 70,
    height: 35,
    background: '#6b3fa0',
    borderRadius: '35px 35px 0 0',
    position: 'relative' as const,
  },
  hatBrim: {
    width: 90,
    height: 7,
    background: '#6b3fa0',
    borderRadius: 4,
    marginLeft: -10,
  },
  hatBand: {
    width: 70,
    height: 5,
    background: '#ffd700',
    marginTop: -12,
    marginLeft: 0,
    borderRadius: 2,
  },
  head: {
    position: 'absolute' as const,
    top: 32,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 72,
    background: '#ffe0bd',
    borderRadius: '40px 40px 35px 35px',
    zIndex: 5,
  },
  eye: {
    position: 'absolute' as const,
    width: 12,
    height: 14,
    background: '#2c2c2c',
    borderRadius: 6,
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  mouth: {
    position: 'absolute' as const,
    bottom: 12,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 8,
    background: '#e88',
    transition: 'border-radius 0.3s',
  },
  blushLeft: {
    position: 'absolute' as const,
    bottom: 16,
    left: 10,
    width: 14,
    height: 8,
    background: 'rgba(255,150,150,0.4)',
    borderRadius: 7,
  },
  blushRight: {
    position: 'absolute' as const,
    bottom: 16,
    right: 10,
    width: 14,
    height: 8,
    background: 'rgba(255,150,150,0.4)',
    borderRadius: 7,
  },
  torso: {
    position: 'absolute' as const,
    top: 98,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 68,
    background: '#7c3aed',
    borderRadius: '10px 10px 20px 20px',
  },
  collar: {
    position: 'absolute' as const,
    top: 0,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 8,
    background: '#fff',
    borderRadius: '0 0 12px 12px',
  },
  button1: {
    position: 'absolute' as const,
    top: 24,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    background: '#ffd700',
    borderRadius: 4,
  },
  button2: {
    position: 'absolute' as const,
    top: 40,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    background: '#ffd700',
    borderRadius: 4,
  },
  handLeft: {
    position: 'absolute' as const,
    top: 106,
    left: -8,
    width: 24,
    height: 40,
    background: '#ffe0bd',
    borderRadius: '12px 12px 0 0',
    transform: 'rotate(-15deg)',
    zIndex: 3,
  },
  handRight: {
    position: 'absolute' as const,
    top: 106,
    right: -8,
    width: 24,
    height: 40,
    background: '#ffe0bd',
    borderRadius: '12px 12px 0 0',
    transform: 'rotate(15deg)',
    zIndex: 3,
  },
  fingers: {
    width: 20,
    height: 10,
    background: '#ffe0bd',
    borderRadius: '0 0 10px 10px',
    position: 'absolute' as const,
    bottom: -6,
    left: 2,
  },
  peekLabel: {
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: 500,
    marginTop: 12,
  },
  welcomeText: {
    textAlign: 'center' as const,
  },
  formSection: {
    width: 380,
    padding: '40px 40px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
};

export default Register;
