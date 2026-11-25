import { Table, Tag, Space, Avatar, Typography, Empty } from 'antd';
import { CrownFilled, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const columns = [
  {
    title: 'Hạng',
    dataIndex: 'rank',
    key: 'rank',
    width: 90,
    render: (rank) =>
      rank <= 3 ? (
        <Tag color={rank === 1 ? 'gold' : rank === 2 ? 'default' : 'orange'} icon={<CrownFilled />}>
          #{rank}
        </Tag>
      ) : (
        <Text className="font-mono-num">#{rank}</Text>
      ),
  },
  {
    title: 'Người chơi',
    dataIndex: 'user',
    key: 'user',
    render: (u) => (
      <Space>
        <Avatar src={u?.avatar} icon={<UserOutlined />} size="small" />
        <Text strong>{u?.username}</Text>
      </Space>
    ),
  },
  {
    title: 'Cấp độ',
    dataIndex: 'user',
    key: 'level',
    render: (u) => <Tag color="geekblue">Lv.{u?.level || 1}</Tag>,
  },
  {
    title: 'Điểm số',
    dataIndex: 'score',
    key: 'score',
    render: (score) => (
      <Text className="font-mono-num" strong style={{ color: '#4F46E5' }}>
        {score?.toLocaleString('vi-VN')}
      </Text>
    ),
  },
];

const GameLeaderboardTab = ({ leaderboard = [] }) => {
  if (!leaderboard || leaderboard.length === 0) {
    return <Empty description="Chưa có người chơi nào ghi danh trên bảng xếp hạng game này" />;
  }

  return (
    <Table
      columns={columns}
      dataSource={leaderboard}
      rowKey={(r) => r.user?._id || r.rank}
      pagination={false}
    />
  );
};

export default GameLeaderboardTab;
