const svgLogo = (letters, background, foreground = '#ffffff') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="${background}"/><circle cx="80" cy="80" r="65" fill="none" stroke="${foreground}" stroke-width="5" opacity=".72"/><text x="80" y="96" text-anchor="middle" font-family="Arial,sans-serif" font-size="48" font-weight="800" fill="${foreground}">${letters}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const logoSet = (letters, color) => {
  const url = svgLogo(letters, color);
  return { small: url, medium: url, large: url, xlarge: url };
};

const legacySet = (letters, color, hasXlarge = false) => {
  const url = svgLogo(letters, color);
  return { small: url, medium: url, large: url, large_7_1: hasXlarge ? url : '' };
};

const baseMockTeams = [
  {
    id: 1,
    team_name: 'Los Angeles Angels',
    tri_code: 'LAA',
    league: 'American League',
    logos: legacySet('LAA', '#b32025', true),
    logo_variants: {
      light_mode: logoSet('LAA', '#c9252c'),
      dark_mode: logoSet('LAA', '#761014'),
    },
  },
  {
    id: 2,
    team_name: 'Toronto Blue Jays',
    tri_code: 'TOR',
    league: 'American League',
    logos: legacySet('TOR', '#164b87'),
    logo_variants: {
      light_mode: logoSet('TOR', '#1765a6'),
      dark_mode: logoSet('TOR', '#0a2f5e'),
    },
  },
  {
    id: 3,
    team_name: 'New York Mets',
    tri_code: 'NYM',
    league: 'National League',
    logos: legacySet('NYM', '#f26b28'),
    logo_variants: {
      light_mode: logoSet('NYM', '#f26b28'),
      dark_mode: {},
    },
  },
  {
    id: 4,
    team_name: 'Seattle Mariners',
    tri_code: 'SEA',
    league: 'American League',
    logos: legacySet('SEA', '#0d5c63'),
    logo_variants: {
      light_mode: {},
      dark_mode: logoSet('SEA', '#063b42'),
    },
  },
  {
    id: 5,
    team_name: 'Chicago Cubs',
    tri_code: 'CHC',
    league: 'National League',
    logos: legacySet('CHC', '#1d4d90'),
    logo_variants: { light_mode: {}, dark_mode: {} },
  },
  {
    id: 6,
    team_name: 'San Francisco Giants',
    tri_code: 'SFG',
    league: 'National League',
    logos: legacySet('SFG', '#252525', true),
    logo_variants: {
      light_mode: logoSet('SFG', '#e76024'),
      dark_mode: logoSet('SFG', '#222222'),
    },
  },
];

const extraTeamSpecs = [
  ['Arizona Diamondbacks', 'ARI', 'National League', '#a71930'],
  ['Atlanta Braves', 'ATL', 'National League', '#ce1141'],
  ['Baltimore Orioles', 'BAL', 'American League', '#df4601'],
  ['Boston Red Sox', 'BOS', 'American League', '#bd3039'],
  ['Chicago White Sox', 'CWS', 'American League', '#27251f'],
  ['Cincinnati Reds', 'CIN', 'National League', '#c6011f'],
  ['Cleveland Guardians', 'CLE', 'American League', '#e31937'],
  ['Colorado Rockies', 'COL', 'National League', '#333366'],
  ['Detroit Tigers', 'DET', 'American League', '#0c2340'],
  ['Houston Astros', 'HOU', 'American League', '#002d62'],
  ['Kansas City Royals', 'KCR', 'American League', '#004687'],
  ['Los Angeles Dodgers', 'LAD', 'National League', '#005a9c'],
  ['Miami Marlins', 'MIA', 'National League', '#00a3e0'],
  ['Milwaukee Brewers', 'MIL', 'National League', '#12284b'],
  ['Minnesota Twins', 'MIN', 'American League', '#002b5c'],
  ['New York Yankees', 'NYY', 'American League', '#132448'],
  ['Oakland Athletics', 'OAK', 'American League', '#003831'],
  ['Philadelphia Phillies', 'PHI', 'National League', '#e81828'],
  ['Pittsburgh Pirates', 'PIT', 'National League', '#27251f'],
  ['San Diego Padres', 'SDP', 'National League', '#2f241d'],
  ['St. Louis Cardinals', 'STL', 'National League', '#c41e3a'],
  ['Tampa Bay Rays', 'TBR', 'American League', '#092c5c'],
  ['Texas Rangers', 'TEX', 'American League', '#003278'],
  ['Washington Nationals', 'WSH', 'National League', '#ab0003'],
];

export const mockTeams = [
  ...baseMockTeams,
  ...extraTeamSpecs.map(([team_name, tri_code, league, color], index) => ({
    id: index + 7,
    team_name,
    tri_code,
    league,
    logos: legacySet(tri_code, color, index % 3 !== 0),
    logo_variants: {
      light_mode: index % 4 === 0 ? {} : logoSet(tri_code, color),
      dark_mode: index % 5 === 0 ? {} : logoSet(tri_code, '#17221f'),
    },
  })),
];

export const typeConfig = {
  legacy: {
    label: 'Legacy',
    path: 'logos',
    sizes: [
      { label: 'XL', key: 'large_7_1' },
      { label: 'L', key: 'large' },
      { label: 'M', key: 'medium' },
      { label: 'S', key: 'small' },
    ],
  },
  light: {
    label: 'Light',
    path: 'logo_variants.light_mode',
    sizes: [
      { label: 'XL', key: 'xlarge' },
      { label: 'L', key: 'large' },
      { label: 'M', key: 'medium' },
      { label: 'S', key: 'small' },
    ],
  },
  dark: {
    label: 'Dark',
    path: 'logo_variants.dark_mode',
    sizes: [
      { label: 'XL', key: 'xlarge' },
      { label: 'L', key: 'large' },
      { label: 'M', key: 'medium' },
      { label: 'S', key: 'small' },
    ],
  },
};
