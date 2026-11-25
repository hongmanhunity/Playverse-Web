import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Popconfirm,
  Tag,
  Avatar,
  Typography,
  message,
  Row,
  Col,
} from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import userApi from '../../api/userApi';
import UserFormModal from '../../components/admin/UserFormModal';
import { useAuth } from '../../hooks/useAuth';
import { formatDateVi } from '../../utils/formatters';

const { Title, Text } = Typography;

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const res = await userApi.getAll(params);
      setUsers(res.data || []);
      setTotal(res.total || 0);
    } catch {
      message.error('Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await loadUsers();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [loadUsers]);

  const handleSubmit = async (values) => {
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await userApi.update(editingUser._id, values);
      message.success('Cập nhật người dùng thành công!');
      setIsModalOpen(false);
      await loadUsers();
    } catch (error) {
      message.error(error.message || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await userApi.delete(id);
      message.success('Đã xóa người dùng thành công');
      await loadUsers();
    } catch (error) {
      message.error(error.message || 'Xóa thất bại');
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space size={12}>
          <Avatar src={record.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#4F46E5' }} />
          <div>
            <Space size={6}>
              <Text strong style={{ color: '#0F172A' }}>
                {text}
              </Text>
              {currentUser?._id === record._id && (
                <Tag color="cyan" style={{ fontSize: 11, margin: 0 }}>
                  Bạn
                </Tag>
              )}
            </Space>
            <div style={{ fontSize: 12, color: '#64748B' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (role) => (
        <Tag color={role === 'admin' ? 'volcano' : 'geekblue'} style={{ fontWeight: 600 }}>
          {role === 'admin' ? 'Admin' : 'User'}
        </Tag>
      ),
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      width: 110,
      render: (lv) => <Tag className="font-mono-num">Lv.{lv || 1}</Tag>,
    },
    {
      title: 'Điểm tích lũy',
      dataIndex: 'points',
      key: 'points',
      width: 140,
      render: (pts) => (
        <Text className="font-mono-num" strong style={{ color: '#4F46E5' }}>
          {(pts || 0).toLocaleString('vi-VN')}
        </Text>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {formatDateVi(date)}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa tài khoản?"
            description="Toàn bộ bài viết, đánh giá và wishlist của tài khoản này sẽ bị xóa."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            disabled={currentUser?._id === record._id}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={currentUser?._id === record._id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} className="font-heading" style={{ margin: 0, color: '#0F172A' }}>
            Quản lý Người dùng ({total})
          </Title>
          <Text type="secondary">Phân quyền Admin/User, điều chỉnh cấp độ, điểm và quản lý tài khoản.</Text>
        </Col>
        <Col>
          <Space wrap>
            <Select
              placeholder="Lọc vai trò"
              allowClear
              style={{ width: 150 }}
              onChange={(val) => {
                setRoleFilter(val || '');
                setPage(1);
              }}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
              ]}
            />
            <Input.Search
              placeholder="Tìm tên hoặc email..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
            />
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
        scroll={{ x: 760 }}
      />

      <UserFormModal
        open={isModalOpen}
        editingUser={editingUser}
        submitting={submitting}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminUsersPage;
