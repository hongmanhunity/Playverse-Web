import { Row, Col, Card, Tag, Typography, Space, Empty } from 'antd';

const { Title, Text } = Typography;

const GameLevelsTab = ({ levels = [] }) => {
  if (!levels || levels.length === 0) {
    return <Empty description="Game này chưa có thông tin màn chơi thử thách" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {levels.map((lvl) => (
        <Col key={lvl._id || lvl.levelNumber} xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              height: '100%',
            }}
          >
            <Tag color="geekblue" style={{ marginBottom: 8 }}>
              Màn {lvl.levelNumber}
            </Tag>
            <Title level={5} style={{ margin: '0 0 8px 0', color: '#0F172A' }}>
              {lvl.title}
            </Title>
            <Space direction="vertical" size={2}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Nhiệm vụ: <strong style={{ color: '#0F172A' }}>{lvl.puzzles}</strong> thử thách
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Phần thưởng: <strong style={{ color: '#10B981' }}>+{lvl.rewardPoints} điểm</strong>
              </Text>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default GameLevelsTab;
