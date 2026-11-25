import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Image } from 'antd';

const GameFormModal = ({ open, editingGame, submitting, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const thumbnailUrl = Form.useWatch('thumbnail', form);

  useEffect(() => {
    if (!open) return;
    if (editingGame) {
      form.setFieldsValue({
        title: editingGame.title,
        publisher: editingGame.publisher,
        category: editingGame.category,
        price: editingGame.price,
        discount: editingGame.discount,
        thumbnail: editingGame.thumbnail,
        heroBanner: editingGame.heroBanner,
        size: editingGame.size,
        downloads: editingGame.downloads,
        tags: editingGame.tags || [],
        description: editingGame.description,
      });
    } else {
      form.resetFields();
    }
  }, [open, editingGame, form]);

  return (
    <Modal
      title={editingGame ? `Chỉnh sửa Game: ${editingGame.title}` : 'Thêm Game mới'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={680}
      okText={editingGame ? 'Lưu thay đổi' : 'Tạo Game'}
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ price: 0, discount: 0, category: 'Action', size: '1.0 GB', downloads: '1M+' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="title" label="Tên Game" rules={[{ required: true, message: 'Vui lòng nhập tên game' }]}>
              <Input placeholder="VD: Black Myth: Wukong" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="publisher" label="Nhà phát hành">
              <Input placeholder="VD: Game Science" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={10}>
            <Form.Item name="category" label="Thể loại" rules={[{ required: true, message: 'Vui lòng nhập thể loại' }]}>
              <Input placeholder="VD: Action RPG - Open World" />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name="price" label="Giá ($ USD)">
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name="discount" label="Giảm giá (%)">
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} align="middle">
          <Col span={thumbnailUrl ? 18 : 24}>
            <Form.Item
              name="thumbnail"
              label="Link Ảnh Thumbnail"
              rules={[{ required: true, message: 'Vui lòng nhập link ảnh thumbnail' }]}
            >
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          {thumbnailUrl && (
            <Col span={6} style={{ textAlign: 'right' }}>
              <Image
                src={thumbnailUrl}
                width={120}
                height={68}
                style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #E2E8F0' }}
              />
            </Col>
          )}
        </Row>

        <Form.Item name="heroBanner" label="Link Ảnh Banner (tùy chọn)">
          <Input placeholder="https://..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tags" label="Nhãn (Tags)">
              <Select
                mode="tags"
                placeholder="Chọn hoặc nhập tag"
                options={[
                  { value: 'Popular', label: 'Popular' },
                  { value: 'Featured', label: 'Featured' },
                  { value: 'Flash', label: 'Flash' },
                  { value: 'New', label: 'New' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="size" label="Dung lượng">
              <Input placeholder="VD: 30 GB" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="downloads" label="Lượt tải">
              <Input placeholder="VD: 10M+" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả chi tiết">
          <Input.TextArea rows={3} placeholder="Mô tả nội dung tựa game..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GameFormModal;
