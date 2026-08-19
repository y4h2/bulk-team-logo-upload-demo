export const modalStyles = String.raw`
  .demo-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f5f5f5; }
  .bulk-modal { max-width: calc(100vw - 32px); }
  .bulk-modal .ant-modal-content { padding: 0; overflow: hidden; border-radius: 8px; }
  .bulk-modal .ant-modal-close { top: 18px; right: 18px; }

  .modal-header { padding: 20px 24px 14px; }
  .modal-header h4 { margin: 0 0 4px !important; font-size: 18px; }
  .modal-header > div > .ant-typography { color: rgba(0, 0, 0, 0.65); font-size: 14px; }
  .snapshot-meta { display: flex; flex-direction: column; gap: 4px; margin-top: 12px; color: rgba(0, 0, 0, 0.45); font-size: 13px; }
  .toolbar { display: flex; align-items: center; padding: 10px 24px 14px; }
  .team-search { width: 320px; background: #fff; }
  .team-search .ant-input-prefix { color: rgba(0, 0, 0, 0.45); margin-right: 8px; }

  .table-shell { min-height: 378px; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
  .table-shell .ant-table { font-size: 13px; }
  .table-shell .ant-table-thead > tr > th { padding: 8px; text-align: center; font-size: 12px; font-weight: 600; border-bottom-color: #f0f0f0; background: #fafafa; }
  .table-shell .ant-table-thead > tr > th:first-child { text-align: left; }
  .table-shell .ant-table-tbody > tr:not(.ant-table-expanded-row) { height: 50px; }
  .table-shell .ant-table-tbody > tr:not(.ant-table-expanded-row) > td { height: 50px; max-height: 50px; padding: 6px 8px; line-height: 1.2; }
  .table-shell .ant-table-tbody > tr:hover > td { background: #fafafa !important; }
  .table-shell .ant-table-expanded-row > td { padding: 0 !important; background: #fafafa !important; }
  .table-shell .ant-pagination { margin: 12px 20px 12px 0; }
  .group-title { display: inline-flex; align-items: center; justify-content: center; min-width: 100%; }
  .group-start { border-left: 1px solid #f0f0f0 !important; }

  .team-cell { display: flex; align-items: center; min-width: 0; }
  .team-name { overflow: hidden; color: rgba(0, 0, 0, 0.88); font-size: 13px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
  .team-meta { margin-top: 2px; color: rgba(0, 0, 0, 0.45); font-size: 11px; }

  .matrix-logo-cell { display: grid; place-items: center; width: 40px; height: 40px; margin: 0 auto; border-radius: 6px; transition: background .15s ease; }
  .matrix-logo-cell:hover { background: #f0f0f0; }
  .matrix-logo-cell.is-active { background: #e6f4ff; }
  .logo-frame { width: 32px; min-width: 32px; max-width: 32px; height: 32px; min-height: 32px; max-height: 32px; display: grid; place-items: center; overflow: hidden; color: rgba(0, 0, 0, 0.25); font-size: 13px; line-height: 0; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; }
  .logo-frame.has-logo { cursor: zoom-in; }
  .logo-frame.dark-frame { border-color: #434343; background: #262626; }
  .logo-frame.is-missing { border-style: dashed; background: #fafafa; }
  .logo-frame.dark-frame.is-missing { color: rgba(255, 255, 255, 0.45); border-color: #595959; background: #262626; }
  .logo-frame.is-pending { border-color: #faad14; }
  .logo-frame .ant-image { display: block !important; width: 24px !important; height: 24px !important; overflow: hidden; line-height: 0; }
  .logo-frame .ant-image-img { display: block !important; width: 24px !important; height: 24px !important; max-width: 24px !important; max-height: 24px !important; object-fit: contain !important; object-position: center !important; }
  .logo-frame .ant-image-mask { border-radius: 3px; background: rgba(0, 0, 0, .48); }
  .logo-frame .ant-image-mask-info { padding: 0; }
  .logo-preview-eye { color: #fff; font-size: 13px; }

  .group-toggle-column { border-right: 1px solid #f0f0f0 !important; }
  .group-toggle { display: grid; place-items: center; width: 24px; height: 30px; margin: 0 auto; padding: 0; color: rgba(0, 0, 0, 0.45); border: 0; border-radius: 4px; background: transparent; cursor: pointer; }
  .group-toggle:hover, .group-toggle.is-active { color: #1677ff; background: #e6f4ff; }
  .group-toggle .anticon { font-size: 8px; transition: transform .2s ease; }
  .group-toggle.is-active .anticon { transform: rotate(180deg); }

  .inline-editor { padding: 16px 20px 18px; border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8; background: #fafafa; }
  .editor-topline { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 12px; }
  .editor-topline h5 { margin: 2px 0 0 !important; font-size: 14px; }
  .eyebrow { color: rgba(0, 0, 0, 0.45) !important; font-size: 10px; }
  .inline-editor .ant-segmented { font-size: 12px; }
  .compact-upload-row { display: block; }

  .logo-dragger.ant-upload-wrapper .ant-upload-drag { border-radius: 6px; background: #fff; }
  .logo-dragger.ant-upload-wrapper .ant-upload-drag .ant-upload { padding: 18px 12px; }
  .logo-dragger .ant-upload-drag-icon { margin: 0 0 5px !important; }
  .logo-dragger .ant-upload-drag-icon .anticon { font-size: 24px !important; }
  .upload-title { overflow: hidden; max-width: 520px; margin: 0 auto; font-size: 12px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
  .upload-hint { margin: 3px 0 7px; color: rgba(0, 0, 0, 0.45); font-size: 11px; }

  .modal-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; }
  .team-action-column { border-left: 1px solid #f0f0f0 !important; }
  .save-summary { display: flex; gap: 4px; color: rgba(0, 0, 0, 0.45); font-size: 12px; }
  .save-summary b { color: rgba(0, 0, 0, 0.65); }
  .empty-search { padding: 48px 0; color: rgba(0, 0, 0, 0.45); }

  @media (max-width: 760px) {
    .bulk-modal { top: 8px; max-width: calc(100vw - 16px); margin: 0 8px; padding-bottom: 8px; }
    .modal-header, .toolbar, .modal-footer { padding-left: 16px; padding-right: 16px; }
    .team-search { width: 100%; }
    .editor-topline { align-items: flex-start; gap: 10px; }
  }
`;
