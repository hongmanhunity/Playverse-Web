import { useEffect } from 'react';
import { Modal, Form, Input, Select, Image } from 'antd';

const BannerFormModal = ({ open, editingBanner, games = [], submitting, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const previewImage = Form.useWatch('image', form);

  useEffect(() => {
    if (!open) return;
    if (editingBanner) {
      form.setFieldsValue({
        title: editingBanner.title,
        image: editingBanner.image,
        gameId: editingBanner.gameId?._id || editingBanner.gameId || undefined,
      });
    } else {
      form.resetFields();
    }
  }, [open, editingBanner, form]);

  return (
    <Modal
      title={editingBanner ? `Sửa Banner: ${editingBanner.title}` : 'Thêm Banner mới'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText={editingBanner ? 'Lưu thay đổi' : 'Tạo Banner'}
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
          <Input placeholder="VD: Siêu phẩm giảm giá 50%" />
        </Form.Item>

        <Form.Item name="image" label="Link Hình ảnh" rules={[{ required: true, message: 'Vui lòng nhập link ảnh' }]}>
          <Input placeholder="https://..." />
        </Form.Item>

        {previewImage && (
          <div style={{ marginBottom: 16 }}>
            <Image
              src={previewImage}
              width="100%"
              height={160}
              style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #E2E8F0' }}
            />
          </div>
        )}

        <Form.Item name="gameId" label="Liên kết với Game (khi bấm vào banner)">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Tìm và chọn game"
            options={games.map((g) => ({ value: g._id, label: g.title }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BannerFormModal;
