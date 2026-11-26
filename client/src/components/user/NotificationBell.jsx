import { useState, useEffect } from 'react';
import { Badge, Button, Popover, Typography, Tag, Empty, Spin, Space } from 'antd';
import { BellOutlined, GiftOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import notificationApi from '../../api/notificationApi';
import { formatDateVi } from '../../utils/formatters';

const { Text, Paragraph } = Typography;
const SEEN_STORAGE_KEY = 'pv_seen_notification_ids';

const TYPE_META = {
  promotion: { label: 'Khuyến mãi', color: 'volcano', icon: <GiftOutlined /> },
  event: { label: 'Sự kiện', color: 'purple', icon: <CalendarOutlined /> },
  system: { label: 'Hệ thống', color: 'geekblue', icon: <InfoCircleOutlined /> },
};

const getSeenIds = () => {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState(getSeenIds);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const res = await notificationApi.getAll();
        if (active) {
          setNotifications(res.data || []);
        }
      } catch {
        // Bỏ qua nếu chưa tải được thông báo
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
  }, []);

  const unreadCount = notifications.filter((item) => !seenIds.includes(item._id)).length;

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (nextOpen && notifications.length > 0) {
      const allIds = notifications.map((item) => item._id);
      setSeenIds(allIds);
      localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(allIds));
    }
  };

  const content = (
    <div style={{ width: 340, maxHeight: 400, overflowY: 'auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 10,
          marginBottom: 10,
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Text strong style={{ fontSize: 14, color: '#0F172A' }}>
          Thông báo PlayVerse
        </Text>
        <Tag color="geekblue" style={{ margin: 0, fontSize: 11 }}>
          {notifications.length} tin
        </Tag>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 28 }}>
          <Spin size="small" />
        </div>
      ) : notifications.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo nào" style={{ margin: '16px 0' }} />
      ) : (
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          {notifications.slice(0, 10).map((item) => {
            const meta = TYPE_META[item.type] || TYPE_META.system;
            return (
              <div
                key={item._id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Space size={6}>
                    <Tag color={meta.color} icon={meta.icon} style={{ margin: 0, fontSize: 11 }}>
                      {meta.label}
                    </Tag>
                    {item.badge && (
                      <Tag color="red" style={{ margin: 0, fontSize: 10, fontWeight: 700 }}>
                        {item.badge}
                      </Tag>
                    )}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatDateVi(item.createdAt)}
                  </Text>
                </div>

                <Text strong style={{ display: 'block', color: '#0F172A', fontSize: 13, marginBottom: 2 }}>
                  {item.titleText}
                </Text>
                <Paragraph style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                  {item.message}
                </Paragraph>

                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.titleText}
                    style={{
                      width: '100%',
                      height: 96,
                      objectFit: 'cover',
                      borderRadius: 8,
                      marginTop: 8,
                    }}
                  />
                )}
              </div>
            );
          })}
        </Space>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 4]}>
        <Button
          type="text"
          aria-label="Thông báo"
          icon={<BellOutlined style={{ fontSize: 17, color: '#475569' }} />}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
