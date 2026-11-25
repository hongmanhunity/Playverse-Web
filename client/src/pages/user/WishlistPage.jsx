import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Skeleton, Empty, message } from 'antd';
import { DeleteOutlined, HeartFilled } from '@ant-design/icons';
import interactionApi from '../../api/interactionApi';
import GameCard from '../../components/user/GameCard';

const { Title, Text } = Typography;

const WishlistPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await interactionApi.getWishlist();
        setGames(res.data || []);
      } catch {
        message.error('Không tải được danh sách yêu thích');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (e, gameId) => {
    e.stopPropagation();
    try {
      await interactionApi.toggleWishlist(gameId);
      message.success('Đã xóa khỏi danh sách yêu thích');
      setGames((prev) => prev.filter((g) => g._id !== gameId));
    } catch {
      message.error('Không thể xóa');
    }
  };

  return (
    <div>
      <Title level={3} className="font-heading" style={{ marginBottom: 24, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
        <HeartFilled style={{ color: '#EF4444' }} />
        Danh sách Game Yêu thích
      </Title>

      {loading ? (
        <Row gutter={[20, 20]}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Col key={idx} xs={24} sm={12} md={8} lg={6}>
              <Card className="pv-modern-card">
                <Skeleton active />
              </Card>
            </Col>
          ))}
        </Row>
      ) : games.length === 0 ? (
        <Card className="pv-modern-card" style={{ textAlign: 'center', padding: 48, borderRadius: 14 }}>
          <Empty description={<Text style={{ color: '#475569' }}>Bạn chưa thêm tựa game nào vào danh sách yêu thích</Text>} />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {games.map((game) => (
            <Col key={game._id} xs={24} sm={12} md={8} lg={6}>
              <GameCard
                game={game}
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleRemove(e, game._id)}
                  >
                    Bỏ thích
                  </Button>,
                ]}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default WishlistPage;
