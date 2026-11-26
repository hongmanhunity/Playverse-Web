import { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Avatar,
  Tag,
  Typography,
  Space,
  Input,
  Select,
  Modal,
  Form,
  Popconfirm,
  Pagination,
  Empty,
  Skeleton,
  Divider,
  Spin,
  message,
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  DeleteOutlined,
  SendOutlined,
  UserOutlined,
  SearchOutlined,
  FireOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import communityApi from '../../api/communityApi';
import gameApi from '../../api/gameApi';
import { useAuth } from '../../hooks/useAuth';
import { formatDateVi } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CommunityPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Trạng thái mở bình luận theo từng bài viết
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [commentsLoadingMap, setCommentsLoadingMap] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentSendingMap, setCommentSendingMap] = useState({});

  const loadPosts = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await communityApi.getPosts({ page: targetPage, limit: 10 });
      setPosts(res.data || []);
      setTotal(res.total || 0);
    } catch {
      message.error('Không tải được danh sách bài viết');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const res = await communityApi.getPosts({ page, limit: 10 });
        if (active) {
          setPosts(res.data || []);
          setTotal(res.total || 0);
        }
      } catch {
        if (active) {
          message.error('Không tải được danh sách bài viết');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [page]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await gameApi.getAll({ limit: 50 });
        setGames(res.data || []);
      } catch {
        // Không bắt buộc nếu lỗi tải danh sách game gợi ý
      }
    };
    fetchGames();
  }, []);

  const handleOpenCreateModal = () => {
    if (!user) {
      message.info('Vui lòng đăng nhập để tạo bài viết mới');
      navigate('/login');
      return;
    }
    form.setFieldsValue({ gameTitle: selectedTopic || 'Chung' });
    setIsModalOpen(true);
  };

  const handleCreatePost = async (values) => {
    setSubmitting(true);
    try {
      await communityApi.createPost(values);
      message.success('Đăng bài viết thành công');
      form.resetFields();
      setIsModalOpen(false);
      if (page !== 1) {
        setLoading(true);
        setPage(1);
      } else {
        await loadPosts(1);
      }
    } catch (error) {
      message.error(error.message || 'Đăng bài thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!user) {
      message.info('Vui lòng đăng nhập để thích bài viết');
      navigate('/login');
      return;
    }
    try {
      const res = await communityApi.toggleLikePost(postId);
      setPosts((prev) =>
        prev.map((item) => {
          if (item._id !== postId) return item;
          const currentLikes = item.likes || [];
          const updatedLikes = res.isLiked
            ? [...currentLikes.filter((id) => id !== user._id), user._id]
            : currentLikes.filter((id) => id !== user._id);
          return {
            ...item,
            likesCount: res.likesCount,
            likes: updatedLikes,
          };
        })
      );
    } catch (error) {
      message.error(error.message || 'Thao tác thất bại');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await communityApi.deletePost(postId);
      message.success('Đã xóa bài viết');
      await loadPosts(page);
    } catch (error) {
      message.error(error.message || 'Không thể xóa bài viết');
    }
  };

  const loadComments = async (postId) => {
    setCommentsLoadingMap((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await communityApi.getPostComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: res.data || [] }));
    } catch {
      message.error('Không tải được bình luận');
    } finally {
      setCommentsLoadingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleToggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);
    if (!commentsMap[postId]) {
      await loadComments(postId);
    }
  };

  const handleAddComment = async (postId) => {
    if (!user) {
      message.info('Vui lòng đăng nhập để bình luận');
      navigate('/login');
      return;
    }
    const content = (commentInputs[postId] || '').trim();
    if (!content) {
      message.warning('Vui lòng nhập nội dung bình luận');
      return;
    }

    setCommentSendingMap((prev) => ({ ...prev, [postId]: true }));
    try {
      await communityApi.addPostComment(postId, { content });
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((item) =>
          item._id === postId ? { ...item, commentsCount: (item.commentsCount || 0) + 1 } : item
        )
      );
      await loadComments(postId);
    } catch (error) {
      message.error(error.message || 'Gửi bình luận thất bại');
    } finally {
      setCommentSendingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await communityApi.deletePostComment(commentId);
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c._id !== commentId),
      }));
      setPosts((prev) =>
        prev.map((item) =>
          item._id === postId ? { ...item, commentsCount: Math.max(0, (item.commentsCount || 0) - 1) } : item
        )
      );
      message.success('Đã xóa bình luận');
    } catch (error) {
      message.error(error.message || 'Xóa bình luận thất bại');
    }
  };

  const gameTopics = ['Chung', ...games.map((g) => g.title)];
  const activeTopics = Array.from(
    new Set(['Chung', ...posts.map((p) => p.gameTitle).filter(Boolean), ...games.slice(0, 8).map((g) => g.title)])
  );

  const filteredPosts = posts.filter((post) => {
    const matchTopic = !selectedTopic || post.gameTitle === selectedTopic;
    const kw = searchText.trim().toLowerCase();
    const matchSearch =
      !kw ||
      post.title?.toLowerCase().includes(kw) ||
      post.content?.toLowerCase().includes(kw) ||
      post.gameTitle?.toLowerCase().includes(kw);
    return matchTopic && matchSearch;
  });

  return (
    <div>
      <Row gutter={[24, 24]} align="top">
        {/* Cột trái: Thanh tạo bài + Tìm kiếm + Danh sách bài viết */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* Quick Composer & Search */}
            <Card className="pv-modern-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px 20px' } }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Avatar
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  size={40}
                  style={{ backgroundColor: '#4F46E5', flexShrink: 0 }}
                />
                <Button
                  block
                  onClick={handleOpenCreateModal}
                  style={{
                    height: 40,
                    borderRadius: 999,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    color: '#64748B',
                    background: '#F8FAFC',
                    borderColor: '#E2E8F0',
                  }}
                >
                  {user
                    ? `${user.username}, bạn muốn chia sẻ mẹo chơi hay tìm đồng đội?`
                    : 'Đăng nhập để chia sẻ bài viết cùng cộng đồng PlayVerse...'}
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal} style={{ height: 40 }}>
                  Đăng bài
                </Button>
              </div>

              <Input
                allowClear
                prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung hoặc tên game..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Card>

            {/* Feed bài viết */}
            {loading ? (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Card key={idx} className="pv-modern-card" style={{ borderRadius: 14 }}>
                    <Skeleton active avatar paragraph={{ rows: 3 }} />
                  </Card>
                ))}
              </Space>
            ) : filteredPosts.length === 0 ? (
              <Card className="pv-modern-card" style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
                <Empty description={<Text style={{ color: '#475569' }}>Chưa tìm thấy bài viết phù hợp</Text>}>
                  <Space>
                    {selectedTopic && <Button onClick={() => setSelectedTopic('')}>Xem tất cả chủ đề</Button>}
                    <Button type="primary" onClick={handleOpenCreateModal}>
                      Viết bài đầu tiên
                    </Button>
                  </Space>
                </Empty>
              </Card>
            ) : (
              filteredPosts.map((post) => {
                const postAuthorId = post.user?._id || post.user;
                const canDeletePost = user && (postAuthorId === user._id || isAdmin);
                const isLiked = user && (post.likes || []).some((id) => (id?._id || id) === user._id);
                const isExpanded = expandedPostId === post._id;
                const comments = commentsMap[post._id] || [];

                return (
                  <Card key={post._id} className="pv-modern-card" style={{ borderRadius: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <Space size={12}>
                        <Avatar
                          src={post.user?.avatar || post.authorAvatar}
                          icon={<UserOutlined />}
                          size={42}
                          style={{ backgroundColor: '#4F46E5' }}
                        />
                        <div>
                          <Space size={8} wrap>
                            <Text strong style={{ color: '#0F172A', fontSize: 15 }}>
                              {post.user?.username || post.authorName}
                            </Text>
                            <Tag color="gold" style={{ margin: 0, fontSize: 11 }}>
                              Lv.{post.user?.level || 1}
                            </Tag>
                            <Tag
                              color="geekblue"
                              style={{ margin: 0, fontSize: 11, cursor: 'pointer' }}
                              onClick={() => setSelectedTopic(post.gameTitle || 'Chung')}
                            >
                              {post.gameTitle || 'Chung'}
                            </Tag>
                          </Space>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {formatDateVi(post.createdAt)}
                            </Text>
                          </div>
                        </div>
                      </Space>

                      {canDeletePost && (
                        <Popconfirm
                          title="Xóa bài viết này?"
                          onConfirm={() => handleDeletePost(post._id)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                        </Popconfirm>
                      )}
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <Title level={5} style={{ margin: '0 0 6px 0', color: '#0F172A' }}>
                        {post.title}
                      </Title>
                      <Paragraph style={{ color: '#334155', marginBottom: 0, whiteSpace: 'pre-line', lineHeight: 1.65 }}>
                        {post.content}
                      </Paragraph>
                    </div>

                    <Divider style={{ margin: '14px 0 10px' }} />

                    <Space size={16}>
                      <Button
                        type="text"
                        icon={isLiked ? <HeartFilled style={{ color: '#EF4444' }} /> : <HeartOutlined />}
                        onClick={() => handleToggleLike(post._id)}
                        style={{ color: isLiked ? '#EF4444' : '#475569', fontWeight: 500 }}
                      >
                        {post.likesCount || 0} Thích
                      </Button>
                      <Button
                        type="text"
                        icon={<CommentOutlined />}
                        onClick={() => handleToggleComments(post._id)}
                        style={{ color: isExpanded ? '#4F46E5' : '#475569', fontWeight: 500 }}
                      >
                        {post.commentsCount || 0} Bình luận
                      </Button>
                    </Space>

                    {isExpanded && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: 16,
                          borderRadius: 12,
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Space.Compact style={{ width: '100%', marginBottom: 14 }}>
                          <Input
                            placeholder={user ? 'Viết bình luận của bạn...' : 'Đăng nhập để bình luận...'}
                            value={commentInputs[post._id] || ''}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
                            onPressEnter={() => handleAddComment(post._id)}
                          />
                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            loading={commentSendingMap[post._id]}
                            onClick={() => handleAddComment(post._id)}
                          >
                            Gửi
                          </Button>
                        </Space.Compact>

                        {commentsLoadingMap[post._id] ? (
                          <div style={{ textAlign: 'center', padding: 16 }}>
                            <Spin size="small" />
                          </div>
                        ) : comments.length === 0 ? (
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Chưa có bình luận nào. Hãy mở đầu cuộc trò chuyện!
                          </Text>
                        ) : (
                          <Space direction="vertical" size={10} style={{ width: '100%' }}>
                            {comments.map((cmt) => {
                              const cmtAuthorId = cmt.user?._id || cmt.user;
                              const canDeleteCmt = user && (cmtAuthorId === user._id || isAdmin);
                              return (
                                <div
                                  key={cmt._id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: 10,
                                    padding: '10px 12px',
                                    borderRadius: 10,
                                    background: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                  }}
                                >
                                  <Space align="start" size={10}>
                                    <Avatar
                                      src={cmt.user?.avatar || cmt.authorAvatar}
                                      icon={<UserOutlined />}
                                      size={28}
                                      style={{ backgroundColor: '#4F46E5' }}
                                    />
                                    <div>
                                      <Space size={6}>
                                        <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
                                          {cmt.user?.username || cmt.authorName}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                          {formatDateVi(cmt.createdAt)}
                                        </Text>
                                      </Space>
                                      <div style={{ color: '#334155', fontSize: 13.5, marginTop: 2 }}>{cmt.content}</div>
                                    </div>
                                  </Space>

                                  {canDeleteCmt && (
                                    <Popconfirm
                                      title="Xóa bình luận này?"
                                      onConfirm={() => handleDeleteComment(post._id, cmt._id)}
                                      okText="Xóa"
                                      cancelText="Hủy"
                                    >
                                      <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                  )}
                                </div>
                              );
                            })}
                          </Space>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })
            )}

            {total > 10 && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Pagination
                  current={page}
                  total={total}
                  pageSize={10}
                  onChange={(p) => {
                    setLoading(true);
                    setPage(p);
                  }}
                  showSizeChanger={false}
                />
              </div>
            )}
          </Space>
        </Col>

        {/* Cột phải: Sticky Sidebar (Thông tin cộng đồng + Chủ đề + Nội quy) */}
        <Col xs={24} lg={8}>
          <div style={{ position: 'sticky', top: 92 }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Card
                className="pv-modern-card"
                style={{
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 55%, #EEF2FF 100%)',
                }}
              >
                <Space align="center" size={10} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: '#EEF2FF',
                      color: '#4F46E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    <TeamOutlined />
                  </div>
                  <div>
                    <Title level={5} className="font-heading" style={{ margin: 0, color: '#0F172A' }}>
                      Cộng đồng PlayVerse
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {total} bài viết thảo luận
                    </Text>
                  </div>
                </Space>

                <Paragraph style={{ color: '#475569', fontSize: 13.5, marginBottom: 16, lineHeight: 1.6 }}>
                  Nơi người chơi trao đổi kinh nghiệm, hỏi đáp vượt ải, đánh giá game và kết nối đồng đội mới.
                </Paragraph>

                <Button type="primary" block icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
                  Tạo bài viết mới
                </Button>
              </Card>

              <Card className="pv-modern-card" style={{ borderRadius: 14 }}>
                <Title
                  level={5}
                  className="font-heading"
                  style={{ margin: '0 0 12px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <FireOutlined style={{ color: '#F59E0B' }} />
                  Lọc theo chủ đề
                </Title>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Tag
                    color={!selectedTopic ? 'geekblue' : 'default'}
                    style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 999, margin: 0 }}
                    onClick={() => setSelectedTopic('')}
                  >
                    Tất cả
                  </Tag>
                  {activeTopics.map((topic) => (
                    <Tag
                      key={topic}
                      color={selectedTopic === topic ? 'geekblue' : 'default'}
                      style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 999, margin: 0 }}
                      onClick={() => setSelectedTopic(selectedTopic === topic ? '' : topic)}
                    >
                      {topic}
                    </Tag>
                  ))}
                </div>
              </Card>

              <Card className="pv-modern-card" style={{ borderRadius: 14 }}>
                <Title
                  level={5}
                  className="font-heading"
                  style={{ margin: '0 0 10px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <SafetyOutlined style={{ color: '#10B981' }} />
                  Quy tắc cộng đồng
                </Title>
                <Space direction="vertical" size={6} style={{ fontSize: 13, color: '#475569' }}>
                  <Text style={{ color: '#475569', fontSize: 13 }}>• Thảo luận văn minh, tôn trọng người chơi khác.</Text>
                  <Text style={{ color: '#475569', fontSize: 13 }}>• Chọn đúng tên tựa game để mọi người dễ tìm kiếm.</Text>
                  <Text style={{ color: '#475569', fontSize: 13 }}>• Không spam quảng cáo hoặc link độc hại.</Text>
                </Space>
              </Card>
            </Space>
          </div>
        </Col>
      </Row>

      <Modal
        title="Đăng bài thảo luận mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePost} style={{ marginTop: 12 }}>
          <Form.Item
            name="gameTitle"
            label="Chủ đề / Tựa game"
            rules={[{ required: true, message: 'Vui lòng chọn chủ đề' }]}
          >
            <Select
              showSearch
              options={gameTopics.map((title) => ({ label: title, value: title }))}
              placeholder="Chọn tựa game hoặc Chung"
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề bài viết"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="VD: Chia sẻ mẹo vượt ải nhanh hoặc tìm bạn chơi chung..." maxLength={120} />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea rows={4} placeholder="Viết suy nghĩ, kinh nghiệm hoặc câu hỏi của bạn..." maxLength={2000} showCount />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Đăng bài
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CommunityPage;
