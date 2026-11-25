import { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Typography, Space, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, ArrowLeftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authApi from '../../api/authApi';
import AuthCardLayout from '../../components/auth/AuthCardLayout';

const { Text } = Typography;

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [pendingEmail, setPendingEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { register, verifyRegisterOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const onFinishRegister = async (values) => {
    setLoading(true);
    try {
      const { confirmPassword: _, ...payload } = values;
      const res = await register(payload);
      setPendingEmail(res.data?.email || values.email);
      setDevOtp(res.data?.devOtp || '');
      setCountdown(60);
      setStep(2);
      message.success(res.message);
    } catch (error) {
      message.error(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onFinishOtp = async (values) => {
    setLoading(true);
    try {
      await verifyRegisterOtp({ email: pendingEmail, otp: values.otp });
      message.success('Xác thực OTP thành công! Chào mừng đến với PlayVerse.');
      navigate('/');
    } catch (error) {
      message.error(error.message || 'Mã OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const res = await authApi.resendRegisterOtp({ email: pendingEmail });
      setDevOtp(res.data?.devOtp || '');
      setCountdown(60);
      message.success(res.message);
    } catch (error) {
      message.error(error.message || 'Không thể gửi lại mã');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCardLayout
      mode="register"
      title={step === 1 ? 'Tạo tài khoản mới' : 'Kiểm tra hộp thư'}
      subtitle={
        step === 1
          ? 'Điền thông tin bên dưới để nhận mã xác thực OTP.'
          : 'Nhập mã xác nhận 6 chữ số vừa được gửi đến email của bạn.'
      }
    >
      {step === 1 ? (
        <Form layout="vertical" onFinish={onFinishRegister} size="middle" requiredMark={false}>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            style={{ marginBottom: 12 }}
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { min: 3, message: 'Ít nhất 3 ký tự' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Chỉ gồm chữ cái, số và dấu gạch dưới (_)' },
            ]}
          >
            <Input prefix={<UserOutlined style={{ color: '#94A3B8' }} />} placeholder="vd: gamer_pro" style={{ height: 38 }} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            style={{ marginBottom: 12 }}
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94A3B8' }} />} placeholder="vd: gamer@gmail.com" style={{ height: 38 }} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            style={{ marginBottom: 12 }}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="Tối thiểu 6 ký tự" style={{ height: 38 }} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            style={{ marginBottom: 14 }}
            rules={[
              { required: true, message: 'Vui lòng nhập lại mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="Nhập lại mật khẩu" style={{ height: 38 }} />
          </Form.Item>

          <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 42, fontWeight: 600 }}>
              Tiếp tục
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form layout="vertical" onFinish={onFinishOtp} requiredMark={false}>
          {/* Thẻ hiển thị địa chỉ email nhận OTP */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 10,
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              marginBottom: 18,
            }}
          >
            <MailOutlined style={{ color: '#4F46E5', fontSize: 16 }} />
            <Text strong style={{ color: '#1E1B4B', fontSize: 13.5 }}>
              {pendingEmail}
            </Text>
          </div>

          {devOtp && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16, borderRadius: 10 }}
              message={
                <span>
                  Mã OTP (Dev Mode): <strong>{devOtp}</strong>
                </span>
              }
            />
          )}

          <Form.Item
            name="otp"
            label="Mã xác thực (6 số)"
            style={{ marginBottom: 20 }}
            rules={[
              { required: true, message: 'Vui lòng nhập đủ 6 số OTP' },
              { len: 6, message: 'Mã OTP gồm đúng 6 chữ số' },
            ]}
          >
            <Input.OTP length={6} className="pv-otp-input" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              icon={<SafetyCertificateOutlined />}
              loading={loading}
              style={{ height: 44, fontWeight: 600 }}
            >
              Xác nhận & Hoàn tất
            </Button>
          </Form.Item>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 12,
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <Button
              type="text"
              size="small"
              icon={<ArrowLeftOutlined style={{ fontSize: 11 }} />}
              style={{ padding: 0, color: '#64748B' }}
              onClick={() => setStep(1)}
            >
              Sửa thông tin
            </Button>

            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Chưa nhận được?
              </Text>
              <Button
                type="link"
                size="small"
                style={{ padding: 0, fontWeight: 600 }}
                disabled={countdown > 0}
                loading={resending}
                onClick={handleResendOtp}
              >
                {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã'}
              </Button>
            </Space>
          </div>
        </Form>
      )}
    </AuthCardLayout>
  );
};

export default RegisterPage;
