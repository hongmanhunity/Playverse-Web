import { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';

const NotificationFormModal = ({ open, submitting, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Tạo Thông báo mới"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Tạo Thông báo"
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{ type: 'system', badge: 'MỚI' }}>
        <Form.Item name="titleText" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
          <Input placeholder="VD: Sự kiện Cuối Tuần" />
        </Form.Item>

        <Form.Item name="message" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
          <Input.TextArea rows={3} placeholder="Nội dung thông báo gửi tới người dùng..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="type" label="Loại thông báo">
              <Select
                options={[
                  { value: 'system', label: 'Hệ thống (System)' },
                  { value: 'promotion', label: 'Khuyến mãi (Promotion)' },
                  { value: 'event', label: 'Sự kiện (Event)' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="badge" label="Nhãn hiển thị">
              <Input placeholder="VD: HOT, MỚI, SALE" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default NotificationFormModal;
