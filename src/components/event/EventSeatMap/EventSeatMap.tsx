import React from 'react';
import { Card, Button, Space } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';

const EventSeatMap: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Seat Map</h2>
        <Space>
          <Button icon={<EditOutlined />}>Edit Layout</Button>
          <Button type="primary" icon={<SaveOutlined />}>Save Changes</Button>
        </Space>
      </div>
      <Card>
        <div style={{ 
          minHeight: '500px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          border: '1px dashed #d9d9d9',
          borderRadius: '8px',
          background: '#fafafa'
        }}>
          {/* TODO: Implement seat map editor/viewer */}
          <p>Seat Map Editor will be implemented here</p>
        </div>
      </Card>
    </div>
  );
};

export default EventSeatMap;
