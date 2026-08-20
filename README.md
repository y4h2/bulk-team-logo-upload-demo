# Bulk Team Logo Upload — Next.js 14 Demo

A runnable Next.js `14.2.25` + React + Ant Design `5.24.9` demo for managing team logo variants in a modal. It uses the App Router, plain JavaScript, and is compatible with a Webpack `5.70.0` host project.

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

## Demo behavior

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
  App.jsx         # Interactive client component
  BulkTeamLogoUploadModal.module.css # Locally scoped modal styles
  mockTeams.js    # Mock API-shaped team data
```

The modal imports a locally scoped CSS Module and does not require a global CSS import or App Router layout integration. Ant Design internals are targeted with scoped `:global(...)` selectors.

> Next.js 14.2.25 is intentionally pinned for this demo. npm currently reports known security issues for this old release, so upgrade to a patched Next.js version before deploying publicly.
