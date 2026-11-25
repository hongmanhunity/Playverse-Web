import { useState } from 'react';
import { Form, Input, Button, Alert, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import AuthCardLayout from '../../components/auth/AuthCardLayout';

const { Text } = Typography;

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [devCode, setDevCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: values.email });
      setEmail(values.email);
      setDevCode(res.devResetCode || '');
      message.success(res.message);
      setStep(2);
    } catch (error) {
      message.error(error.message || 'Không thể gửi yêu cầu khôi phục');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email,
        code: values.code,
        newPassword: values.newPassword,
      });
      message.success(res.message);
      navigate('/login');
    } catch (error) {
      message.error(error.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      mode="login"
      title={step === 1 ? 'Khôi phục mật khẩu' : 'Đặt lại mật khẩu mới'}
      subtitle={
        step === 1
          ? 'Nhập email tài khoản để nhận mã xác nhận 6 số.'
          : 'Nhập mã xác nhận từ hộp thư và tạo mật khẩu mới.'
      }
    >
      {step === 1 ? (
        <Form layout="vertical" onFinish={handleRequestCode} size="large" requiredMark={false}>
          <Form.Item
            name="email"
            label="Email tài khoản"
            style={{ marginBottom: 20 }}
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94A3B8' }} />} placeholder="example@gmail.com" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 14 }}>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 44, fontWeight: 600 }}>
              Gửi mã xác nhận
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#4F46E5', fontSize: 13.5, fontWeight: 500 }}>
              Quay lại đăng nhập
            </Link>
          </div>
        </Form>
      ) : (
        <Form layout="vertical" onFinish={handleResetPassword} size="middle" requiredMark={false}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              marginBottom: 16,
            }}
          >
            <MailOutlined style={{ color: '#4F46E5', fontSize: 16 }} />
            <Text strong style={{ color: '#1E1B4B', fontSize: 13.5 }}>
              {email}
            </Text>
          </div>

          {devCode && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 14, borderRadius: 10 }}
              message={
                <span>
                  Mã OTP (Dev Mode): <strong>{devCode}</strong>
                </span>
              }
            />
          )}

          <Form.Item
            name="code"
            label="Mã xác nhận (6 số)"
            style={{ marginBottom: 14 }}
            rules={[
              { required: true, message: 'Vui lòng nhập đủ 6 số OTP' },
              { len: 6, message: 'Mã OTP gồm đúng 6 chữ số' },
            ]}
          >
            <Input.OTP length={6} className="pv-otp-input" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            style={{ marginBottom: 18 }}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
              placeholder="Tối thiểu 6 ký tự"
              style={{ height: 40 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              icon={<SafetyCertificateOutlined />}
              loading={loading}
              style={{ height: 42, fontWeight: 600 }}
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button
              type="text"
              size="small"
              icon={<ArrowLeftOutlined style={{ fontSize: 11 }} />}
              style={{ color: '#64748B' }}
              onClick={() => setStep(1)}
            >
              Nhập lại email khác
            </Button>
          </div>
        </Form>
      )}
    </AuthCardLayout>
  );
};

export default ForgotPasswordPage;
