import { useState, useEffect } from 'react';
import { Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo';

const { Title, Text } = Typography;

const SHOWCASE_GAMES = [
  {
    title: 'Elden Ring',
    tag: 'Dark Fantasy RPG',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_943bf6fe62352757d9070c1d33e50b92fe8539f1.1920x1080.jpg',
  },
  {
    title: 'Black Myth: Wukong',
    tag: 'Action RPG',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/library_hero.jpg',
  },
  {
    title: 'God of War',
    tag: 'Action Adventure',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/ss_6eccc970b5de2943546d93d319be1b5c0618f21b.1920x1080.jpg',
  },
  {
    title: 'Red Dead Redemption 2',
    tag: 'Open World',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_66b553f4c209476d3e4ce25fa4714002cc914c4f.1920x1080.jpg',
  },
];

const AuthCardLayout = ({ mode = 'login', title, subtitle, children }) => {
  const isLogin = mode === 'login';
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_GAMES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentGame = SHOWCASE_GAMES[activeSlide];

  return (
    <Row style={{ minHeight: '100vh', width: '100%', background: '#FFFFFF' }}>
      {/* Nửa Trái: Dark Showcase #0F172A sang trọng + 1 khung 16:9 lớn tự chuyển slide mượt */}
      <Col
        xs={0}
        lg={13}
        style={{
          minHeight: '100vh',
          backgroundColor: '#0F172A',
          backgroundImage:
            'radial-gradient(circle at 18% 20%, rgba(79, 70, 229, 0.28) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.16) 0%, transparent 45%), radial-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 100% 100%, 24px 24px',
          borderRight: '1px solid #1E293B',
          padding: '40px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <BrandLogo size={28} light />
          </Link>
        </div>

        <div style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 28px 60px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(99, 102, 241, 0.2)',
              background: '#020617',
            }}
          >
            {SHOWCASE_GAMES.map((item, idx) => (
              <img
                key={item.title}
                src={item.image}
                alt={item.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: idx === 1 ? '75% center' : 'center',
                  opacity: idx === activeSlide ? 1 : 0,
                  transform: idx === activeSlide ? 'scale(1)' : 'scale(1.03)',
                  transition: 'opacity 750ms ease, transform 900ms ease',
                  display: 'block',
                }}
              />
            ))}

            {/* Overlay đáy hiển thị tên game & nút chọn slide */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 48%, rgba(2, 6, 23, 0.88) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '18px 22px',
                gap: 12,
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: 999,
                    background: 'rgba(99, 102, 241, 0.28)',
                    border: '1px solid rgba(165, 180, 252, 0.35)',
                    color: '#E0E7FF',
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 6,
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  {currentGame.tag}
                </span>
                <div style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
                  {currentGame.title}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 4 }}>
                {SHOWCASE_GAMES.map((item, idx) => {
                  const isActive = idx === activeSlide;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      aria-label={`Xem ${item.title}`}
                      onClick={() => setActiveSlide(idx)}
                      style={{
                        width: isActive ? 22 : 7,
                        height: 7,
                        borderRadius: 999,
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        background: isActive ? '#818CF8' : 'rgba(255, 255, 255, 0.35)',
                        transition: 'all 250ms ease',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <Title level={2} className="font-heading" style={{ color: '#F8FAFC', margin: '0 0 6px 0' }}>
              Play Beyond Limits.
            </Title>
            <Text style={{ color: '#94A3B8', fontSize: 15 }}>
              Kho trò chơi tuyển chọn, bảng xếp hạng &amp; cộng đồng PlayVerse.
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
