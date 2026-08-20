const leagueLogo = (code, background) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="18" fill="${background}"/><text x="48" y="57" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#fff">${code}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const mockLeagues = [
  {
    sn_league_id: '1',
    league_name: 'National Hockey League',
    league_display_name: 'National Hockey League',
    league_short_name: 'NHL',
    league_be_code: 'NHL',
    league_logo: leagueLogo('NHL', '#111827'),
    sport_type: 'Hockey',
    active: true,
    alert_config: {
      GameStartFailure: { bypass: false },
      GameStalled: { bypass: false },
    },
  },
  {
    sn_league_id: '2',
    league_name: 'National Basketball Association',
    league_display_name: 'National Basketball Association',
    league_short_name: 'NBA',
    league_be_code: 'NBA',
    league_logo: leagueLogo('NBA', '#c2410c'),
    sport_type: 'Basketball',
    active: true,
    alert_config: {
      GameStartFailure: { bypass: true },
      GameStalled: { bypass: false },
    },
  },
  {
    sn_league_id: '3',
    league_name: 'Major League Baseball',
    league_display_name: 'Major League Baseball',
    league_short_name: 'MLB',
    league_be_code: 'MLB',
    league_logo: leagueLogo('MLB', '#1d4ed8'),
    sport_type: 'Baseball',
    active: true,
    alert_config: {
      GameStartFailure: { bypass: false },
      GameStalled: { bypass: true },
    },
  },
  {
    sn_league_id: '4',
    league_name: 'National Football League',
    league_display_name: 'National Football League',
    league_short_name: 'NFL',
    league_be_code: 'NFL',
    league_logo: leagueLogo('NFL', '#b91c1c'),
    sport_type: 'Football',
    active: true,
    alert_config: '{"GameStartFailure":{"bypass":false},"GameStalled":{"bypass":false}}',
  },
  {
    sn_league_id: '5',
    league_name: 'Major League Soccer',
    league_display_name: 'Major League Soccer',
    league_short_name: 'MLS',
    league_be_code: 'MLS',
    league_logo: leagueLogo('MLS', '#1f2937'),
    sport_type: 'Soccer',
    active: true,
    alert_config: {
      GameStartFailure: { bypass: true },
      GameStalled: { bypass: true },
    },
  },
  {
    sn_league_id: '6',
    league_name: "Canadian Women's Hockey League",
    league_display_name: "Canadian Women's Hockey League",
    league_short_name: 'CWHL',
    league_be_code: 'CWHL',
    league_logo: leagueLogo('CW', '#7c3aed'),
    sport_type: 'Hockey',
    active: false,
    alert_config: null,
  },
  {
    sn_league_id: '7',
    league_name: "Women's National Basketball Association",
    league_display_name: "Women's National Basketball Association",
    league_short_name: 'WNBA',
    league_be_code: 'WNBA',
    league_logo: leagueLogo('WN', '#ea580c'),
    sport_type: 'Basketball',
    active: true,
  },
];

export const mockAlerts = [
  {
    id: 1042,
    type: 'GameStartFailure',
    league: 'NHL',
    event: 'Toronto Maple Leafs vs. Montreal Canadiens',
    createdAt: 'Today, 10:42 AM',
    status: 'Open',
  },
  {
    id: 1041,
    type: 'GameStalled',
    league: 'NBA',
    event: 'Toronto Raptors vs. Boston Celtics',
    createdAt: 'Today, 9:18 AM',
    status: 'Investigating',
  },
  {
    id: 1038,
    type: 'GameStartFailure',
    league: 'MLB',
    event: 'Toronto Blue Jays vs. New York Yankees',
    createdAt: 'Yesterday, 8:05 PM',
    status: 'Resolved',
  },
];
