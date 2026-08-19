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
import { modalStyles } from './modalStyles';

const { Text, Title } = Typography;

const BROKEN_IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="#fafafa" stroke="#bfbfbf"/><path d="m6 17 4-4 3 3 2-2 3 3" fill="none" stroke="#8c8c8c" stroke-width="1.5"/><circle cx="15.5" cy="8.5" r="1.5" fill="#8c8c8c"/></svg>',
)}`;

const getLogoSet = (team, type) => {
  if (type === 'legacy') return team?.logos || {};
  if (type === 'light') return team?.logo_variants?.light_mode || {};
  if (type === 'dark') return team?.logo_variants?.dark_mode || {};
  return {};
};

const uploadModeByType = {
  legacy: 'legacy',
  light: 'light_mode',
  dark: 'dark_mode',
};

const normalizeUploadedUrls = (result, type) => {
  const urls = result?.urls || result?.logos || result || {};

  return {
    small: urls.small || '',
    medium: urls.medium || '',
    large: urls.large || '',
    ...(type === 'legacy'
      ? { large_7_1: urls.large_7_1 || urls.xlarge || '' }
      : { xlarge: urls.xlarge || urls.large_7_1 || '' }),
  };
};

const applyUploadedUrlsToTeam = (team, type, urls) => {
  if (type === 'legacy') return { ...team, logos: urls };

  return {
    ...team,
    logo_variants: {
      ...team.logo_variants,
      [uploadModeByType[type]]: urls,
    },
  };
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error || new Error('Could not read the selected PNG.'));
  reader.readAsDataURL(file);
});

function LogoSizeCell({ team, type, size, active, pending }) {
  const logos = getLogoSet(team, type);
  const src = pending?.urls?.[size.key] || pending?.preview || logos[size.key];
  const status = pending?.uploading ? 'Uploading' : pending ? 'Unsaved' : src ? 'Uploaded' : 'Missing';

  return (
    <Tooltip title={`${typeConfig[type].label} ${size.label}: ${status}`}>
      <span className={`matrix-logo-cell ${active ? 'is-active' : ''}`}>
        <span className={`logo-frame ${type === 'dark' ? 'dark-frame' : ''} ${src ? 'has-logo' : 'is-missing'} ${pending ? 'is-pending' : ''}`}>
          {src ? (
            <Image
              src={src}
              alt={`${team.team_name} ${typeConfig[type].label} ${size.label} logo`}
              width={24}
              height={24}
              fallback={BROKEN_IMAGE_FALLBACK}
              style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }}
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
  onUpload,
}) {
  const beforeUpload = (file) => {
    if (file.type !== 'image/png') {
      window.dispatchEvent(new CustomEvent('logo-upload-error'));
      return Upload.LIST_IGNORE;
    }
    return true;
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
          customRequest={(options) => onUpload(team, selectedType, options)}
          disabled={pending?.uploading}
          className="logo-dragger"
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="upload-title" title={pending?.file.name}>
            {pending ? pending.file.name : 'Drop PNG here'}
          </p>
          <p className="upload-hint">
            {pending?.uploading
              ? 'Uploading to S3 and generating sizes…'
              : pending
                ? 'S3 URLs ready — save this team to apply'
                : 'or click to choose a PNG file'}
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
  resizeAndUpload,
  onSave,
}) {
  const { message } = AntApp.useApp();
  const [searchText, setSearchText] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [selectedType, setSelectedType] = useState('legacy');
  const [pending, setPending] = useState({});
  const [savingTeamId, setSavingTeamId] = useState(null);
  const [draftTeams, setDraftTeams] = useState(teams);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDraftTeams(teams);
  }, [teams]);

  useEffect(() => {
    const onError = () => message.error('Please select a PNG file. Other formats are not accepted.');
    window.addEventListener('logo-upload-error', onError);
    return () => window.removeEventListener('logo-upload-error', onError);
  }, [message]);

  const filteredTeams = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return draftTeams;
    return draftTeams.filter(
      (team) => team.team_name.toLowerCase().includes(keyword) || team.tri_code.toLowerCase().includes(keyword),
    );
  }, [searchText, draftTeams]);

  const pendingCount = Object.keys(pending).length;

  const openEditor = (teamId, type) => {
    setSelectedType(type);
    setExpandedTeamId((current) => (current === teamId && selectedType === type ? null : teamId));
  };

  const uploadDroppedLogo = async (team, type, { file, onSuccess, onError }) => {
    const key = `${team.id}-${type}`;
    const preview = URL.createObjectURL(file);

    setPending((value) => ({
      ...value,
      [key]: {
        teamId: team.id,
        type,
        file,
        preview,
        uploading: true,
      },
    }));

    try {
      let result;
      if (resizeAndUpload) {
        result = await resizeAndUpload({
          file,
          mode: uploadModeByType[type],
          triCode: team.tri_code,
        });
      } else {
        const dataUrl = await readFileAsDataUrl(file);
        await new Promise((resolve) => setTimeout(resolve, 700));
        result = { small: dataUrl, medium: dataUrl, large: dataUrl, xlarge: dataUrl };
      }

      const urls = normalizeUploadedUrls(result, type);
      const artifact = {
        teamId: team.id,
        type,
        file,
        urls,
        result,
        uploading: false,
      };

      setDraftTeams((value) => value.map((item) => (
        String(item.id) === String(team.id) ? applyUploadedUrlsToTeam(item, type, urls) : item
      )));
      setPending((value) => ({ ...value, [key]: artifact }));
      URL.revokeObjectURL(preview);
      onSuccess(result);
    } catch (error) {
      URL.revokeObjectURL(preview);
      setPending((value) => {
        const next = { ...value };
        delete next[key];
        return next;
      });
      console.error(error);
      message.error(`${typeConfig[type].label} logo upload failed. Please try again.`);
      onError(error);
    }
  };

  const saveTeam = async (team) => {
    const teamEntries = Object.entries(pending).filter(([, value]) => String(value.teamId) === String(team.id));
    if (!teamEntries.length) return message.info('Choose at least one PNG for this team.');
    if (teamEntries.some(([, value]) => value.uploading)) return message.info('Wait for the S3 upload to finish.');

    setSavingTeamId(team.id);

    try {
      const artifacts = teamEntries.map(([key, upload]) => ({ key, ...upload }));
      if (onSave) await onSave(team, artifacts);

      setPending((value) => {
        const next = { ...value };
        teamEntries.forEach(([key]) => { delete next[key]; });
        return next;
      });
      message.success(`${artifacts.length} logo ${artifacts.length === 1 ? 'upload' : 'uploads'} saved for this team.`);
    } catch (error) {
      console.error(error);
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
        const teamIsUploading = Object.values(pending).some(
          (value) => String(value.teamId) === String(team.id) && value.uploading,
        );

        return (
          <Button
            type="primary"
            size="small"
            loading={String(savingTeamId) === String(team.id)}
            disabled={!teamPendingCount || teamIsUploading}
            onClick={() => saveTeam(team)}
          >
            Save
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <style>{modalStyles}</style>
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
                onUpload={uploadDroppedLogo}
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
    </>
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
