import { useState } from 'react';
import { Row, Col, Form, Input, Rate, Button, Avatar, Tag, Space, Typography, Progress, Empty } from 'antd';
import { UserOutlined, SendOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatDateVi } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

const RATING_LABELS = {
  1: 'Rất tệ',
  2: 'Chưa ổn',
  3: 'Tạm được',
  4: 'Rất hay',
  5: 'Tuyệt phẩm!',
};

const GameReviewsTab = ({ game, reviews = [], user, submitting, onSubmitReview }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState(5);

  const handleFinish = async (values) => {
    const ok = await onSubmitReview(values);
    if (ok) {
      form.resetFields();
      setSelectedRating(5);
    }
  };

  // Tính phân bố sao 5 -> 1 từ danh sách review hiện có
  const totalReviews = reviews.length;
  const starBuckets = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percent };
  });

  return (
    <Row gutter={[24, 24]} align="top" style={{ paddingTop: 6 }}>
      {/* Cột trái: Tổng quan điểm + Form viết đánh giá hiện đại */}
      <Col xs={24} md={10}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Rating Summary Card */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 12,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ textAlign: 'center', minWidth: 74 }}>
                <Title level={2} className="font-mono-num" style={{ margin: 0, color: '#0F172A', lineHeight: 1 }}>
                  {game.averageRating || 0}
                </Title>
                <Rate disabled allowHalf value={game.averageRating} style={{ fontSize: 11, marginTop: 4 }} />
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                  {(game.reviewCount || 0).toLocaleString('vi-VN')} lượt
                </div>
              </div>

              <div style={{ flex: 1 }}>
                {starBuckets.map((bucket) => (
                  <div key={bucket.star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text className="font-mono-num" style={{ fontSize: 11.5, color: '#475569', width: 22 }}>
                      {bucket.star}★
                    </Text>
                    <Progress
                      percent={bucket.percent}
                      showInfo={false}
                      size="small"
                      strokeColor="#F59E0B"
                      railColor="#E2E8F0"
                      style={{ margin: 0, flex: 1 }}
                    />
                    <Text className="font-mono-num" style={{ fontSize: 11, color: '#64748B', width: 22, textAlign: 'right' }}>
                      {bucket.count}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form viết đánh giá */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 12,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Text strong style={{ display: 'block', marginBottom: 10, color: '#0F172A', fontSize: 14 }}>
              Viết đánh giá của bạn
            </Text>

            {!user ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
                  Đăng nhập để chấm điểm và chia sẻ nhận xét về tựa game này.
                </Text>
                <Button type="primary" onClick={() => navigate('/login')}>
                  Đăng nhập để đánh giá
                </Button>
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ rating: 5 }}>
                <Form.Item name="rating" rules={[{ required: true, message: 'Chọn số sao' }]} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Rate
                      value={selectedRating}
                      onChange={(val) => {
                        const nextVal = val || 1;
                        setSelectedRating(nextVal);
                        form.setFieldValue('rating', nextVal);
                      }}
                      style={{ fontSize: 18 }}
                    />
                    <Tag color="gold" style={{ margin: 0, fontWeight: 600 }}>
                      {RATING_LABELS[selectedRating]}
                    </Tag>
                  </div>
                </Form.Item>

                <Form.Item
                  name="comment"
                  rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập nhận xét của bạn' }]}
                  style={{ marginBottom: 18 }}
                >
                  <Input.TextArea
                    rows={3}
                    maxLength={500}
                    showCount
                    placeholder="Chia sẻ trải nghiệm đồ họa, gameplay hoặc hiệu năng..."
                  />
                </Form.Item>

                <Button type="primary" htmlType="submit" block icon={<SendOutlined />} loading={submitting}>
                  Gửi đánh giá
                </Button>
              </Form>
            )}
          </div>
        </Space>
      </Col>

      {/* Cột phải: Danh sách review dạng thẻ sạch đẹp */}
      <Col xs={24} md={14}>
        {reviews.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              borderRadius: 12,
              background: '#F8FAFC',
              border: '1px dashed #CBD5E1',
              textAlign: 'center',
            }}
          >
            <Empty description="Chưa có đánh giá nào. Hãy là người đầu tiên!" />
          </div>
        ) : (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {reviews.map((rev) => (
              <div
                key={rev._id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                  <Space size={10}>
                    <Avatar
                      src={rev.user?.avatar}
                      icon={<UserOutlined />}
                      size={36}
                      style={{ backgroundColor: '#4F46E5', flexShrink: 0 }}
                    />
                    <div>
                      <Space size={6}>
                        <Text strong style={{ color: '#0F172A', fontSize: 14 }}>
                          {rev.user?.username || 'Game thủ'}
                        </Text>
                        <Tag style={{ margin: 0, fontSize: 11, background: '#F1F5F9', border: 'none', color: '#475569' }}>
                          Lv.{rev.user?.level || 1}
                        </Tag>
                      </Space>
                      {rev.createdAt && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 11.5 }}>
                            {formatDateVi(rev.createdAt)}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Space>

                  <Tag
                    icon={<StarFilled style={{ color: '#F59E0B' }} />}
                    style={{
                      margin: 0,
                      background: '#FFFBEB',
                      borderColor: '#FDE68A',
                      color: '#B45309',
                      fontWeight: 600,
                      borderRadius: 999,
                    }}
                  >
                    {rev.rating}.0
                  </Tag>
                </div>

                <Paragraph
                  style={{
                    margin: 0,
                    color: '#334155',
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  }}
                >
                  {rev.comment}
                </Paragraph>
              </div>
            ))}
          </Space>
        )}
      </Col>
    </Row>
  );
};

export default GameReviewsTab;
