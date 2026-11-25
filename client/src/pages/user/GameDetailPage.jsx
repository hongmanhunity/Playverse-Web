import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Skeleton, Empty, Tabs, message } from 'antd';
import { ArrowLeftOutlined, CommentOutlined, ThunderboltOutlined, TrophyOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import interactionApi from '../../api/interactionApi';
import { useAuth } from '../../hooks/useAuth';
import GameGallery from '../../components/user/GameGallery';
import GameOverviewCard from '../../components/user/GameOverviewCard';
import GameReviewsTab from '../../components/user/GameReviewsTab';
import GameLevelsTab from '../../components/user/GameLevelsTab';
import GameLeaderboardTab from '../../components/user/GameLeaderboardTab';

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
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        Quay lại cửa hàng
      </Button>

      <Card className="pv-modern-card" style={{ borderRadius: 16, marginBottom: 24 }} styles={{ body: { padding: 28 } }}>
        <Row gutter={[32, 24]} align="stretch">
          <Col xs={24} lg={11}>
            <GameGallery title={game.title} mediaList={mediaList} />
          </Col>
          <Col xs={24} lg={13}>
            <GameOverviewCard
              game={game}
              isWishlisted={isWishlisted}
              togglingWishlist={togglingWishlist}
              onToggleWishlist={handleToggleWishlist}
            />
          </Col>
        </Row>
      </Card>

      <Card className="pv-modern-card" style={{ borderRadius: 16 }}>
        <Tabs defaultActiveKey="reviews" items={tabItems} size="large" />
      </Card>
    </div>
  );
};

export default GameDetailPage;
