'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  InfoCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Alert,
  App as AntApp,
  Avatar,
  Button,
  Card,
  Flex,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import styles from './alerts.module.css';

const { Text } = Typography;

export const ALERT_TYPES = [
  {
    key: 'GameStartFailure',
    label: 'GameStartFailure',
    description: 'Game failed to start',
  },
  {
    key: 'GameStalled',
    label: 'GameStalled',
    description: 'Game appears to be stalled',
  },
];

const parseAlertConfig = (value) => {
  if (!value) return {};

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parseAlertConfig(parsed);
    } catch {
      return {};
    }
  }

  if (Array.isArray(value)) {
    return Object.fromEntries(
      value.filter((item) => typeof item === 'string').map((key) => [key, { bypass: true }]),
    );
  }

  return typeof value === 'object' && !Array.isArray(value) ? value : {};
};

const copyAlertConfig = (config) => Object.fromEntries(
  Object.entries(config).map(([key, value]) => [
    key,
    value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : value,
  ]),
);

const normalizeLeagues = (leagues) => leagues.map((league) => ({
  ...league,
  _key: String(league.sn_league_id),
  _alertConfig: copyAlertConfig(parseAlertConfig(league.alert_config)),
}));

const isBypassed = (config, alertType) => {
  const value = config?.[alertType];
  if (typeof value === 'boolean') return value;
  return Boolean(value?.bypass);
};

const setBypassValue = (config, alertType, checked) => {
  const currentValue = config?.[alertType];

  if (currentValue && typeof currentValue === 'object' && !Array.isArray(currentValue)) {
    return {
      ...config,
      [alertType]: { ...currentValue, bypass: checked },
    };
  }

  return {
    ...config,
    [alertType]: { bypass: checked },
  };
};

const hasConfigChanged = (current, original) => ALERT_TYPES.some(
  ({ key }) => isBypassed(current, key) !== isBypassed(original, key),
);

