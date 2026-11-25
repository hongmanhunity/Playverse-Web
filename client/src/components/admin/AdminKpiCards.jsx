import { Row, Col, Card, Statistic, Button, Typography } from 'antd';
import {
  AppstoreOutlined,
  TeamOutlined,
  PictureOutlined,
  BellOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const AdminKpiCards = ({ stats, loading }) => {
  const navigate = useNavigate();

  const items = [
    {
      title: 'Tổng số Game',
      value: stats.games,
      icon: <AppstoreOutlined />,
      color: '#4F46E5',
      bg: '#EEF2FF',
      link: '/admin/games',
      linkText: 'Quản lý kho game',
    },
    {
      title: 'Người dùng',
      value: stats.users,
      icon: <TeamOutlined />,
      color: '#10B981',
      bg: '#ECFDF5',
      link: '/admin/users',
      linkText: 'Quản lý người dùng',
    },
    {
      title: 'Banner Trang chủ',
      value: stats.banners,
      icon: <PictureOutlined />,
      color: '#0284C7',
      bg: '#E0F2FE',
      link: '/admin/banners',
      linkText: 'Quản lý banner',
    },
    {
      title: 'Thông báo Hệ thống',
      value: stats.notifications,
      icon: <BellOutlined />,
      color: '#D97706',
      bg: '#FEF3C7',
      link: '/admin/notifications',
      linkText: 'Quản lý thông báo',
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.title} xs={24} sm={12} xl={6}>
          <Card
            className="admin-kpi-card"
            loading={loading}
            styles={{ body: { padding: '20px 20px 14px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Statistic
                title={<Text style={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>{item.title}</Text>}
                value={item.value}
                valueStyle={{
                  fontFamily: "'Fira Code', monospace",
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: 28,
                }}
              />
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: item.bg,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                {item.icon}
              </div>
            </div>

            <Button
              type="link"
              size="small"
              style={{ padding: 0, marginTop: 10, color: item.color, fontWeight: 500 }}
              onClick={() => navigate(item.link)}
            >
              {item.linkText} <ArrowRightOutlined style={{ fontSize: 11 }} />
            </Button>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AdminKpiCards;
