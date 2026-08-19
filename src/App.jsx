'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CloseOutlined,
  CloudUploadOutlined,
  DownOutlined,
  EyeOutlined,
  FileImageOutlined,
  InboxOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  App as AntApp,
  Button,
  Image,
  Input,
  Modal,
  Segmented,
  Table,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import { mockTeams, typeConfig } from './mockTeams';

const { Text, Title } = Typography;

const getLogoSet = (team, type) => {
  if (type === 'legacy') return team?.logos || {};
  if (type === 'light') return team?.logo_variants?.light_mode || {};
  if (type === 'dark') return team?.logo_variants?.dark_mode || {};
  return {};
};

function LogoSizeCell({ team, type, size, active, pending, savedPreview }) {
  const logos = getLogoSet(team, type);
  const src = pending?.preview || savedPreview || logos[size.key];
  const status = pending ? 'Pending generation' : src ? 'Uploaded' : 'Missing';

  return (
    <Tooltip title={`${typeConfig[type].label} ${size.label}: ${status}`}>
      <span className={`matrix-logo-cell ${active ? 'is-active' : ''}`}>
        <span className={`logo-frame ${type === 'dark' ? 'dark-frame' : ''} ${src ? 'has-logo' : 'is-missing'} ${pending ? 'is-pending' : ''}`}>
          {src ? (
            <Image
              src={src}
              alt={`${team.team_name} ${typeConfig[type].label} ${size.label} logo`}
              width={27}
              height={27}
              preview={{ mask: <EyeOutlined className="logo-preview-eye" /> }}
            />
          ) : (
            <FileImageOutlined aria-label="Missing logo" />
          )}
        </span>
      </span>
    </Tooltip>
  );
}

function UploadEditor({
  team,
  selectedType,
  setSelectedType,
  pending,
  setPending,
}) {
  const beforeUpload = (file) => {
    if (file.type !== 'image/png') {
      window.dispatchEvent(new CustomEvent('logo-upload-error'));
      return Upload.LIST_IGNORE;
    }

    const preview = URL.createObjectURL(file);
    setPending((value) => ({
      ...value,
      [`${team.id}-${selectedType}`]: {
        teamId: team.id,
        type: selectedType,
        file,
        preview,
      },
    }));
    return false;
  };

  return (
    <div className="inline-editor">
      <div className="editor-topline">
        <div>
          <Text className="eyebrow">EDITING</Text>
          <Title level={5}>{team.team_name} assets</Title>
        </div>
        <Segmented
          value={selectedType}
          onChange={setSelectedType}
          options={Object.entries(typeConfig).map(([value, item]) => ({ value, label: item.label }))}
        />
      </div>

      <div className="compact-upload-row">
        <Upload.Dragger
          accept="image/png"
          maxCount={1}
          showUploadList={false}
          beforeUpload={beforeUpload}
          className="logo-dragger"
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="upload-title" title={pending?.file.name}>
            {pending ? pending.file.name : 'Drop PNG here'}
          </p>
          <p className="upload-hint">
            {pending ? `${typeConfig[selectedType].label} PNG selected` : 'or click to choose a PNG file'}
          </p>
        </Upload.Dragger>
      </div>
    </div>
  );
}

