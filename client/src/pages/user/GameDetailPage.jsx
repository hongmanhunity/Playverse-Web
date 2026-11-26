import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Skeleton, Empty, Tabs, Breadcrumb, Typography, Tag, Space, message } from 'antd';
import {
  ArrowLeftOutlined,
  CommentOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  HomeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import interactionApi from '../../api/interactionApi';
import { useAuth } from '../../hooks/useAuth';
import GameGallery from '../../components/user/GameGallery';
import GameOverviewCard from '../../components/user/GameOverviewCard';
import GameReviewsTab from '../../components/user/GameReviewsTab';
import GameLevelsTab from '../../components/user/GameLevelsTab';
import GameLeaderboardTab from '../../components/user/GameLeaderboardTab';

const { Title, Paragraph } = Typography;

const GameDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [gameLeaderboard, setGameLeaderboard] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const userId = user?._id;

  const loadGameData = useCallback(async () => {
    try {
      const [gameRes, reviewRes, lbRes] = await Promise.all([
        gameApi.getById(id),
        interactionApi.getReviewsByGame(id),
        interactionApi.getGameLeaderboard(id).catch(() => ({ data: [] })),
      ]);

      const fetchedGame = gameRes.data;
      setGame(fetchedGame);
      setReviews(reviewRes.data || []);
      setGameLeaderboard(lbRes.data || []);

      if (userId && fetchedGame?._id) {
        try {
          const wlRes = await interactionApi.getWishlist();
          setIsWishlisted((wlRes.data || []).some((item) => item._id === fetchedGame._id));
        } catch {
          setIsWishlisted(false);
        }
      } else {
        setIsWishlisted(false);
      }
    } catch {
      message.error('Không tải được thông tin game');
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await loadGameData();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [loadGameData]);

  const handleToggleWishlist = async () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để lưu game yêu thích');
      navigate('/login');
      return;
    }
    setTogglingWishlist(true);
    try {
      const res = await interactionApi.toggleWishlist(game._id);
      setIsWishlisted(res.isWishlisted);
      message.success(res.message);
    } catch (error) {
      message.error(error.message || 'Thao tác thất bại');
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleAddReview = async (values) => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để gửi đánh giá');
      navigate('/login');
      return false;
    }
    setSubmittingReview(true);
    try {
      const res = await interactionApi.addReview(game._id, values);
      message.success(res.message);
      await loadGameData();
      return true;
    } catch (error) {
      message.error(error.message || 'Gửi đánh giá thất bại');
      return false;
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Card className="pv-modern-card" style={{ borderRadius: 16, padding: 24 }}>
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (!game) {
    return (
      <Card className="pv-modern-card" style={{ borderRadius: 16, padding: 48, textAlign: 'center' }}>
        <Empty description="Không tìm thấy game này" />
      </Card>
    );
  }

  const mediaList = Array.from(
    new Set([game.heroBanner, game.thumbnail, ...(game.screenshots || [])].filter(Boolean))
  );

  const tabItems = [
    {
      key: 'reviews',
      label: (
        <span>
          <CommentOutlined style={{ marginRight: 6 }} />
          Đánh giá ({reviews.length})
        </span>
      ),
      children: (
        <GameReviewsTab
          game={game}
          reviews={reviews}
          user={user}
          submitting={submittingReview}
          onSubmitReview={handleAddReview}
        />
      ),
    },
    {
      key: 'levels',
      label: (
        <span>
          <ThunderboltOutlined style={{ marginRight: 6 }} />
          Màn chơi & Thử thách ({game.levels?.length || 0})
        </span>
      ),
      children: <GameLevelsTab levels={game.levels} />,
    },
    {
      key: 'leaderboard',
      label: (
        <span>
          <TrophyOutlined style={{ marginRight: 6 }} />
          Bảng xếp hạng ({gameLeaderboard.length})
        </span>
      ),
      children: <GameLeaderboardTab leaderboard={gameLeaderboard} />,
    },
  ];

  return (
    <div>
      {/* Thanh điều hướng Breadcrumb + Quay lại tinh gọn */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/">
                  <HomeOutlined style={{ marginRight: 4 }} />
                  Cửa hàng
                </Link>
              ),
            },
            { title: game.category },
            { title: game.title },
          ]}
        />

        <Button type="text" size="small" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ color: '#475569' }}>
          Quay lại
        </Button>
      </div>

      {/* Khối trên (2 cột 15/9 căn bằng chiều cao trái - phải) */}
      <Row gutter={[24, 20]} align="stretch" style={{ marginBottom: 40 }}>
        <Col xs={24} lg={15} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GameGallery title={game.title} mediaList={mediaList} />

          <Card
            className="pv-modern-card"
            style={{ borderRadius: 14, flex: 1 }}
            styles={{ body: { padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <Title
                level={5}
                className="font-heading"
                style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <FileTextOutlined style={{ color: '#4F46E5' }} />
                Giới thiệu tựa game
              </Title>

              {game.tags?.length > 0 && (
                <Space wrap size={[6, 6]}>
                  {game.tags.map((tag) => (
                    <Tag key={tag} style={{ background: '#F8FAFC', borderColor: '#E2E8F0', color: '#475569', borderRadius: 999, padding: '1px 9px', margin: 0, fontSize: 11.5 }}>
                      #{tag}
                    </Tag>
                  ))}
                </Space>
              )}
            </div>

            <Paragraph style={{ color: '#334155', fontSize: 14, lineHeight: 1.65, marginBottom: 0, whiteSpace: 'pre-line' }}>
              {game.description}
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} lg={9} style={{ display: 'flex' }}>
          <GameOverviewCard
            game={game}
            isWishlisted={isWishlisted}
            togglingWishlist={togglingWishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        </Col>
      </Row>

      {/* Phần dưới: Đánh giá, Màn chơi & Bảng xếp hạng trải rộng toàn trang */}
      <Card className="pv-modern-card" style={{ borderRadius: 16 }} styles={{ body: { padding: '14px 24px 24px' } }}>
        <Tabs defaultActiveKey="reviews" items={tabItems} size="large" />
      </Card>
    </div>
  );
};

export default GameDetailPage;
