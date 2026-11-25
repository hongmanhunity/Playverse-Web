import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Typography, Button, Space, Input, Table, Tag, Image, Avatar, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, ArrowRightOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import userApi from '../../api/userApi';
import bannerApi from '../../api/bannerApi';
import notificationApi from '../../api/notificationApi';
import AdminKpiCards from '../../components/admin/AdminKpiCards';
import AdminGamesTable from '../../components/admin/AdminGamesTable';
import GameFormModal from '../../components/admin/GameFormModal';
import BannerFormModal from '../../components/admin/BannerFormModal';
import UserFormModal from '../../components/admin/UserFormModal';

const { Title, Text } = Typography;

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ games: 0, users: 0, banners: 0, notifications: 0 });
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal Game
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [savingGame, setSavingGame] = useState(false);

  // Modal Banner
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);

  // Modal User
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [savingUser, setSavingUser] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const gameParams = { page, limit: 6 };
      if (search) gameParams.search = search;

      const [pagedGamesRes, allGamesRes, usersRes, bannersRes, notifRes] = await Promise.all([
        gameApi.getAll(gameParams),
        gameApi.getAll({ limit: 100 }),
        userApi.getAll({ limit: 5 }).catch(() => ({ data: [], total: 0 })),
        bannerApi.getAll(),
        notificationApi.getAll(),
      ]);

      setGames(pagedGamesRes.data || []);
      setTotalGames(pagedGamesRes.total || 0);
      setAllGames(allGamesRes.data || []);
      setUsers(usersRes.data || []);
      setBanners(bannersRes.data || []);
      setStats({
        games: allGamesRes.total || pagedGamesRes.total || 0,
        users: usersRes.total || 0,
        banners: bannersRes.count || 0,
        notifications: notifRes.count || 0,
      });
    } catch {
      message.error('Không tải được dữ liệu Dashboard');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await loadDashboardData();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [loadDashboardData]);

  const handleSaveGame = async (values) => {
    setSavingGame(true);
    try {
      if (editingGame) {
        await gameApi.update(editingGame._id, values);
        message.success('Cập nhật game thành công!');
      } else {
        await gameApi.create(values);
        message.success('Thêm game mới thành công!');
      }
      setGameModalOpen(false);
      await loadDashboardData();
    } catch (error) {
      message.error(error.message || 'Thao tác thất bại');
    } finally {
      setSavingGame(false);
    }
  };

  const handleDeleteGame = async (id) => {
    try {
      await gameApi.delete(id);
      message.success('Đã xóa game');
      await loadDashboardData();
    } catch (error) {
      message.error(error.message || 'Xóa thất bại');
    }
  };

  const handleSaveBanner = async (values) => {
    setSavingBanner(true);
    try {
      if (editingBanner) {
        await bannerApi.update(editingBanner._id, values);
        message.success('Cập nhật banner thành công!');
      } else {
        await bannerApi.create(values);
        message.success('Tạo banner mới thành công!');
      }
      setBannerModalOpen(false);
      await loadDashboardData();
    } catch (error) {
      message.error(error.message || 'Thao tác thất bại');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleSaveUser = async (values) => {
    if (!editingUser) return;
    setSavingUser(true);
    try {
      await userApi.update(editingUser._id, values);
      message.success('Cập nhật người dùng thành công!');
      setUserModalOpen(false);
      await loadDashboardData();
    } catch (error) {
      message.error(error.message || 'Cập nhật thất bại');
    } finally {
      setSavingUser(false);
    }
  };

  const userColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'username',
      key: 'username',
      render: (name, record) => (
        <Space size={10}>
          <Avatar src={record.avatar} icon={<UserOutlined />} size="small" style={{ backgroundColor: '#4F46E5' }} />
          <div>
            <Text strong style={{ color: '#0F172A', display: 'block', fontSize: 13 }}>
              {name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 90,
      render: (r) => <Tag color={r === 'admin' ? 'volcano' : 'geekblue'}>{r === 'admin' ? 'Admin' : 'User'}</Tag>,
    },
    {
      title: '',
      key: 'action',
      width: 75,
      align: 'right',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<EditOutlined />}
          onClick={() => {
            setEditingUser(record);
            setUserModalOpen(true);
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  const bannerColumns = [
    {
      title: 'Banner',
      dataIndex: 'image',
      key: 'image',
      width: 90,
      render: (url) => (
        <Image src={url} width={76} height={42} style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #E2E8F0' }} />
      ),
    },
    {
      title: 'Tiêu đề & Game',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Text strong style={{ color: '#0F172A', display: 'block' }} ellipsis>
            {text}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.gameId?.title || 'Chưa gắn game'}
          </Text>
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      align: 'right',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<EditOutlined />}
          onClick={() => {
            setEditingBanner(record);
            setBannerModalOpen(true);
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Header Dashboard */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} className="font-heading" style={{ color: '#0F172A', margin: 0 }}>
            Bảng điều khiển Quản trị
          </Title>
          <Text type="secondary">
            Theo dõi số liệu hệ thống và chỉnh sửa trực tiếp kho Game, Banner ngay trên bảng tổng quan.
          </Text>
        </div>

        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBanner(null);
              setBannerModalOpen(true);
            }}
          >
            Thêm Banner
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingGame(null);
              setGameModalOpen(true);
            }}
          >
            Thêm Game mới
          </Button>
        </Space>
      </div>

      {/* 4 KPI Cards */}
      <AdminKpiCards stats={stats} loading={loading} />

      {/* Bảng Dữ liệu Game chính trên Dashboard (có quyền Sửa / Xóa) */}
      <Card
        className="pv-modern-card"
        style={{ marginTop: 24, borderRadius: 12 }}
        title={
          <Space>
            <span className="font-heading" style={{ fontSize: 16, color: '#0F172A' }}>
              Dữ liệu Kho Game
            </span>
            <Tag color="geekblue" className="font-mono-num">
              {totalGames}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Input.Search
              placeholder="Tìm nhanh game..."
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 240 }}
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
            />
            <Button type="link" onClick={() => navigate('/admin/games')} style={{ paddingRight: 0 }}>
              Trang quản lý đầy đủ <ArrowRightOutlined />
            </Button>
          </Space>
        }
      >
        <AdminGamesTable
          games={games}
          loading={loading}
          onEdit={(record) => {
            setEditingGame(record);
            setGameModalOpen(true);
          }}
          onDelete={handleDeleteGame}
          pagination={{
            current: page,
            total: totalGames,
            pageSize: 6,
            size: 'small',
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      {/* Hàng dưới: Banner & Thông báo */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={13}>
          <Card
            className="pv-modern-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={
              <span className="font-heading" style={{ fontSize: 15, color: '#0F172A' }}>
                Banner Trang chủ ({banners.length})
              </span>
            }
            extra={
              <Button type="link" size="small" onClick={() => navigate('/admin/banners')}>
                Xem tất cả <ArrowRightOutlined />
              </Button>
            }
          >
            <Table
              columns={bannerColumns}
              dataSource={banners.slice(0, 4)}
              rowKey="_id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={11}>
          <Card
            className="pv-modern-card"
            style={{ borderRadius: 12, height: '100%' }}
            title={
              <span className="font-heading" style={{ fontSize: 15, color: '#0F172A' }}>
                Người dùng hệ thống ({stats.users})
              </span>
            }
            extra={
              <Button type="link" size="small" onClick={() => navigate('/admin/users')}>
                Quản lý <ArrowRightOutlined />
              </Button>
            }
          >
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="_id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Modals Chỉnh sửa trực tiếp */}
      <GameFormModal
        open={gameModalOpen}
        editingGame={editingGame}
        submitting={savingGame}
        onCancel={() => setGameModalOpen(false)}
        onSubmit={handleSaveGame}
      />

      <BannerFormModal
        open={bannerModalOpen}
        editingBanner={editingBanner}
        games={allGames}
        submitting={savingBanner}
        onCancel={() => setBannerModalOpen(false)}
        onSubmit={handleSaveBanner}
      />

      <UserFormModal
        open={userModalOpen}
        editingUser={editingUser}
        submitting={savingUser}
        onCancel={() => setUserModalOpen(false)}
        onSubmit={handleSaveUser}
      />
    </div>
  );
};

export default AdminDashboardPage;
