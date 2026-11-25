import { useState, useEffect, useCallback } from 'react';
import { Tabs, Table, Button, Tag, Space, Avatar, Rate, Popconfirm, Typography, message } from 'antd';
import { DeleteOutlined, UserOutlined, FileTextOutlined, StarOutlined } from '@ant-design/icons';
import communityApi from '../../api/communityApi';
import { formatDateVi } from '../../utils/formatters';

const { Title, Text } = Typography;

const AdminCommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [postRes, reviewRes] = await Promise.all([
        communityApi.getPosts({ limit: 50 }),
        communityApi.getAllReviews({ limit: 50 }),
      ]);
      setPosts(postRes.data || []);
      setReviews(reviewRes.data || []);
    } catch {
      message.error('Không tải được dữ liệu cộng đồng');
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

  const handleDeletePost = async (id) => {
    try {
      await communityApi.deletePost(id);
      message.success('Đã xóa bài viết');
      await loadData();
    } catch {
      message.error('Xóa bài viết thất bại');
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await communityApi.deleteReview(id);
      message.success('Đã xóa đánh giá và cập nhật lại điểm game');
      await loadData();
    } catch {
      message.error('Xóa đánh giá thất bại');
    }
  };

  const postColumns = [
    {
      title: 'Tác giả',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 180,
      render: (name, record) => (
        <Space>
          <Avatar src={record.user?.avatar || record.authorAvatar} icon={<UserOutlined />} size="small" />
          <Text strong>{record.user?.username || name}</Text>
        </Space>
      ),
    },
    {
      title: 'Chủ đề Game',
      dataIndex: 'gameTitle',
      key: 'gameTitle',
      width: 150,
      render: (gt) => <Tag color="geekblue">{gt || 'Chung'}</Tag>,
    },
    {
      title: 'Bài viết',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <Text strong style={{ color: '#0F172A', display: 'block' }}>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.content}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tương tác',
      key: 'stats',
      width: 150,
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {record.likesCount || 0} thích • {record.commentsCount || 0} bình luận
        </Text>
      ),
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d) => <Text type="secondary">{formatDateVi(d)}</Text>,
    },
    {
      title: '',
      key: 'actions',
      width: 70,
      align: 'right',
      render: (_, record) => (
        <Popconfirm title="Xóa bài viết này?" onConfirm={() => handleDeletePost(record._id)} okText="Xóa" cancelText="Hủy">
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const reviewColumns = [
    {
      title: 'Người đánh giá',
      dataIndex: 'user',
      key: 'user',
      width: 180,
      render: (u) => (
        <Space>
          <Avatar src={u?.avatar} icon={<UserOutlined />} size="small" />
          <Text strong>{u?.username || 'Game thủ'}</Text>
        </Space>
      ),
    },
    {
      title: 'Tựa game',
      dataIndex: 'game',
      key: 'game',
      width: 200,
      render: (g) => <Tag color="purple">{g?.title || 'Game đã xóa'}</Tag>,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating) => <Rate disabled value={rating} style={{ fontSize: 13 }} />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d) => <Text type="secondary">{formatDateVi(d)}</Text>,
    },
    {
      title: '',
      key: 'actions',
      width: 70,
      align: 'right',
      render: (_, record) => (
        <Popconfirm title="Xóa đánh giá này?" onConfirm={() => handleDeleteReview(record._id)} okText="Xóa" cancelText="Hủy">
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'posts',
      label: (
        <span>
          <FileTextOutlined style={{ marginRight: 6 }} />
          Bài viết Cộng đồng ({posts.length})
        </span>
      ),
      children: <Table columns={postColumns} dataSource={posts} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 760 }} />,
    },
    {
      key: 'reviews',
      label: (
        <span>
          <StarOutlined style={{ marginRight: 6 }} />
          Đánh giá Game ({reviews.length})
        </span>
      ),
      children: <Table columns={reviewColumns} dataSource={reviews} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 760 }} />,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} className="font-heading" style={{ margin: 0, color: '#0F172A' }}>
          Quản lý Cộng đồng & Đánh giá
        </Title>
        <Text type="secondary">Kiểm duyệt bài viết diễn đàn và các đánh giá game từ người dùng.</Text>
      </div>

      <Tabs defaultActiveKey="posts" items={tabItems} />
    </div>
  );
};

export default AdminCommunityPage;
