import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Space, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import gameApi from '../../api/gameApi';
import AdminGamesTable from '../../components/admin/AdminGamesTable';
import GameFormModal from '../../components/admin/GameFormModal';

const { Title, Text } = Typography;

const AdminGamesPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadGames = useCallback(async () => {
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await gameApi.getAll(params);
      setGames(res.data || []);
      setTotal(res.total || 0);
    } catch {
      message.error('Không thể tải danh sách game');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await loadGames();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [loadGames]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingGame) {
        await gameApi.update(editingGame._id, values);
        message.success('Cập nhật game thành công!');
      } else {
        await gameApi.create(values);
        message.success('Thêm game mới thành công!');
      }
      setIsModalOpen(false);
      await loadGames();
    } catch (error) {
      message.error(error.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await gameApi.delete(id);
      message.success('Đã xóa game thành công');
      await loadGames();
    } catch (error) {
      message.error(error.message || 'Xóa game thất bại');
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} className="font-heading" style={{ margin: 0, color: '#0F172A' }}>
            Quản lý Kho Game
          </Title>
          <Text type="secondary">Thêm mới, chỉnh sửa thông tin và quản lý danh mục game.</Text>
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder="Tìm tên game..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingGame(null);
                setIsModalOpen(true);
              }}
            >
              Thêm Game mới
            </Button>
          </Space>
        </Col>
      </Row>

      <AdminGamesTable
        games={games}
        loading={loading}
        onEdit={(record) => {
          setEditingGame(record);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <GameFormModal
        open={isModalOpen}
        editingGame={editingGame}
        submitting={submitting}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminGamesPage;
