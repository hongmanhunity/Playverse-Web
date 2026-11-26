import { ConfigProvider, Layout, Menu, Button, Avatar, Dropdown, Space, Tag, Typography, theme } from 'antd';
import {
  HomeOutlined,
  HeartOutlined,
  TrophyOutlined,
  TeamOutlined,
  SettingOutlined,
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../components/BrandLogo';
import NotificationBell from '../components/user/NotificationBell';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const UserLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">Khám phá</Link> },
    { key: '/community', icon: <TeamOutlined />, label: <Link to="/community">Cộng đồng</Link> },
    { key: '/wishlist', icon: <HeartOutlined />, label: <Link to="/wishlist">Yêu thích</Link> },
    { key: '/leaderboard', icon: <TrophyOutlined />, label: <Link to="/leaderboard">Bảng xếp hạng</Link> },
  ];

  const userMenuItems = [
    {
      key: 'info',
      disabled: true,
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong style={{ color: '#0F172A' }}>
            {user?.username}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Tag color={isAdmin ? 'volcano' : 'geekblue'}>{isAdmin ? 'Admin' : 'Thành viên'}</Tag>
            <Tag color="gold">Lv.{user?.level || 1}</Tag>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Hồ sơ & Bảo mật',
      onClick: () => navigate('/profile'),
    },
    ...(isAdmin
      ? [
          {
            key: 'admin',
            icon: <DashboardOutlined />,
            label: 'Trang Quản Trị (Admin)',
            onClick: () => navigate('/admin'),
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
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
          colorBgContainer: '#FFFFFF',
          colorTextBase: '#0F172A',
          colorTextSecondary: '#475569',
          colorBorder: '#E2E8F0',
          borderRadius: 10,
          fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <Header
          className="pv-light-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            height: 68,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: 1240,
              margin: '0 auto',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', marginRight: 36, textDecoration: 'none' }}>
                <BrandLogo size={25} />
              </Link>

              <Menu
                theme="light"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={navItems}
                style={{
                  flex: 1,
                  minWidth: 0,
                  borderBottom: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              />
            </div>

            <Space size="middle">
              <NotificationBell />
              {user ? (
                <>
                  {isAdmin && (
                    <Button type="primary" ghost icon={<DashboardOutlined />} onClick={() => navigate('/admin')}>
                      Quản trị Admin
                    </Button>
                  )}
                  <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                    <Space
                      size={8}
                      style={{
                        cursor: 'pointer',
                        height: 36,
                        lineHeight: 'normal',
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0 12px 0 6px',
                        borderRadius: 999,
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                      }}
                    >
                      <Avatar src={user.avatar} icon={<UserOutlined />} size={24} style={{ backgroundColor: '#4F46E5' }} />
                      <Text style={{ color: '#0F172A', fontWeight: 500, fontSize: 13 }}>{user.username}</Text>
                    </Space>
                  </Dropdown>
                </>
              ) : (
                <>
                  <Button type="text" icon={<LoginOutlined />} onClick={() => navigate('/login')} style={{ fontWeight: 500 }}>
                    Đăng nhập
                  </Button>
                  <Button type="primary" onClick={() => navigate('/register')} style={{ fontWeight: 500 }}>
                    Đăng ký
                  </Button>
                </>
              )}
            </Space>
          </div>
        </Header>

        <Content style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '28px 20px' }}>
          <Outlet />
        </Content>

        <Footer
          style={{
            textAlign: 'center',
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            color: '#475569',
            padding: '24px 16px',
            fontSize: 13,
          }}
        >
          PlayVerse Store © 2026 — Nền tảng khám phá và quản lý Game hiện đại
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default UserLayout;
