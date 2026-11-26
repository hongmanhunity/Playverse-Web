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
  Drawer,
  Form,
  Popconfirm,
  Pagination,
  Empty,
  Skeleton,
  Divider,
  Spin,
  Image,
  Segmented,
  Upload,
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
  SafetyOutlined,
  PictureOutlined,
  BulbOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  UploadOutlined,
  CloseCircleFilled,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import communityApi from '../../api/communityApi';
import gameApi from '../../api/gameApi';
import { useAuth } from '../../hooks/useAuth';
import { formatDateVi } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const POST_TYPES = [
  { value: 'discussion', label: 'Thảo luận', color: 'geekblue', icon: <MessageOutlined /> },
  { value: 'guide', label: 'Mẹo & Hướng dẫn', color: 'green', icon: <BulbOutlined /> },
  { value: 'lfg', label: 'Tìm đồng đội', color: 'purple', icon: <TeamOutlined /> },
  { value: 'showcase', label: 'Khoe thành tích', color: 'gold', icon: <TrophyOutlined /> },
  { value: 'question', label: 'Hỏi đáp / Lỗi', color: 'volcano', icon: <QuestionCircleOutlined /> },
];

const POST_TYPE_MAP = Object.fromEntries(POST_TYPES.map((item) => [item.value, item]));

const PLATFORMS = ['PC', 'Mobile (Android/iOS)', 'Console', 'Cross-play'];

/**
 * Nén ảnh người dùng chọn từ thiết bị qua Canvas để lưu gọn nhẹ dạng Base64 Data URL
 */
const compressImageToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được file ảnh'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Định dạng ảnh không hợp lệ'));
      img.onload = () => {
        const maxWidth = 1200;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

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
  const [selectedType, setSelectedType] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('upload');
  const [previewImage, setPreviewImage] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [form] = Form.useForm();

  // Drawer xem & bình luận bài viết (giữ lưới 2 cột ngoài luôn đều nhau)
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentSending, setCommentSending] = useState(false);

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

  const handleOpenCreateModal = (defaultType = 'discussion') => {
    if (!user) {
      message.info('Vui lòng đăng nhập để tạo bài viết mới');
      navigate('/login');
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      postType: defaultType,
      gameTitle: selectedTopic || 'Chung',
      platform: undefined,
      imageUrl: '',
    });
    setPreviewImage('');
    setPreviewError(false);
    setImageInputMode('upload');
    setIsModalOpen(true);
  };

  const handleUploadImage = async (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh (PNG, JPG, WebP)');
      return Upload.LIST_IGNORE;
    }
    if (file.size > 8 * 1024 * 1024) {
      message.error('Ảnh gốc quá lớn (tối đa 8MB)');
      return Upload.LIST_IGNORE;
    }
    try {
      const compressed = await compressImageToDataUrl(file);
      form.setFieldValue('imageUrl', compressed);
      setPreviewImage(compressed);
      setPreviewError(false);
      message.success('Đã tải ảnh lên khung xem trước');
    } catch (error) {
      message.error(error.message || 'Không thể xử lý ảnh');
    }
    return false;
  };

  const handleClearImage = () => {
    form.setFieldValue('imageUrl', '');
    setPreviewImage('');
    setPreviewError(false);
  };

  const handleCreatePost = async (values) => {
    setSubmitting(true);
    try {
      await communityApi.createPost({
        ...values,
        imageUrl: previewImage || values.imageUrl || '',
      });
      message.success('Đăng bài viết thành công');
      form.resetFields();
      setPreviewImage('');
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
      if (activeCommentPost?._id === postId) {
        setActiveCommentPost(null);
      }
      await loadPosts(page);
    } catch (error) {
      message.error(error.message || 'Không thể xóa bài viết');
    }
  };

  const loadComments = async (postId) => {
    setCommentsLoading(true);
    try {
      const res = await communityApi.getPostComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: res.data || [] }));
    } catch {
      message.error('Không tải được bình luận');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleOpenComments = async (post) => {
    setActiveCommentPost(post);
    setCommentInput('');
    await loadComments(post._id);
  };

  const handleAddComment = async () => {
    if (!activeCommentPost) return;
    if (!user) {
      message.info('Vui lòng đăng nhập để bình luận');
      navigate('/login');
      return;
    }
    const content = commentInput.trim();
    if (!content) {
      message.warning('Vui lòng nhập nội dung bình luận');
      return;
    }

    const postId = activeCommentPost._id;
    setCommentSending(true);
    try {
      await communityApi.addPostComment(postId, { content });
      setCommentInput('');
      setPosts((prev) =>
        prev.map((item) =>
          item._id === postId ? { ...item, commentsCount: (item.commentsCount || 0) + 1 } : item
        )
      );
      setActiveCommentPost((prev) =>
        prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev
      );
      await loadComments(postId);
    } catch (error) {
      message.error(error.message || 'Gửi bình luận thất bại');
    } finally {
      setCommentSending(false);
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
      setActiveCommentPost((prev) =>
        prev ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 0) - 1) } : prev
      );
      message.success('Đã xóa bình luận');
    } catch (error) {
      message.error(error.message || 'Xóa bình luận thất bại');
    }
  };

  const gameTopics = ['Chung', ...games.map((g) => g.title)];

  const filteredPosts = posts.filter((post) => {
    const matchTopic = !selectedTopic || post.gameTitle === selectedTopic;
    const matchType = selectedType === 'all' || (post.postType || 'discussion') === selectedType;
    const kw = searchText.trim().toLowerCase();
    const matchSearch =
      !kw ||
      post.title?.toLowerCase().includes(kw) ||
      post.content?.toLowerCase().includes(kw) ||
      post.gameTitle?.toLowerCase().includes(kw);
    return matchTopic && matchType && matchSearch;
  });

  const activeComments = activeCommentPost ? commentsMap[activeCommentPost._id] || [] : [];

  return (
    <div>
      {/* Khối đầu: Trái (16) gồm Quick Composer + Tìm kiếm/Phân loại | Phải (8) Quy tắc cộng đồng */}
      <Row gutter={[16, 16]} align="stretch" style={{ marginBottom: 22 }}>
        <Col xs={24} lg={16} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
            <Card
              className="pv-modern-card"
              style={{ borderRadius: 14 }}
              styles={{ body: { padding: '18px 20px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  size={42}
                  style={{ backgroundColor: '#4F46E5', flexShrink: 0 }}
                />
                <Button
                  block
                  onClick={() => handleOpenCreateModal('discussion')}
                  style={{
                    height: 42,
                    borderRadius: 999,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    color: '#64748B',
                    background: '#F8FAFC',
                    borderColor: '#E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  {user
                    ? `${user.username}, chia sẻ khoảnh khắc hoặc hỏi đáp ngay...`
                    : 'Đăng nhập để chia sẻ bài viết cùng cộng đồng...'}
                </Button>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <Space wrap size={4}>
                  <Button
                    size="small"
                    type="text"
                    icon={<PictureOutlined style={{ color: '#10B981' }} />}
                    onClick={() => handleOpenCreateModal('showcase')}
                  >
                    Ảnh / Thành tích
                  </Button>
                  <Button
                    size="small"
                    type="text"
                    icon={<BulbOutlined style={{ color: '#F59E0B' }} />}
                    onClick={() => handleOpenCreateModal('guide')}
                  >
                    Mẹo hay
                  </Button>
                  <Button
                    size="small"
                    type="text"
                    icon={<TeamOutlined style={{ color: '#8B5CF6' }} />}
                    onClick={() => handleOpenCreateModal('lfg')}
                  >
                    Tìm đồng đội
                  </Button>
                </Space>

                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenCreateModal('discussion')}>
                  Đăng bài
                </Button>
              </div>
            </Card>

            <Card
              className="pv-modern-card"
              style={{ borderRadius: 14, flex: 1 }}
              styles={{ body: { padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <Space size={8}>
                  <FilterOutlined style={{ color: '#4F46E5' }} />
                  <Text strong style={{ color: '#0F172A', fontSize: 14 }}>
                    Tìm kiếm & Phân loại bài viết
                  </Text>
                </Space>
                <Tag color="geekblue" style={{ margin: 0, fontWeight: 600 }}>
                  {total} bài viết
                </Tag>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Input
                  allowClear
                  prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="Tìm tiêu đề, nội dung hoặc tên game..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ flex: '1 1 240px' }}
                />
                <Select
                  allowClear
                  showSearch
                  placeholder="Lọc theo game"
                  value={selectedTopic || undefined}
                  onChange={(val) => setSelectedTopic(val || '')}
                  options={gameTopics.map((title) => ({ label: title, value: title }))}
                  style={{ width: 200 }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Tag
                  color={selectedType === 'all' ? 'geekblue' : 'default'}
                  style={{ cursor: 'pointer', padding: '3px 10px', borderRadius: 999, margin: 0 }}
                  onClick={() => setSelectedType('all')}
                >
                  Tất cả
                </Tag>
                {POST_TYPES.map((type) => (
                  <Tag
                    key={type.value}
                    icon={type.icon}
                    color={selectedType === type.value ? type.color : 'default'}
                    style={{ cursor: 'pointer', padding: '3px 10px', borderRadius: 999, margin: 0 }}
                    onClick={() => setSelectedType(selectedType === type.value ? 'all' : type.value)}
                  >
                    {type.label}
                  </Tag>
                ))}
              </div>
            </Card>
          </div>
        </Col>

        <Col xs={24} lg={8} style={{ display: 'flex' }}>
          <Card
            className="pv-modern-card"
            style={{
              borderRadius: 14,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 60%, #EEF2FF 100%)',
            }}
            styles={{
              body: {
                padding: '18px 20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              },
            }}
          >
            <div>
              <Space align="center" size={10} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#ECFDF5',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 17,
                  }}
                >
                  <SafetyOutlined />
                </div>
                <div>
                  <Title level={5} className="font-heading" style={{ margin: 0, color: '#0F172A' }}>
                    Quy tắc cộng đồng
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    PlayVerse Community Guidelines
                  </Text>
                </div>
              </Space>

              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Text style={{ color: '#334155', fontSize: 13, lineHeight: 1.55 }}>
                  • <strong>Văn minh:</strong> Tôn trọng người chơi khác, không công kích.
                </Text>
                <Text style={{ color: '#334155', fontSize: 13, lineHeight: 1.55 }}>
                  • <strong>Đúng chủ đề:</strong> Gắn đúng loại bài, tên game & nền tảng.
                </Text>
                <Text style={{ color: '#334155', fontSize: 13, lineHeight: 1.55 }}>
                  • <strong>Hình ảnh rõ nét:</strong> Khuyến khích kèm screenshot game; cảnh báo trước nếu có spoiler cốt truyện.
                </Text>
                <Text style={{ color: '#334155', fontSize: 13, lineHeight: 1.55 }}>
                  • <strong>An toàn:</strong> Không spam quảng cáo hay ảnh phản cảm.
                </Text>
              </Space>
            </div>

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #E2E8F0' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Bài viết vi phạm có thể bị Admin gỡ bỏ để giữ sân chơi lành mạnh.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Hàng dưới: Danh sách bài viết thu gọn phân theo 1 hàng 2 cột */}
      {loading ? (
        <Row gutter={[20, 20]}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Col key={idx} xs={24} md={12}>
              <Card className="pv-modern-card" style={{ borderRadius: 14 }}>
                <Skeleton.Image active style={{ width: '100%', height: 190, marginBottom: 14 }} />
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filteredPosts.length === 0 ? (
        <Card className="pv-modern-card" style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
          <Empty description={<Text style={{ color: '#475569' }}>Chưa tìm thấy bài viết phù hợp</Text>}>
            <Space>
              {(selectedTopic || selectedType !== 'all' || searchText) && (
                <Button
                  onClick={() => {
                    setSelectedTopic('');
                    setSelectedType('all');
                    setSearchText('');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
              <Button type="primary" onClick={() => handleOpenCreateModal('discussion')}>
                Viết bài đầu tiên
              </Button>
            </Space>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[20, 20]} align="stretch">
          {filteredPosts.map((post) => {
            const postAuthorId = post.user?._id || post.user;
            const canDeletePost = user && (postAuthorId === user._id || isAdmin);
            const isLiked = user && (post.likes || []).some((id) => (id?._id || id) === user._id);
            const typeMeta = POST_TYPE_MAP[post.postType] || POST_TYPE_MAP.discussion;

            return (
              <Col key={post._id} xs={24} md={12}>
                <Card
                  className="pv-modern-card"
                  style={{ borderRadius: 14, height: '100%' }}
                  styles={{
                    body: {
                      padding: 18,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    },
                  }}
                >
                  <div>
                    {/* Header tác giả & tags */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <Space size={10} align="start">
                        <Avatar
                          src={post.user?.avatar || post.authorAvatar}
                          icon={<UserOutlined />}
                          size={38}
                          style={{ backgroundColor: '#4F46E5', flexShrink: 0 }}
                        />
                        <div>
                          <Space size={6} wrap>
                            <Text strong style={{ color: '#0F172A', fontSize: 14 }}>
                              {post.user?.username || post.authorName}
                            </Text>
                            <Tag color="gold" style={{ margin: 0, fontSize: 11 }}>
                              Lv.{post.user?.level || 1}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 11.5 }}>
                              • {formatDateVi(post.createdAt)}
                            </Text>
                          </Space>

                          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            <Tag color={typeMeta.color} icon={typeMeta.icon} style={{ margin: 0, fontSize: 11 }}>
                              {typeMeta.label}
                            </Tag>
                            <Tag
                              color="blue"
                              style={{
                                margin: 0,
                                fontSize: 11,
                                cursor: 'pointer',
                                maxWidth: 165,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                              }}
                              onClick={() => setSelectedTopic(post.gameTitle || 'Chung')}
                            >
                              {post.gameTitle || 'Chung'}
                            </Tag>
                            {post.platform && (
                              <Tag style={{ margin: 0, fontSize: 11, color: '#475569' }}>{post.platform}</Tag>
                            )}
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

                    {/* Nội dung bài viết */}
                    <div style={{ marginTop: 12, minWidth: 0 }}>
                      <Title
                        level={5}
                        ellipsis={{ rows: 2 }}
                        onClick={() => handleOpenComments(post)}
                        style={{
                          margin: '0 0 6px 0',
                          color: '#0F172A',
                          fontSize: 15.5,
                          lineHeight: 1.35,
                          cursor: 'pointer',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                        }}
                      >
                        {post.title}
                      </Title>
                      <Paragraph
                        ellipsis={{ rows: 3 }}
                        style={{
                          color: '#475569',
                          marginBottom: post.imageUrl ? 12 : 0,
                          whiteSpace: 'pre-line',
                          fontSize: 13.5,
                          lineHeight: 1.55,
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                        }}
                      >
                        {post.content}
                      </Paragraph>

                      {/* Ảnh thu nhỏ cố định chiều cao để 2 cột đều tăm tắp, bấm vào phóng to */}
                      {post.imageUrl && (
                        <div
                          style={{
                            borderRadius: 10,
                            overflow: 'hidden',
                            border: '1px solid #E2E8F0',
                            background: '#0F172A',
                            height: 210,
                          }}
                        >
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            width="100%"
                            height={210}
                            style={{ objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thanh tương tác ở đáy Card */}
                  <div>
                    <Divider style={{ margin: '12px 0 8px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space size={12}>
                        <Button
                          type="text"
                          size="small"
                          icon={isLiked ? <HeartFilled style={{ color: '#EF4444' }} /> : <HeartOutlined />}
                          onClick={() => handleToggleLike(post._id)}
                          style={{ color: isLiked ? '#EF4444' : '#475569', fontWeight: 500 }}
                        >
                          {post.likesCount || 0} Thích
                        </Button>
                        <Button
                          type="text"
                          size="small"
                          icon={<CommentOutlined />}
                          onClick={() => handleOpenComments(post)}
                          style={{ color: '#475569', fontWeight: 500 }}
                        >
                          {post.commentsCount || 0} Bình luận
                        </Button>
                      </Space>

                      <Button type="link" size="small" style={{ padding: 0 }} onClick={() => handleOpenComments(post)}>
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {total > 10 && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
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

      {/* Drawer xem chi tiết & bình luận (không làm lệch chiều cao lưới 2 cột) */}
      <Drawer
        title={activeCommentPost?.title || 'Thảo luận bài viết'}
        open={Boolean(activeCommentPost)}
        onClose={() => setActiveCommentPost(null)}
        width={480}
      >
        {activeCommentPost && (
          <div>
            <Space size={10} style={{ marginBottom: 12 }}>
              <Avatar
                src={activeCommentPost.user?.avatar || activeCommentPost.authorAvatar}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#4F46E5' }}
              />
              <div>
                <Text strong style={{ display: 'block', color: '#0F172A' }}>
                  {activeCommentPost.user?.username || activeCommentPost.authorName}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {activeCommentPost.gameTitle || 'Chung'} • {formatDateVi(activeCommentPost.createdAt)}
                </Text>
              </div>
            </Space>

            <Paragraph
              style={{
                color: '#334155',
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {activeCommentPost.content}
            </Paragraph>

            {activeCommentPost.imageUrl && (
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: 14 }}>
                <Image src={activeCommentPost.imageUrl} alt={activeCommentPost.title} width="100%" style={{ maxHeight: 240, objectFit: 'cover' }} />
              </div>
            )}

            <Divider style={{ margin: '14px 0' }} />

            <Text strong style={{ display: 'block', marginBottom: 10, color: '#0F172A' }}>
              Bình luận ({activeCommentPost.commentsCount || 0})
            </Text>

            <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
              <Input
                placeholder={user ? 'Viết bình luận của bạn (tối đa 500 ký tự)...' : 'Đăng nhập để bình luận...'}
                value={commentInput}
                maxLength={500}
                onChange={(e) => setCommentInput(e.target.value)}
                onPressEnter={handleAddComment}
              />
              <Button type="primary" icon={<SendOutlined />} loading={commentSending} onClick={handleAddComment}>
                Gửi
              </Button>
            </Space.Compact>

            {commentsLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Spin size="small" />
              </div>
            ) : activeComments.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có bình luận nào" />
            ) : (
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                {activeComments.map((cmt) => {
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
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <Space align="start" size={10} style={{ minWidth: 0, flex: 1 }}>
                        <Avatar
                          src={cmt.user?.avatar || cmt.authorAvatar}
                          icon={<UserOutlined />}
                          size={28}
                          style={{ backgroundColor: '#4F46E5', flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Space size={6}>
                            <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
                              {cmt.user?.username || cmt.authorName}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {formatDateVi(cmt.createdAt)}
                            </Text>
                          </Space>
                          <div
                            style={{
                              color: '#334155',
                              fontSize: 13.5,
                              marginTop: 2,
                              overflowWrap: 'anywhere',
                              wordBreak: 'break-word',
                            }}
                          >
                            {cmt.content}
                          </div>
                        </div>
                      </Space>

                      {canDeleteCmt && (
                        <Popconfirm
                          title="Xóa bình luận này?"
                          onConfirm={() => handleDeleteComment(activeCommentPost._id, cmt._id)}
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
      </Drawer>

      {/* Modal đăng bài mới */}
      <Modal
        title="Đăng bài cộng đồng"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePost} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="postType"
                label="Loại bài viết"
                rules={[{ required: true, message: 'Chọn loại bài' }]}
              >
                <Select
                  options={POST_TYPES.map((item) => ({
                    value: item.value,
                    label: (
                      <Space size={6}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Space>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="gameTitle"
                label="Tựa game"
                rules={[{ required: true, message: 'Chọn tựa game' }]}
              >
                <Select
                  showSearch
                  options={gameTopics.map((title) => ({ label: title, value: title }))}
                  placeholder="Chọn game"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="platform" label="Nền tảng (tùy chọn)">
                <Select
                  allowClear
                  placeholder="PC / Mobile..."
                  options={PLATFORMS.map((p) => ({ label: p, value: p }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Tiêu đề bài viết"
            rules={[
              { required: true, whitespace: true, message: 'Vui lòng nhập tiêu đề' },
              { max: 100, message: 'Tiêu đề bài viết tối đa 100 ký tự' },
            ]}
          >
            <Input
              placeholder="VD: Mẹo vượt ải 5 cực nhanh hoặc tìm team leo rank tối nay..."
              maxLength={100}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung chi tiết"
            rules={[
              { required: true, whitespace: true, message: 'Vui lòng nhập nội dung' },
              { max: 1000, message: 'Nội dung bài viết tối đa 1000 ký tự' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Chia sẻ kinh nghiệm, ID phòng / khung giờ chơi cùng hoặc câu hỏi của bạn..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          {/* Khu vực Hình ảnh + Live Preview */}
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: '#F8FAFC',
              border: '1px dashed #CBD5E1',
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Space size={6}>
                <PictureOutlined style={{ color: '#4F46E5' }} />
                <Text strong style={{ fontSize: 13.5, color: '#0F172A' }}>
                  Hình ảnh đính kèm & Xem trước
                </Text>
              </Space>

              <Segmented
                size="small"
                value={imageInputMode}
                onChange={(val) => setImageInputMode(val)}
                options={[
                  { label: 'Tải ảnh từ máy', value: 'upload' },
                  { label: 'Dán link ảnh (URL)', value: 'url' },
                ]}
              />
            </div>

            {imageInputMode === 'upload' ? (
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleUploadImage}
              >
                <Button icon={<UploadOutlined />}>
                  {previewImage ? 'Đổi ảnh khác từ máy' : 'Chọn ảnh screenshot từ máy (tự nén nhẹ)'}
                </Button>
              </Upload>
            ) : (
              <Form.Item name="imageUrl" style={{ marginBottom: 0 }}>
                <Input
                  allowClear
                  placeholder="Dán đường dẫn ảnh https://..."
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    setPreviewImage(url);
                    setPreviewError(false);
                  }}
                />
              </Form.Item>
            )}

            {previewImage && (
              <div style={{ position: 'relative', marginTop: 12 }}>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleFilled style={{ fontSize: 20, color: '#EF4444' }} />}
                  onClick={handleClearImage}
                  aria-label="Gỡ ảnh"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
                {previewError ? (
                  <div style={{ padding: 20, textAlign: 'center', background: '#FEF2F2', borderRadius: 10, color: '#EF4444', fontSize: 13 }}>
                    Không tải được ảnh xem trước từ đường dẫn này. Vui lòng kiểm tra lại URL.
                  </div>
                ) : (
                  <img
                    src={previewImage}
                    alt="Xem trước ảnh bài viết"
                    onError={() => setPreviewError(true)}
                    style={{
                      width: '100%',
                      maxHeight: 260,
                      objectFit: 'cover',
                      borderRadius: 10,
                      display: 'block',
                      border: '1px solid #E2E8F0',
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={previewError}>
              Đăng bài
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CommunityPage;
