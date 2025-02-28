import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';

const EventAnalytics: React.FC = () => {
  // TODO: Replace with actual data from API
  const analyticsData = {
    totalTicketsSold: 150,
    totalRevenue: 15000,
    activeAttendees: 75,
    totalRegistrations: 200,
  };

  return (
    <div>
      <h2>Event Analytics</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tickets Sold"
              value={analyticsData.totalTicketsSold}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={analyticsData.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Attendees"
              value={analyticsData.activeAttendees}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Registrations"
              value={analyticsData.totalRegistrations}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EventAnalytics;
