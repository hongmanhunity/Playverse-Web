import { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthCardLayout from '../../components/auth/AuthCardLayout';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await login({ email: values.email, password: values.password });
      message.success('Đăng nhập thành công!');
      if (res.data?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      mode="login"
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để quản lý danh sách yêu thích và gửi đánh giá."
    >
      <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false} initialValues={{ remember: true }}>
        <Form.Item
          name="email"
          label="Email"
          style={{ marginBottom: 16 }}
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input prefix={<MailOutlined style={{ color: '#94A3B8' }} />} placeholder="example@gmail.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          style={{ marginBottom: 12 }}
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="Nhập mật khẩu" />
        </Form.Item>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <Form.Item name="remember" valuePropName="checked" style={{ margin: 0 }}>
            <Checkbox style={{ fontSize: 13.5, color: '#475569' }}>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>

          <Link to="/forgot-password" style={{ color: '#4F46E5', fontSize: 13.5, fontWeight: 500 }}>
            Quên mật khẩu?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 44, fontWeight: 600 }}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </AuthCardLayout>
  );
};

export default LoginPage;
