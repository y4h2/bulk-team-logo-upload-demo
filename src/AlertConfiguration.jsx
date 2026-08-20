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

const getLeagueId = (league) => league.id ?? league.league_id ?? league.leagueId ?? league.code;
const getLeagueCode = (league) => league.code ?? league.league_code ?? league.leagueCode ?? '-';
const getLeagueName = (league) => league.name ?? league.league_name ?? league.leagueName ?? getLeagueCode(league);
const isLeagueActive = (league) => league.active ?? league.is_active ?? league.enabled ?? true;

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

const normalizeLeagues = (leagues) => leagues.map((league, index) => ({
  ...league,
  _key: String(getLeagueId(league) ?? `league-${index}`),
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
        || String(getLeagueName(league)).toLowerCase().includes(keyword)
        || String(getLeagueCode(league)).toLowerCase().includes(keyword);
      const active = isLeagueActive(league);
      const matchesStatus = status === 'all'
        || (status === 'active' && active)
        || (status === 'inactive' && !active);

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
      id: getLeagueId(league),
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
      width: 300,
      sorter: (a, b) => String(getLeagueName(a)).localeCompare(String(getLeagueName(b))),
      render: (_, league) => <Text strong>{getLeagueName(league)}</Text>,
    },
    {
      title: 'LEAGUE CODE',
      key: 'code',
      width: 150,
      render: (_, league) => <Text code>{getLeagueCode(league)}</Text>,
    },
    {
      title: 'STATUS',
      key: 'status',
      width: 130,
      render: (_, league) => {
        const active = isLeagueActive(league);
        return <Tag color={active ? 'success' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>;
      },
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
            aria-label={`${alertType.label} for ${getLeagueName(league)}: switch on to bypass`}
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
