import { Card, Row, Col, Typography, Tag, Rate, Button, Space, Tooltip, message } from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  ShopOutlined,
  HddOutlined,
  CloudDownloadOutlined,
  CalendarOutlined,
  TeamOutlined,
  ShareAltOutlined,
  ThunderboltOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatDateVi, getDiscountedPrice } from '../../utils/formatters';

const { Title, Text } = Typography;

const GameOverviewCard = ({ game, isWishlisted, togglingWishlist, onToggleWishlist }) => {
  const navigate = useNavigate();
  const hasDiscount = game.price > 0 && game.discount > 0;
  const finalPrice =
    game.price === 0
      ? 'Miễn phí'
      : `$${getDiscountedPrice(game.price, game.discount).toFixed(2)}`;

  const specItems = [
    { icon: <ShopOutlined />, label: 'Nhà phát hành', value: game.publisher || 'PlayVerse Studio' },
    { icon: <HddOutlined />, label: 'Dung lượng', value: game.size || '1.0 GB' },
    { icon: <CloudDownloadOutlined />, label: 'Lượt tải xuống', value: game.downloads || '1M+' },
    { icon: <CalendarOutlined />, label: 'Cập nhật', value: formatDateVi(game.updatedAt) },
    {
      icon: <ThunderboltOutlined />,
      label: 'Thử thách',
      value: game.levels?.length ? `${game.levels.length} màn chơi` : 'Chế độ tự do',
    },
    {
      icon: <StarOutlined />,
      label: 'Xếp hạng',
      value: game.averageRating ? `${game.averageRating}/5 (${game.reviewCount || 0})` : 'Chưa có đánh giá',
    },
  ];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết trò chơi');
    } catch {
      message.info('Hãy sao chép đường dẫn trên thanh trình duyệt để chia sẻ');
    }
  };

  return (
    <Card
      className="pv-modern-card"
      style={{ borderRadius: 16, overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Ảnh bìa ngang phía trên Sidebar */}
      <div style={{ position: 'relative', height: 210, flexShrink: 0, background: '#0F172A', overflow: 'hidden' }}>
        <img
          src={game.thumbnail || game.heroBanner}
          alt={game.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {hasDiscount && (
          <div
            className="font-mono-num"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 12.5,
              padding: '2px 9px',
              borderRadius: 7,
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.35)',
            }}
          >
            -{game.discount}%
          </div>
        )}
      </div>

      <div
        style={{
          padding: '18px 20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
            <Tag color="geekblue" style={{ fontWeight: 500, borderRadius: 999, padding: '1px 10px', margin: 0 }}>
              {game.category}
            </Tag>
            <Space size={5}>
              <Rate disabled allowHalf value={game.averageRating} style={{ fontSize: 12.5 }} />
              <Text className="font-mono-num" strong style={{ color: '#0F172A', fontSize: 12.5 }}>
                {game.averageRating || 0}
              </Text>
              <Text type="secondary" className="font-mono-num" style={{ fontSize: 11.5 }}>
                ({(game.reviewCount || 0).toLocaleString('vi-VN')})
              </Text>
            </Space>
          </div>

          <Title level={3} className="font-heading" style={{ margin: '0 0 14px 0', color: '#0F172A', lineHeight: 1.3 }}>
            {game.title}
          </Title>

          {/* Giá + Hành động */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 10,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              marginBottom: 12,
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              Giá bản quyền
            </Text>
            <Space align="baseline" size={8}>
              {hasDiscount && (
                <Text delete type="secondary" className="font-mono-num" style={{ fontSize: 13 }}>
                  ${Number(game.price).toFixed(2)}
                </Text>
              )}
              <Title
                level={4}
                className="font-mono-num"
                style={{ color: game.price === 0 ? '#10B981' : '#4F46E5', margin: 0 }}
              >
                {finalPrice}
              </Title>
            </Space>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="large"
              type={isWishlisted ? 'default' : 'primary'}
              loading={togglingWishlist}
              icon={isWishlisted ? <HeartFilled style={{ color: '#EF4444' }} /> : <HeartOutlined />}
              onClick={onToggleWishlist}
              style={{
                flex: 1,
                fontWeight: 600,
                ...(isWishlisted
                  ? { borderColor: '#FCA5A5', background: '#FEF2F2', color: '#DC2626' }
                  : {}),
              }}
            >
              {isWishlisted ? 'Đã yêu thích' : 'Thêm yêu thích'}
            </Button>
            <Tooltip title="Thảo luận ở Cộng đồng">
              <Button size="large" icon={<TeamOutlined />} onClick={() => navigate('/community')} />
            </Tooltip>
            <Tooltip title="Sao chép link game">
              <Button size="large" icon={<ShareAltOutlined />} onClick={handleShare} />
            </Tooltip>
          </div>
        </div>

        {/* Thông số kỹ thuật chia 2x3 neo ở đáy card */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
          <Row gutter={[12, 12]}>
            {specItems.map((item) => (
              <Col key={item.label} xs={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ color: '#4F46E5', fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.2 }}>{item.label}</div>
                    <Text strong ellipsis style={{ color: '#0F172A', fontSize: 12.5, display: 'block' }}>
                      {item.value}
                    </Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default GameOverviewCard;
