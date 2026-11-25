import { Table, Button, Space, Popconfirm, Tag, Image, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, StarFilled } from '@ant-design/icons';
import { getDiscountedPrice } from '../../utils/formatters';

const { Text } = Typography;

const AdminGamesTable = ({
  games = [],
  loading = false,
  pagination = false,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      title: 'Game',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space size={12}>
          <Image
            src={record.thumbnail}
            width={64}
            height={40}
            style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #E2E8F0' }}
          />
          <div>
            <Text strong style={{ color: '#0F172A', display: 'block' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.publisher || 'PlayVerse Studio'} • {record.size || '1.0 GB'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Thể loại',
      dataIndex: 'category',
      key: 'category',
      width: 190,
      render: (cat) => (
        <Tag
          color="geekblue"
          style={{
            maxWidth: 170,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            margin: 0,
          }}
        >
          {cat}
        </Tag>
      ),
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 170,
      render: (price, record) => {
        if (!price || price === 0) {
          return (
            <Space size={6}>
              <Tag color="success" style={{ margin: 0 }}>
                Miễn phí
              </Tag>
              {record.discount > 0 && <Tag color="error">-{record.discount}%</Tag>}
            </Space>
          );
        }
        const finalPrice = getDiscountedPrice(price, record.discount);
        return (
          <Space size={6} className="font-mono-num">
            <Text strong style={{ color: '#4F46E5' }}>
              ${finalPrice.toFixed(2)}
            </Text>
            {record.discount > 0 && <Tag color="error">-{record.discount}%</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Đánh giá',
      dataIndex: 'averageRating',
      key: 'averageRating',
      width: 130,
      render: (val, record) => (
        <Space size={4} className="font-mono-num">
          <StarFilled style={{ color: '#F59E0B' }} />
          <Text strong>{val || 0}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ({(record.reviewCount || 0).toLocaleString('vi-VN')})
          </Text>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>
          {onDelete && (
            <Popconfirm
              title="Xác nhận xóa game?"
              description="Toàn bộ đánh giá và wishlist của game này cũng sẽ bị xóa!"
              onConfirm={() => onDelete(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={games}
      rowKey="_id"
      loading={loading}
      pagination={pagination}
      size="middle"
      scroll={{ x: 760 }}
    />
  );
};

export default AdminGamesTable;
