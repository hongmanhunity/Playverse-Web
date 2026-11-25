import { Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo';

const { Title, Text } = Typography;

const SHOWCASE_GAMES = [
  {
    title: 'Cyberpunk 2077',
    tag: 'Action RPG',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_616x353.jpg',
  },
  {
    title: 'Elden Ring',
    tag: 'Open World',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
  },
];

const AuthCardLayout = ({ mode = 'login', title, subtitle, children }) => {
  const isLogin = mode === 'login';

  return (
    <Row style={{ minHeight: '100vh', width: '100%', background: '#FFFFFF' }}>
      {/* Nửa Trái: Full-height Visual Showcase sáng, thoáng, tỉ lệ ảnh chuẩn 16:9 */}
      <Col
        xs={0}
        lg={13}
        style={{
          minHeight: '100vh',
          backgroundColor: '#EEF2FF',
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(79, 70, 229, 0.14) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '100% 100%, 100% 100%, 24px 24px',
          borderRight: '1px solid #E2E8F0',
          padding: '40px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <BrandLogo size={28} />
          </Link>
        </div>

        {/* Khối ảnh game được lồng khung 16:9 sắc nét (không cắt méo ảnh) */}
        <div style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
          <div style={{ position: 'relative', paddingBottom: 48 }}>
            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.16)',
                background: '#FFFFFF',
                width: '88%',
              }}
            >
              <img
                src={SHOWCASE_GAMES[0].image}
                alt={SHOWCASE_GAMES[0].title}
                style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
              />
            </div>

            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '62%',
                borderRadius: 14,
                overflow: 'hidden',
                border: '3px solid #FFFFFF',
                boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.25)',
                background: '#FFFFFF',
              }}
            >
              <img
                src={SHOWCASE_GAMES[1].image}
                alt={SHOWCASE_GAMES[1].title}
                style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <Title level={2} className="font-heading" style={{ color: '#0F172A', margin: '0 0 6px 0' }}>
              Play Beyond Limits.
            </Title>
            <Text style={{ color: '#475569', fontSize: 15 }}>
              Kho trò chơi chọn lọc & Cộng đồng đánh giá PlayVerse.
            </Text>
          </div>
        </div>

        <Text style={{ color: '#64748B', fontSize: 13 }}>PlayVerse Digital Store</Text>
      </Col>

      {/* Nửa Phải: Full-height Form Canvas gói gọn trong 1 màn hình (100vh) */}
      <Col
        xs={24}
        lg={11}
        style={{
          minHeight: '100vh',
          background: '#FFFFFF',
          padding: '24px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#475569',
              fontSize: 13.5,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <ArrowLeftOutlined style={{ fontSize: 12 }} />
            Quay lại cửa hàng
          </Link>

          <div className="lg-hide-logo">
            <BrandLogo size={22} />
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 410, margin: '12px auto' }}>
          {/* Thanh chuyển Đăng nhập / Đăng ký */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
              padding: 4,
              borderRadius: 10,
              background: '#F1F5F9',
              marginBottom: 18,
            }}
          >
            <Link
              to="/login"
              style={{
                textAlign: 'center',
                padding: '7px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                background: isLogin ? '#FFFFFF' : 'transparent',
                color: isLogin ? '#0F172A' : '#64748B',
                boxShadow: isLogin ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 180ms ease',
              }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              style={{
                textAlign: 'center',
                padding: '7px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                background: !isLogin ? '#FFFFFF' : 'transparent',
                color: !isLogin ? '#0F172A' : '#64748B',
                boxShadow: !isLogin ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 180ms ease',
              }}
            >
              Đăng ký
            </Link>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Title level={3} className="font-heading" style={{ margin: '0 0 2px 0', color: '#0F172A' }}>
              {title}
            </Title>
            <Text style={{ color: '#64748B', fontSize: 13.5 }}>{subtitle}</Text>
          </div>

          {children}
        </div>

        <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center' }}>
          PlayVerse © 2026
        </Text>
      </Col>
    </Row>
  );
};

export default AuthCardLayout;