export function BulkTeamLogoUploadModal({
  open,
  onClose,
  teams = mockTeams,
  onSave,
}) {
  const { message } = AntApp.useApp();
  const [searchText, setSearchText] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [selectedType, setSelectedType] = useState('legacy');
  const [pending, setPending] = useState({});
  const [savingTeamId, setSavingTeamId] = useState(null);
  const [savedPreviews, setSavedPreviews] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onError = () => message.error('Please select a PNG file. Other formats are not accepted.');
    window.addEventListener('logo-upload-error', onError);
    return () => window.removeEventListener('logo-upload-error', onError);
  }, [message]);

  const filteredTeams = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return teams;
    return teams.filter(
      (team) => team.team_name.toLowerCase().includes(keyword) || team.tri_code.toLowerCase().includes(keyword),
    );
  }, [searchText, teams]);

  const pendingCount = Object.keys(pending).length;

  const openEditor = (teamId, type) => {
    setSelectedType(type);
    setExpandedTeamId((current) => (current === teamId && selectedType === type ? null : teamId));
  };

  const saveTeam = async (teamId) => {
    const teamEntries = Object.entries(pending).filter(([, value]) => String(value.teamId) === String(teamId));
    if (!teamEntries.length) return message.info('Choose at least one PNG for this team.');

    setSavingTeamId(teamId);
    const uploads = teamEntries.map(([, upload]) => ({
      teamId: upload.teamId,
      type: upload.type,
      file: upload.file,
    }));

    try {
      if (onSave) {
        await onSave(uploads);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      setSavedPreviews((value) => {
        const next = { ...value };
        teamEntries.forEach(([key, upload]) => { next[key] = upload.preview; });
        return next;
      });
      setPending((value) => {
        const next = { ...value };
        teamEntries.forEach(([key]) => { delete next[key]; });
        return next;
      });
      message.success(`${uploads.length} logo ${uploads.length === 1 ? 'upload' : 'uploads'} saved for this team.`);
    } catch {
      message.error('The uploads could not be saved. Please try again.');
    } finally {
      setSavingTeamId(null);
    }
  };

  const columns = [
    {
      title: 'TEAM',
      key: 'team',
      width: 220,
      fixed: 'left',
      render: (_, team) => (
        <div className="team-cell">
          <div>
            <div className="team-name">{team.team_name}</div>
            <div className="team-meta">{team.tri_code}</div>
          </div>
        </div>
      ),
    },
    ...['legacy', 'light', 'dark'].map((type) => ({
      title: <span className={`group-title group-${type}`}>{typeConfig[type].label.toUpperCase()}</span>,
      key: type,
      children: [
        ...typeConfig[type].sizes.map((size, index) => ({
          title: size.label,
          key: `${type}-${size.key}`,
          width: 52,
          align: 'center',
          className: index === 0 ? 'size-column group-start' : 'size-column',
          render: (_, team) => (
            <LogoSizeCell
              team={team}
              type={type}
              size={size}
              pending={pending[`${team.id}-${type}`]}
              savedPreview={savedPreviews[`${team.id}-${type}`]}
              active={expandedTeamId === team.id && selectedType === type}
            />
          ),
        })),
        {
          title: null,
          key: `${type}-expand`,
          width: 34,
          align: 'center',
          className: 'group-toggle-column',
          render: (_, team) => {
            const active = expandedTeamId === team.id && selectedType === type;
            return (
              <Tooltip title={`${active ? 'Close' : 'Upload'} ${typeConfig[type].label} logo`}>
                <button
                  className={`group-toggle ${active ? 'is-active' : ''}`}
                  onClick={() => openEditor(team.id, type)}
                  aria-label={`${active ? 'Close' : 'Open'} ${typeConfig[type].label} upload for ${team.team_name}`}
                >
                  <DownOutlined />
                </button>
              </Tooltip>
            );
          },
        },
      ],
    })),
    {
      title: 'ACTION',
      key: 'action',
      width: 88,
      align: 'center',
      fixed: 'right',
      className: 'team-action-column',
      render: (_, team) => {
        const teamPendingCount = Object.values(pending).filter(
          (value) => String(value.teamId) === String(team.id),
        ).length;

        return (
          <Button
            type="primary"
            size="small"
            loading={String(savingTeamId) === String(team.id)}
            disabled={!teamPendingCount}
            onClick={() => saveTeam(team.id)}
          >
            Save
          </Button>
        );
      },
    },
  ];

  return (
    <Modal
      open={mounted && open}
      onCancel={onClose}
      width={1180}
      centered
      className="bulk-modal"
      closeIcon={<CloseOutlined />}
      title={null}
      footer={null}
      destroyOnClose={false}
    >
      <div className="modal-header">
        <div>
          <Title level={4}>Bulk Team Logo Upload</Title>
          <Text>Fetch latest league and bound teams before processing files.</Text>
          <div className="snapshot-meta">
            <span>Current snapshot teams: {teams.length}</span>
            <span>League: —</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <Input
          prefix={<SearchOutlined />}
          allowClear
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search team name or code…"
          className="team-search"
        />
      </div>

      <div className="table-shell">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredTeams}
          pagination={{
            defaultPageSize: 25,
            pageSizeOptions: [20, 25, 30],
            showSizeChanger: true,
            showTotal: (total) => `${total} teams`,
          }}
          scroll={{ x: 1090, y: '55vh' }}
          locale={{ emptyText: <div className="empty-search">No team matches “{searchText}”</div> }}
          expandable={{
            showExpandColumn: false,
            expandedRowKeys: expandedTeamId ? [expandedTeamId] : [],
            expandedRowRender: (team) => (
              <UploadEditor
                team={team}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                pending={pending[`${team.id}-${selectedType}`]}
                setPending={setPending}
              />
            ),
          }}
        />
      </div>

      <div className="modal-footer">
        <div className="save-summary">
          {pendingCount ? <><b>{pendingCount}</b> unsaved {pendingCount === 1 ? 'change' : 'changes'}</> : 'No pending uploads'}
        </div>
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

export default function App() {
  const [open, setOpen] = useState(true);

  return (
    <main className="demo-shell">
      <Button type="primary" icon={<CloudUploadOutlined />} onClick={() => setOpen(true)}>
        Open bulk uploader
      </Button>
      <BulkTeamLogoUploadModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
