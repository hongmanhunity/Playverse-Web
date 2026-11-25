import { useState } from 'react';
import { ConfigProvider, Layout, Menu, Button, Space, Avatar, Typography, Tag, theme } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  CommentOutlined,
  PictureOutlined,
  BellOutlined,
  ArrowLeftOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../components/BrandLogo';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Tổng quan</Link>,
    },
    {
      key: '/admin/games',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/games">Quản lý Game</Link>,
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: <Link to="/admin/users">Quản lý Người dùng</Link>,
    },
    {
      key: '/admin/community',
      icon: <CommentOutlined />,
      label: <Link to="/admin/community">Cộng đồng & Đánh giá</Link>,
    },
    {
      key: '/admin/banners',
      icon: <PictureOutlined />,
      label: <Link to="/admin/banners">Quản lý Banner</Link>,
    },
    {
      key: '/admin/notifications',
      icon: <BellOutlined />,
      label: <Link to="/admin/notifications">Thông báo</Link>,
    },
    { type: 'divider' },
    {
      key: '/',
      icon: <ArrowLeftOutlined />,
      label: <Link to="/">Về Cửa hàng</Link>,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4F46E5',
          colorInfo: '#4F46E5',
          colorBgLayout: '#F8FAFC',
          borderRadius: 10,
          fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          theme="light"
          style={{
            background: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
          }}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <BrandLogo collapsed={collapsed} size={23} />
          </div>

          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ marginTop: 12, borderRight: 'none' }}
          />
        </Sider>

        <Layout style={{ background: '#F8FAFC' }}>
          <Header
            style={{
              padding: '0 24px 0 12px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #E2E8F0',
              height: 64,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 44, height: 44 }}
            />

            <Space size="middle">
              <Space>
                <Avatar src={user?.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#4F46E5' }} />
                <div>
                  <Text strong style={{ color: '#0F172A' }}>
                    {user?.username}
                  </Text>
                  <Tag color="geekblue" style={{ marginLeft: 8 }}>
                    Admin
                  </Tag>
                </div>
              </Space>
              <Button danger ghost icon={<LogoutOutlined />} onClick={handleLogout}>
                Đăng xuất
              </Button>
            </Space>
          </Header>

          <Content
            style={{
              margin: '24px',
              padding: 24,
              minHeight: 280,
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
