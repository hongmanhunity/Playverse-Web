import { Form, Input, Rate, Button, Avatar, Tag, Space, Typography, Empty } from 'antd';
import { UserOutlined, SendOutlined, StarFilled } from '@ant-design/icons';
import { formatDateVi } from '../../utils/formatters';

const { Text, Paragraph } = Typography;

const GameReviewsTab = ({ game, reviews = [], user, submitting, onSubmitReview }) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    const ok = await onSubmitReview(values);
    if (ok) {
      form.resetFields();
    }
  };

  return (
    <div style={{ paddingTop: 4 }}>
      {/* Tóm tắt điểm đánh giá gọn gàng bên trái */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <Space
          size={6}
          style={{
            padding: '5px 12px',
            borderRadius: 8,
            background: '#FEF3C7',
            color: '#B45309',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          <StarFilled style={{ color: '#F59E0B' }} />
          <span>{game.averageRating || 0} / 5</span>
        </Space>
        <Rate disabled allowHalf value={game.averageRating} style={{ fontSize: 14 }} />
        <Text type="secondary" style={{ fontSize: 13 }}>
          ({(game.reviewCount || 0).toLocaleString('vi-VN')} lượt đánh giá)
        </Text>
      </div>

      {/* Khung viết bình luận hiện đại & tinh gọn */}
      <Form form={form} onFinish={handleFinish} initialValues={{ rating: 5 }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 24,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px 8px' }}>
            <Avatar
              src={user?.avatar}
              icon={<UserOutlined />}
              size={34}
              style={{ backgroundColor: '#4F46E5', flexShrink: 0, marginTop: 2 }}
            />
            <Form.Item
              name="comment"
              rules={[{ required: true, message: 'Vui lòng nhập nhận xét của bạn' }]}
              style={{ flex: 1, margin: 0 }}
            >
              <Input.TextArea
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                placeholder="Chia sẻ cảm nhận của bạn về tựa game này..."
                style={{ padding: 0, fontSize: 14, color: '#0F172A' }}
              />
            </Form.Item>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              background: '#F8FAFC',
              borderTop: '1px solid #F1F5F9',
              padding: '8px 16px',
            }}
          >
            <Space size={10} align="center">
              <Text type="secondary" style={{ fontSize: 13 }}>
                Đánh giá:
              </Text>
              <Form.Item name="rating" rules={[{ required: true, message: 'Chọn số sao' }]} style={{ margin: 0 }}>
                <Rate style={{ fontSize: 16 }} />
              </Form.Item>
            </Space>

            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting}>
              Gửi đánh giá
            </Button>
          </div>
        </div>
      </Form>

      {/* Danh sách bình luận gọn gàng */}
      {reviews.length === 0 ? (
        <Empty description="Chưa có bình luận nào. Hãy là người đầu tiên!" style={{ padding: '24px 0' }} />
      ) : (
        <div>
          {reviews.map((rev, idx) => (
            <div
              key={rev._id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 2px',
                borderBottom: idx < reviews.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}
            >
              <Avatar
                src={rev.user?.avatar}
                icon={<UserOutlined />}
                size={36}
                style={{ backgroundColor: '#4F46E5', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  <Text strong style={{ color: '#0F172A', fontSize: 14 }}>
                    {rev.user?.username || 'Game thủ'}
                  </Text>
                  <Tag style={{ margin: 0, fontSize: 11, background: '#F1F5F9', border: 'none', color: '#475569' }}>
                    Lv.{rev.user?.level || 1}
                  </Tag>
                  <Rate disabled value={rev.rating} style={{ fontSize: 12, marginLeft: 4 }} />
                  {rev.createdAt && (
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
                      {formatDateVi(rev.createdAt)}
                    </Text>
                  )}
                </div>
                <Paragraph style={{ margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.6 }}>
                  {rev.comment}
                </Paragraph>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameReviewsTab;
