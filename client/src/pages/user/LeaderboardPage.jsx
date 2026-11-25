import { useState, useEffect } from 'react';
import { Card, Table, Avatar, Tag, Typography, Space } from 'antd';
import { TrophyOutlined, CrownFilled, UserOutlined } from '@ant-design/icons';
import interactionApi from '../../api/interactionApi';

const { Title, Text } = Typography;

const LeaderboardPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await interactionApi.getGlobalLeaderboard();
        setData(res.data || []);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const renderRank = (rank) => {
    if (rank === 1) {
      return (
        <Tag color="gold" icon={<CrownFilled />} style={{ fontWeight: 700, fontSize: 13 }}>
          #1
        </Tag>
      );
    }
    if (rank === 2) {
      return (
        <Tag color="default" icon={<CrownFilled />} style={{ fontWeight: 700, fontSize: 13 }}>
          #2
        </Tag>
      );
    }
    if (rank === 3) {
      return (
        <Tag color="orange" icon={<CrownFilled />} style={{ fontWeight: 700, fontSize: 13 }}>
          #3
        </Tag>
      );
    }
    return (
      <Text className="font-mono-num" style={{ color: '#475569', fontWeight: 600 }}>
        #{rank}
      </Text>
    );
  };

  const columns = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 100,
      render: renderRank,
    },
    {
      title: 'Người chơi',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <Space>
          <Avatar src={user?.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#4F46E5' }} />
          <Text strong style={{ color: '#0F172A' }}>
            {user?.username}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Cấp độ',
      dataIndex: 'user',
      key: 'level',
      render: (user) => <Tag color="geekblue">Level {user?.level || 1}</Tag>,
    },
    {
      title: 'Điểm cao nhất',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <Text className="font-mono-num" strong style={{ color: '#4F46E5', fontSize: 15 }}>
          {score?.toLocaleString('vi-VN')}
        </Text>
      ),
    },
  ];

  return (
    <Card className="pv-modern-card" style={{ borderRadius: 14 }}>
      <Title level={3} className="font-heading" style={{ marginBottom: 20, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
        <TrophyOutlined style={{ color: '#F59E0B' }} />
        Bảng xếp hạng toàn hệ thống
      </Title>

      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => record.user?._id || record.rank}
        loading={loading}
        pagination={false}
      />
    </Card>
  );
};

export default LeaderboardPage;
