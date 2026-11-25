import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag, Popconfirm, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import notificationApi from '../../api/notificationApi';
import NotificationFormModal from '../../components/admin/NotificationFormModal';

const { Title, Text } = Typography;

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data || []);
    } catch {
      message.error('Không tải được thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await loadNotifications();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [loadNotifications]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await notificationApi.create(values);
      message.success('Tạo thông báo thành công');
      setIsModalOpen(false);
      await loadNotifications();
    } catch (error) {
      message.error(error.message || 'Tạo thông báo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      message.success('Đã xóa thông báo');
      await loadNotifications();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const columns = [
    {
      title: 'Nhãn',
      dataIndex: 'badge',
      key: 'badge',
      width: 100,
      render: (badge) => <Tag color="error">{badge}</Tag>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => <Tag color="geekblue">{type}</Tag>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'titleText',
      key: 'titleText',
      render: (text) => <strong style={{ color: '#0F172A' }}>{text}</strong>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 90,
      align: 'right',
      render: (_, record) => (
        <Popconfirm title="Xóa thông báo này?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy">
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} className="font-heading" style={{ margin: 0, color: '#0F172A' }}>
            Quản lý Thông báo Hệ thống
          </Title>
          <Text type="secondary">Gửi và quản lý thông báo sự kiện, khuyến mãi cho người dùng.</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Tạo Thông báo mới
          </Button>
        </Col>
      </Row>

      <Table columns={columns} dataSource={notifications} rowKey="_id" loading={loading} pagination={false} />

      <NotificationFormModal
        open={isModalOpen}
        submitting={submitting}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminNotificationsPage;
