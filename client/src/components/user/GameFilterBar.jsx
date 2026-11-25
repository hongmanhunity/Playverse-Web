import { Row, Col, Card, Input, Select, Tag, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { GAME_CATEGORIES, SORT_OPTIONS } from '../../constants';

const GameFilterBar = ({ category, onSearch, onSortChange, onCategoryChange }) => {
  return (
    <Card className="pv-modern-card" style={{ marginBottom: 28, borderRadius: 14 }} styles={{ body: { padding: 20 } }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={14}>
          <Input.Search
            placeholder="Tìm kiếm tên game hoặc thể loại..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={onSearch}
          />
        </Col>
        <Col xs={24} md={10}>
          <Row justify="end">
            <Col xs={24} sm={16}>
              <Select
                placeholder="Sắp xếp theo"
                allowClear
                size="large"
                style={{ width: '100%' }}
                onChange={(val) => onSortChange(val || '')}
                options={SORT_OPTIONS}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Space wrap size={[8, 8]} style={{ marginTop: 16 }}>
        {GAME_CATEGORIES.map((cat) => {
          const isActive = (cat === 'Tất cả' && !category) || category === cat;
          return (
            <Tag.CheckableTag
              key={cat}
              checked={isActive}
              onChange={() => onCategoryChange(cat === 'Tất cả' ? '' : cat)}
              style={{
                padding: '5px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                border: isActive ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                background: isActive ? '#4F46E5' : '#F8FAFC',
                color: isActive ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
              }}
            >
              {cat}
            </Tag.CheckableTag>
          );
        })}
      </Space>
    </Card>
  );
};

export default GameFilterBar;
