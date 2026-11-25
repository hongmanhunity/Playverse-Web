import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col } from 'antd';

const UserFormModal = ({ open, editingUser, submitting, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editingUser) {
      form.setFieldsValue({
        username: editingUser.username,
        role: editingUser.role,
        level: editingUser.level,
        points: editingUser.points,
      });
    }
  }, [open, editingUser, form]);

  return (
    <Modal
      title={editingUser ? `Chỉnh sửa người dùng: ${editingUser.username}` : 'Chỉnh sửa người dùng'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="username"
          label="Tên người dùng (Username)"
          rules={[{ required: true, message: 'Vui lòng nhập username' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="role" label="Vai trò (Phân quyền)" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'user', label: 'Người dùng (User)' },
              { value: 'admin', label: 'Quản trị viên (Admin)' },
            ]}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="level" label="Cấp độ (Level)">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="points" label="Điểm tích lũy (Points)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