export default function AlertConfiguration({ leagues = [], onSave }) {
  const { message } = AntApp.useApp();
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('all');
  const [draftLeagues, setDraftLeagues] = useState(() => normalizeLeagues(leagues));
  const [savedLeagues, setSavedLeagues] = useState(() => normalizeLeagues(leagues));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const normalized = normalizeLeagues(leagues);
    setDraftLeagues(normalized);
    setSavedLeagues(normalized);
  }, [leagues]);

  const changedLeagueKeys = useMemo(() => new Set(
    draftLeagues
      .filter((league) => {
        const original = savedLeagues.find((item) => item._key === league._key);
        return hasConfigChanged(league._alertConfig, original?._alertConfig);
      })
      .map((league) => league._key),
  ), [draftLeagues, savedLeagues]);

  const filteredLeagues = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return draftLeagues.filter((league) => {
      const matchesSearch = !keyword
        || league.league_display_name.toLowerCase().includes(keyword)
        || league.league_be_code.toLowerCase().includes(keyword)
        || league.league_short_name.toLowerCase().includes(keyword);
      const matchesStatus = status === 'all'
        || (status === 'active' && league.active)
        || (status === 'inactive' && !league.active);

      return matchesSearch && matchesStatus;
    });
  }, [draftLeagues, searchText, status]);

  const toggleBypass = (leagueKey, alertType, checked) => {
    setDraftLeagues((current) => current.map((league) => (
      league._key === leagueKey
        ? { ...league, _alertConfig: setBypassValue(league._alertConfig, alertType, checked) }
        : league
    )));
  };

  const resetChanges = () => {
    setDraftLeagues(savedLeagues.map((league) => ({
      ...league,
      _alertConfig: copyAlertConfig(league._alertConfig),
    })));
    message.info('Unsaved alert configuration changes were reset.');
  };

  const saveChanges = async () => {
    const changedLeagues = draftLeagues.filter((league) => changedLeagueKeys.has(league._key));
    const payload = changedLeagues.map((league) => ({
      sn_league_id: league.sn_league_id,
      alert_config: copyAlertConfig(league._alertConfig),
    }));

    setSaving(true);
    try {
      if (onSave) {
        await onSave(payload);
      } else {
        // TODO(alert-config-api): Replace this log when the existing backend exposes an update API.
        console.info('[AlertConfiguration] changed leagues payload', payload);
      }

      setSavedLeagues(draftLeagues.map((league) => ({
        ...league,
        _alertConfig: copyAlertConfig(league._alertConfig),
      })));
      message.success(onSave
        ? `${payload.length} league ${payload.length === 1 ? 'configuration' : 'configurations'} saved.`
        : `${payload.length} changed ${payload.length === 1 ? 'league' : 'leagues'} prepared in the console.`);
    } catch (error) {
      console.error('[AlertConfiguration] save failed', error);
      message.error('Alert configuration could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'LEAGUE',
      key: 'league',
      width: 170,
      sorter: (a, b) => a.league_be_code.localeCompare(b.league_be_code),
      render: (_, league) => (
        <Space size={10}>
          <Avatar
            shape="square"
            size={32}
            src={league.league_logo || undefined}
            alt={`${league.league_be_code} logo`}
            style={{ backgroundColor: league.league_logo ? '#fff' : '#1677ff' }}
          >
            {league.league_be_code.slice(0, 2)}
          </Avatar>
          <Text strong>{league.league_be_code}</Text>
        </Space>
      ),
    },
    {
      title: 'LEAGUE NAME',
      key: 'name',
      width: 300,
      sorter: (a, b) => a.league_display_name.localeCompare(b.league_display_name),
      render: (_, league) => league.league_display_name,
    },
    {
      title: 'STATUS',
      key: 'status',
      width: 130,
      render: (_, league) => (
        <Tag color={league.active ? 'success' : 'default'}>
          {league.active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'BYPASS ALERT TYPES',
      children: ALERT_TYPES.map((alertType) => ({
        title: (
          <Space direction="vertical" size={0}>
            <span>{alertType.label}</span>
            <Text type="secondary" style={{ fontSize: 11 }}>{alertType.description}</Text>
          </Space>
        ),
        key: alertType.key,
        width: 210,
        align: 'center',
        render: (_, league) => (
          <Switch
            checked={isBypassed(league._alertConfig, alertType.key)}
            onChange={(checked) => toggleBypass(league._key, alertType.key, checked)}
            checkedChildren="Bypass"
            unCheckedChildren="Alert"
            aria-label={`${alertType.label} for ${league.league_display_name}: switch on to bypass`}
          />
        ),
      })),
    },
  ];

  return (
    <Flex vertical gap="middle">
      <Alert
        showIcon
        icon={<InfoCircleOutlined />}
        type="info"
        message="Switch ON means the alert type is bypassed"
        description="A bypassed alert is not generated for that league. Switch OFF to keep alerting enabled."
      />

      <Card styles={{ body: { padding: 0 } }}>
        <Flex align="center" justify="space-between" gap="middle" wrap style={{ padding: 16 }}>
          <Space size={12} wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search league name or code…"
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
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
            />
          </Space>

          <Space size={12} wrap>
            <Text type={changedLeagueKeys.size ? 'warning' : 'secondary'}>
              {changedLeagueKeys.size
                ? `${changedLeagueKeys.size} unsaved ${changedLeagueKeys.size === 1 ? 'league' : 'leagues'}`
                : 'No unsaved changes'}
            </Text>
            <Button
              icon={<ReloadOutlined />}
              disabled={!changedLeagueKeys.size || saving}
              onClick={resetChanges}
            >
              Reset
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!changedLeagueKeys.size}
              onClick={saveChanges}
            >
              Save Changes
            </Button>
          </Space>
        </Flex>

        <Table
          rowKey="_key"
          columns={columns}
          dataSource={filteredLeagues}
          size="middle"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} leagues`,
          }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: 'No leagues match the current filters.' }}
        />
      </Card>
    </Flex>
  );
}
