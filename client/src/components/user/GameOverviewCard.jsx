import { Row, Col, Typography, Tag, Rate, Button, Space, Divider, Tooltip } from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  ShopOutlined,
  HddOutlined,
  CloudDownloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { formatDateVi, getDiscountedPrice } from '../../utils/formatters';

const { Title, Paragraph, Text } = Typography;

const GameOverviewCard = ({ game, isWishlisted, togglingWishlist, onToggleWishlist }) => {
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
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        {/* Hàng trên: Thể loại + Nút Yêu thích góc phải */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <Space wrap size={[6, 6]}>
            <Tag color="geekblue" style={{ fontWeight: 500, borderRadius: 999, padding: '2px 10px' }}>
              {game.category}
            </Tag>
            {game.tags?.map((t) => (
              <Tag key={t} style={{ background: '#F1F5F9', borderColor: '#E2E8F0', color: '#475569', borderRadius: 999 }}>
                {t}
              </Tag>
            ))}
          </Space>

          <Tooltip title={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}>
            <Button
              shape="circle"
              size="large"
              loading={togglingWishlist}
              icon={
                isWishlisted ? (
                  <HeartFilled style={{ color: '#EF4444', fontSize: 18 }} />
                ) : (
                  <HeartOutlined style={{ color: '#64748B', fontSize: 18 }} />
                )
              }
              onClick={onToggleWishlist}
              style={{
                flexShrink: 0,
                borderColor: isWishlisted ? '#FCA5A5' : '#E2E8F0',
                background: isWishlisted ? '#FEF2F2' : '#FFFFFF',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
              }}
            />
          </Tooltip>
        </div>

        {/* Tên Game */}
        <Title level={2} className="font-heading" style={{ margin: '0 0 10px 0', color: '#0F172A' }}>
          {game.title}
        </Title>

        {/* Giá + Đánh giá sao */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <Space align="baseline" size={8}>
            <Title
              level={3}
              className="font-mono-num"
              style={{ color: game.price === 0 ? '#10B981' : '#4F46E5', margin: 0 }}
            >
              {finalPrice}
            </Title>
            {hasDiscount && (
              <>
                <Text delete type="secondary" className="font-mono-num">
                  ${Number(game.price).toFixed(2)}
                </Text>
                <Tag color="error" style={{ fontWeight: 600, margin: 0 }}>
                  -{game.discount}%
                </Tag>
              </>
            )}
          </Space>

          <Divider type="vertical" style={{ height: 20, margin: 0 }} />

          <Space size={8}>
            <Rate disabled allowHalf value={game.averageRating} style={{ fontSize: 14 }} />
            <Text className="font-mono-num" strong style={{ color: '#0F172A', fontSize: 13 }}>
              {game.averageRating || 0}
            </Text>
            <Text type="secondary" className="font-mono-num" style={{ fontSize: 12 }}>
              ({(game.reviewCount || 0).toLocaleString('vi-VN')})
            </Text>
          </Space>
        </div>

        <Paragraph style={{ color: '#475569', lineHeight: 1.75, marginBottom: 20 }}>
          {game.description}
        </Paragraph>
      </div>

      {/* Grid 4 thông số cân đối 2x2 */}
      <Row gutter={[12, 12]}>
        {specItems.map((item) => (
          <Col key={item.label} xs={12}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#64748B' }}>{item.label}</div>
                <Text strong ellipsis style={{ color: '#0F172A', fontSize: 13, display: 'block' }}>
                  {item.value}
                </Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default GameOverviewCard;
