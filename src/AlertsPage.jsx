'use client';

import React, { useMemo, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Card, Flex, Input, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import AlertConfiguration from './AlertConfiguration';
import { mockAlerts, mockLeagues } from './mockAlerts';
import styles from './alerts.module.css';

const { Text, Title } = Typography;

const statusColors = {
  Open: 'error',
  Investigating: 'processing',
  Resolved: 'success',
};

function AlertsTable({ alerts }) {
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('all');

  const filteredAlerts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return alerts.filter((alert) => {
      const matchesSearch = !keyword || [alert.type, alert.league, alert.event]
        .some((value) => String(value).toLowerCase().includes(keyword));
      return matchesSearch && (status === 'all' || alert.status === status);
    });
  }, [alerts, searchText, status]);

  const columns = [
    { title: 'TYPE', dataIndex: 'type', key: 'type', width: 190 },
    { title: 'LEAGUE', dataIndex: 'league', key: 'league', width: 110 },
    { title: 'EVENT', dataIndex: 'event', key: 'event' },
    { title: 'CREATED', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value) => <Tag color={statusColors[value]}>{value}</Tag>,
    },
  ];

  return (
    <Card styles={{ body: { padding: 0 } }}>
      <Flex align="center" justify="space-between" gap="middle" wrap style={{ padding: 16 }}>
        <Space size={12} wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search alerts…"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className={styles.search}
          />
          <Select
            value={status}
            onChange={setStatus}
            className={styles.filter}
            options={[
              { label: 'All statuses', value: 'all' },
              { label: 'Open', value: 'Open' },
              { label: 'Investigating', value: 'Investigating' },
              { label: 'Resolved', value: 'Resolved' },
            ]}
          />
        </Space>
      </Flex>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredAlerts}
        pagination={false}
        size="middle"
        scroll={{ x: 850 }}
      />
    </Card>
  );
}

export default function AlertsPage({ initialAlerts = mockAlerts, leagues = mockLeagues }) {
  const tabItems = [
    {
      key: 'alerts',
      label: 'Alerts',
      children: <AlertsTable alerts={initialAlerts} />,
    },
    {
      key: 'configuration',
      label: 'Configuration',
      children: <AlertConfiguration leagues={leagues} />,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Flex vertical gap="small">
          <div>
            <Title level={2} style={{ marginBottom: 0 }}>Alerts</Title>
            <Text type="secondary">
              Monitor operational alerts and configure league-level bypasses.
            </Text>
          </div>
          <Tabs defaultActiveKey="alerts" items={tabItems} />
        </Flex>
      </div>
    </main>
  );
}
