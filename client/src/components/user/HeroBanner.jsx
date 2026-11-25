import { useRef } from 'react';
import { Row, Col, Card, Tag, Carousel, Typography, Space, Button, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const HeroBanner = ({ banners = [], loading = false }) => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  if (loading) {
    return (
      <div className="pv-hero-slide" style={{ marginBottom: 28, cursor: 'default' }}>
        <Row align="stretch">
          <Col xs={24} md={14}>
            <div className="pv-hero-media pv-hero-skeleton-media" />
          </Col>
          <Col
            xs={24}
            md={10}
            style={{
              padding: '32px 52px 32px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 60%, #EEF2FF 100%)',
            }}
          >
            <Skeleton active title={{ width: '75%' }} paragraph={{ rows: 3, width: ['45%', '95%', '80%'] }} />
            <Skeleton.Button active style={{ width: 132, height: 34, marginTop: 14, borderRadius: 8 }} />
          </Col>
        </Row>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <Card
        style={{
          marginBottom: 28,
          borderRadius: 16,
          border: '1px solid #E0E7FF',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 55%, #ECFDF5 100%)',
        }}
        styles={{ body: { padding: '36px 40px' } }}
      >
        <Tag color="geekblue" style={{ marginBottom: 12, fontWeight: 600 }}>
          PlayVerse Digital Store
        </Tag>
        <Title level={2} className="font-heading" style={{ margin: '0 0 8px 0', color: '#0F172A' }}>
          Kho trò chơi tuyển chọn & Cộng đồng đánh giá
        </Title>
        <Paragraph style={{ color: '#475569', marginBottom: 0, maxWidth: 640, fontSize: 15 }}>
          Khám phá hàng loạt tựa game hấp dẫn, đọc đánh giá thực tế từ cộng đồng và quản lý danh sách yêu thích của riêng bạn.
        </Paragraph>
      </Card>
    );
  }

  return (
    <div style={{ position: 'relative', marginBottom: 28 }}>
      <button
        type="button"
        aria-label="Banner trước"
        className="pv-hero-arrow"
        style={{ left: 14 }}
        onClick={() => carouselRef.current?.prev()}
      >
        <LeftOutlined style={{ fontSize: 13 }} />
      </button>
      <button
        type="button"
        aria-label="Banner tiếp theo"
        className="pv-hero-arrow"
        style={{ right: 14 }}
        onClick={() => carouselRef.current?.next()}
      >
        <RightOutlined style={{ fontSize: 13 }} />
      </button>

      <Carousel ref={carouselRef} autoplay autoplaySpeed={5000}>
        {banners.map((banner) => (
          <div key={banner._id}>
            <div
              className="pv-hero-slide"
              onClick={() => banner.gameId && navigate(`/games/${banner.gameId._id || banner.gameId}`)}
            >
              <Row align="stretch">
                <Col xs={24} md={14}>
                  <div className="pv-hero-media">
                    <img src={banner.image} alt={banner.title} />
                  </div>
                </Col>
                <Col
                  xs={24}
                  md={10}
                  style={{
                    padding: '32px 52px 32px 36px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 60%, #EEF2FF 100%)',
                  }}
                >
                  <Space direction="vertical" size={14}>
                    <Space>
                      <Tag color="geekblue" style={{ margin: 0, fontWeight: 600, borderRadius: 999, padding: '2px 10px' }}>
                        Tiêu điểm nổi bật
                      </Tag>
                      {banner.gameId?.category && (
                        <Tag style={{ margin: 0, color: '#475569', background: '#F1F5F9', borderColor: '#E2E8F0', borderRadius: 999, padding: '2px 10px' }}>
                          {banner.gameId.category.split(' - ')[0]}
                        </Tag>
                      )}
                    </Space>

                    <Title level={2} className="font-heading" style={{ color: '#0F172A', margin: 0, lineHeight: 1.25 }}>
                      {banner.title}
                    </Title>

                    <Text style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
                      {banner.gameId?.title
                        ? `Khám phá ngay tựa game ${banner.gameId.title} cùng hàng ngàn đánh giá từ cộng đồng PlayVerse.`
                        : 'Khám phá ngay những tựa game nổi bật nhất trong tuần tại PlayVerse.'}
                    </Text>

                    {banner.gameId && (
                      <Button
                        type="primary"
                        className="pv-btn-smooth"
                        icon={<RightOutlined style={{ fontSize: 12 }} />}
                        iconPosition="end"
                        style={{ width: 'fit-content', marginTop: 4 }}
                      >
                        Xem chi tiết
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default HeroBanner;
