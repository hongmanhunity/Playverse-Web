import { useState } from 'react';
import { Row, Col, Card, Avatar, Tag, Typography, Form, Input, Button, Space, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, TrophyOutlined, SafetyCertificateOutlined, PictureOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
];

const ProfilePage = () => {
  const { user, isAdmin, updateProfile, changePassword } = useAuth();
  const [avatarForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');

  const handleSaveAvatar = async (values) => {
    setSavingAvatar(true);
    try {
      await updateProfile({ avatar: values.avatar });
      message.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      message.error(error.message || 'Cập nhật thất bại');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleChangePassword = async (values) => {
    setSavingPassword(true);
    try {
      const res = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success(res.message || 'Đổi mật khẩu thành công');
      passwordForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={8}>
        <Card className="pv-modern-card" style={{ borderRadius: 16, textAlign: 'center' }}>
          <Avatar
            src={previewAvatar || user?.avatar}
            icon={<UserOutlined />}
            size={96}
            style={{ backgroundColor: '#4F46E5', marginBottom: 14, border: '3px solid #E0E7FF' }}
          />
          <Title level={4} className="font-heading" style={{ margin: '0 0 4px 0', color: '#0F172A' }}>
            {user?.username}
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 14 }}>
            {user?.email}
          </Text>

          <Space wrap style={{ justifyContent: 'center' }}>
            <Tag color={isAdmin ? 'volcano' : 'geekblue'}>{isAdmin ? 'Admin' : 'Thành viên'}</Tag>
            <Tag color="gold">Level {user?.level || 1}</Tag>
            <Tag color="green" icon={<TrophyOutlined />}>
              {(user?.points || 0).toLocaleString('vi-VN')} điểm
            </Tag>
          </Space>

          <Divider style={{ margin: '18px 0' }} />

          <Text type="secondary" style={{ fontSize: 12.5 }}>
            Mọi thay đổi mật khẩu sẽ tự động đăng xuất khỏi các thiết bị khác để bảo vệ tài khoản.
          </Text>
        </Card>
      </Col>

      <Col xs={24} md={16}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Card className="pv-modern-card" style={{ borderRadius: 16 }}>
            <Title level={5} className="font-heading" style={{ margin: '0 0 14px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <PictureOutlined style={{ color: '#4F46E5' }} />
              Cập nhật ảnh đại diện (Avatar)
            </Title>

            <Form
              form={avatarForm}
              layout="vertical"
              initialValues={{ avatar: user?.avatar || '' }}
              onFinish={handleSaveAvatar}
            >
              <Form.Item
                name="avatar"
                label="Đường dẫn ảnh (URL)"
                rules={[
                  { required: true, message: 'Vui lòng nhập URL ảnh đại diện' },
                  { type: 'url', message: 'URL ảnh không hợp lệ' },
                ]}
              >
                <Input
                  placeholder="https://..."
                  onChange={(e) => setPreviewAvatar(e.target.value)}
                />
              </Form.Item>

              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>
                  Hoặc chọn nhanh ảnh gợi ý:
                </Text>
                <Space size={10}>
                  {PRESET_AVATARS.map((url) => (
                    <Avatar
                      key={url}
                      src={url}
                      size={40}
                      style={{
                        cursor: 'pointer',
                        border: previewAvatar === url ? '2px solid #4F46E5' : '2px solid transparent',
                      }}
                      onClick={() => {
                        avatarForm.setFieldValue('avatar', url);
                        setPreviewAvatar(url);
                      }}
                    />
                  ))}
                </Space>
              </div>

              <Button type="primary" htmlType="submit" loading={savingAvatar}>
                Lưu ảnh đại diện
              </Button>
            </Form>
          </Card>

          <Card className="pv-modern-card" style={{ borderRadius: 16 }}>
            <Title level={5} className="font-heading" style={{ margin: '0 0 14px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <SafetyCertificateOutlined style={{ color: '#10B981' }} />
              Đổi mật khẩu & Bảo mật
            </Title>

            <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="Nhập mật khẩu hiện tại" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                      { min: 6, message: 'Mật khẩu mới tối thiểu 6 ký tự' },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="Tối thiểu 6 ký tự" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="Nhập lại mật khẩu mới" />
                  </Form.Item>
                </Col>
              </Row>

              <Button type="primary" htmlType="submit" loading={savingPassword}>
                Đổi mật khẩu
              </Button>
            </Form>
          </Card>
        </Space>
      </Col>
    </Row>
  );
};

export default ProfilePage;
