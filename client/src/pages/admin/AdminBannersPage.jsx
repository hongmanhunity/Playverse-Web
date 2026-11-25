import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Popconfirm, Image, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import bannerApi from '../../api/bannerApi';
import gameApi from '../../api/gameApi';
import BannerFormModal from '../../components/admin/BannerFormModal';

const { Title, Text } = Typography;

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [bannerRes, gameRes] = await Promise.all([bannerApi.getAll(), gameApi.getAll({ limit: 100 })]);
      setBanners(bannerRes.data || []);
      setGames(gameRes.data || []);
    } catch {
      message.error('Không tải được dữ liệu banner');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await loadData();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingBanner) {
        await bannerApi.update(editingBanner._id, values);
        message.success('Cập nhật banner thành công');
      } else {
        await bannerApi.create(values);
        message.success('Tạo banner mới thành công');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      message.error(error.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await bannerApi.delete(id);
      message.success('Đã xóa banner');
      await loadData();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 140,
      render: (url) => (
        <Image src={url} width={110} height={60} style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #E2E8F0' }} />
      ),
    },
    {
      title: 'Tiêu đề Banner',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <strong style={{ color: '#0F172A' }}>{text}</strong>,
    },
    {
      title: 'Game liên kết',
      dataIndex: 'gameId',
      key: 'gameId',
      render: (game) => (game ? game.title : <Text type="secondary">Không liên kết</Text>),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingBanner(record);
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm title="Xóa banner này?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy">
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} className="font-heading" style={{ margin: 0, color: '#0F172A' }}>
            Quản lý Banner Trang chủ
          </Title>
          <Text type="secondary">Cập nhật ảnh nổi bật và liên kết chuyển hướng đến Game.</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBanner(null);
              setIsModalOpen(true);
            }}
          >
            Thêm Banner mới
          </Button>
        </Col>
      </Row>

      <Table columns={columns} dataSource={banners} rowKey="_id" loading={loading} pagination={false} />

      <BannerFormModal
        open={isModalOpen}
        editingBanner={editingBanner}
        games={games}
        submitting={submitting}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminBannersPage;
