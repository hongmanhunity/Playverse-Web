import { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Typography, Skeleton, Empty, Pagination } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import gameApi from '../../api/gameApi';
import bannerApi from '../../api/bannerApi';
import HeroBanner from '../../components/user/HeroBanner';
import GameFilterBar from '../../components/user/GameFilterBar';
import GameCard from '../../components/user/GameCard';

const { Title, Text } = Typography;

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await bannerApi.getAll();
        setBanners(res.data || []);
      } catch {
        // Bỏ qua lỗi banner nếu chưa có dữ liệu
      } finally {
        setBannersLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (search) params.search = search;
        if (category) params.category = category;
        if (sort) params.sort = sort;

        const res = await gameApi.getAll(params);
        setGames(res.data || []);
        setTotal(res.total || 0);
      } catch {
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [search, category, sort, page]);

  return (
    <div>
      <HeroBanner banners={banners} loading={bannersLoading} />

      <GameFilterBar
        category={category}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onSortChange={(val) => {
          setSort(val);
          setPage(1);
        }}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <Title level={4} className="font-heading" style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AppstoreOutlined style={{ color: '#4F46E5' }} />
          Danh sách trò chơi
          <Tag color="geekblue" className="font-mono-num" style={{ marginLeft: 4 }}>
            {total}
          </Tag>
        </Title>
      </div>

      {loading ? (
        <Row gutter={[20, 20]}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <Col key={idx} xs={24} sm={12} md={8} lg={6}>
              <Card className="pv-modern-card" style={{ borderRadius: 12 }}>
                <Skeleton.Image active style={{ width: '100%', height: 150, marginBottom: 16 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : games.length === 0 ? (
        <Card className="pv-modern-card" style={{ textAlign: 'center', padding: 48, borderRadius: 14 }}>
          <Empty description={<Text style={{ color: '#475569' }}>Chưa tìm thấy tựa game nào phù hợp</Text>} />
        </Card>
      ) : (
        <>
          <Row gutter={[20, 20]}>
            {games.map((game) => (
              <Col key={game._id} xs={24} sm={12} md={8} lg={6}>
                <GameCard game={game} />
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Pagination
              current={page}
              total={total}
              pageSize={12}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
