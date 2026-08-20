# Alerts Configuration + Bulk Team Logo Upload — Next.js 14 Demo

A runnable Next.js `14.2.25` + React + Ant Design `5.24.9` demo. The landing page demonstrates alert monitoring and league-level bypass configuration. The original Bulk Team Logo Upload implementation remains in `src/App.jsx` as the visual and component-pattern reference.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To verify a production build:

```bash
npm run build
npm start
```

## Alerts demo behavior

- Page-level **Alerts** and **Configuration** tabs.
- Existing-style alert search, status filter, and table in the Alerts tab.
- League name/code search and dynamic `sport_type` filtering.
- Extensible league × alert-type matrix using Ant Design switches.
- Switch ON explicitly means that alert generation is bypassed.
- Dirty league count, reset, and save controls.
- `null`, missing, object, array, and JSON-string `alert_config` values are normalized once at the component boundary.
- League fixtures follow the real `sn_league_id`, `league_display_name`, `league_short_name`, `league_be_code`, and `active` field names.
- Save computes only changed leagues. Because this demo has no update API, it logs the intended payload at a scoped TODO instead of inventing an endpoint.

## Bulk logo demo behavior

- Search by team name or three-letter team code.
- Click any Legacy, Light, or Dark logo cell to open that team's inline editor.
- Switch between logo types without leaving the expanded row.
- Upload exactly one PNG source per team/type combination.
- Non-PNG files are rejected with an error message.
- Every Legacy, Light, and Dark cell shows separate XL/L/M/S upload slots.
- The UI represents backend resizing into the required XL/L/M/S outputs; Legacy XL maps to `logos.large_7_1`.
- Dropping a PNG immediately calls `resizeAndUpload` for that team and logo type.
- Returned S3 URLs are written into the frontend team draft and displayed in the XL/L/M/S cells.
- The team's **Save** button only persists the already-updated team object to the backend.

## Data shape

Mock data follows the API structure discussed for the real implementation:

```js
{
  logos: {
    small: '...',
    medium: '...',
    large: '...',
    large_7_1: ''
  },
  logo_variants: {
    light_mode: { small: '...', medium: '...', large: '...', xlarge: '...' },
    dark_mode: { small: '...', medium: '...', large: '...', xlarge: '...' }
  }
}
```

The demo simulates saving and resizing in the browser; it does not call a real upload API.

## Use the modal in an existing page

```jsx
'use client';

import { useState } from 'react';
import { BulkTeamLogoUploadModal } from './src/App';

export default function TeamLogosPage({ teams }) {
  const [open, setOpen] = useState(false);

  const resizeAndUpload = async ({ file, mode, triCode }) => {
    // Upload the PNG and return the generated S3 URLs.
    return {
      small: 'https://s3.example.com/logo-small.png',
      medium: 'https://s3.example.com/logo-medium.png',
      large: 'https://s3.example.com/logo-large.png',
      xlarge: 'https://s3.example.com/logo-xlarge.png',
    };
  };

  const saveTeamLogos = async (team, artifacts) => {
    // resizeAndUpload already ran when each PNG was dropped.
    // artifacts: [{ teamId, type, file, urls, result }]
    await updateTeam(team.id, {
      logos: team.logos,
      logo_variants: team.logo_variants,
    });
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>Upload logos</button>
      <BulkTeamLogoUploadModal
        open={open}
        onClose={() => setOpen(false)}
        teams={teams}
        resizeAndUpload={resizeAndUpload}
        onSave={saveTeamLogos}
      />
    </>
  );
}
```

`mode` is mapped automatically to `legacy`, `light_mode`, or `dark_mode`. The URL result can be returned directly or under a `urls`/`logos` property. For Legacy, an `xlarge` result is mapped to the existing `logos.large_7_1` field. If the upload fails, the team draft is not changed and the user can drop the PNG again.

## Project structure

```text
app/
  layout.js       # Demo root layout and metadata
  page.js         # Server-rendered route entry
  providers.js    # Ant Design client providers and SSR style registry
src/
  AlertConfiguration.jsx # Reusable league alert-bypass editor
  AlertsPage.jsx  # Alerts page tabs and demo alert table
  alerts.module.css # Minimal responsive page/control sizing
  App.jsx         # Original bulk logo uploader component
  modalStyles.js  # Bulk uploader CSS string
  mockAlerts.js   # API-shaped alert and league fixtures
  mockTeams.js    # Mock API-shaped team data
```

The modal injects its own `<style>` element and does not require a global CSS import or App Router layout integration.

> Next.js 14.2.25 is intentionally pinned for this demo. npm currently reports known security issues for this old release, so upgrade to a patched Next.js version before deploying publicly.
