import { Card, Tag, Space, Typography } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getDiscountedPrice } from '../../utils/formatters';

const { Title, Text } = Typography;

const GameCard = ({ game, actions }) => {
  const navigate = useNavigate();

  const renderPrice = () => {
    if (!game.price || game.price === 0) {
      return (
        <Tag color="success" style={{ margin: 0, fontWeight: 600 }}>
          Miễn phí
        </Tag>
      );
    }

    const finalPrice = getDiscountedPrice(game.price, game.discount);
    return (
      <Space size={8} align="baseline">
        <Text className="font-mono-num" strong style={{ color: '#4F46E5', fontSize: 15 }}>
          ${finalPrice.toFixed(2)}
        </Text>
        {game.discount > 0 && (
          <Text delete type="secondary" className="font-mono-num" style={{ fontSize: 12 }}>
            ${Number(game.price).toFixed(2)}
          </Text>
        )}
      </Space>
    );
  };

  return (
    <Card
      className="pv-game-card"
      onClick={() => navigate(`/games/${game._id}`)}
      styles={{ body: { padding: 16 } }}
      actions={actions}
      cover={
        <div className="pv-game-card-cover">
          <img alt={game.title} src={game.thumbnail} />
          {game.discount > 0 && <span className="pv-discount-badge">-{game.discount}%</span>}
        </div>
      }
      style={{ height: '100%', borderRadius: 12, overflow: 'hidden' }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <Tag
            color="geekblue"
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 500,
              maxWidth: 165,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {game.category}
          </Tag>
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {game.size}
          </Text>
        </div>

        <Title level={5} ellipsis={{ rows: 1 }} style={{ margin: 0, color: '#0F172A', fontWeight: 600 }}>
          {game.title}
        </Title>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StarFilled style={{ color: '#F59E0B', fontSize: 13 }} />
          <Text strong className="font-mono-num" style={{ fontSize: 13, color: '#0F172A' }}>
            {game.averageRating || 0}
          </Text>
          <Text style={{ color: '#64748B', fontSize: 12 }} className="font-mono-num">
            ({game.reviewCount || 0} đánh giá)
          </Text>
        </div>

        <div style={{ paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>{renderPrice()}</div>
      </Space>
    </Card>
  );
};

export default GameCard;
