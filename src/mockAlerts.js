export const mockLeagues = [
  {
    id: 1,
    code: 'NHL',
    name: 'National Hockey League',
    active: true,
    alert_config: {
      GameStartFailure: { bypass: false },
      GameStalled: { bypass: false },
    },
  },
  {
    id: 2,
    code: 'NBA',
    name: 'National Basketball Association',
    active: true,
    alert_config: {
      GameStartFailure: { bypass: true },
      GameStalled: { bypass: false },
    },
  },
  {
    id: 3,
    code: 'MLB',
    name: 'Major League Baseball',
    active: true,
    alert_config: {
      GameStartFailure: { bypass: false },
      GameStalled: { bypass: true },
    },
  },
  {
    id: 4,
    code: 'NFL',
    name: 'National Football League',
    active: true,
    alert_config: '{"GameStartFailure":{"bypass":false},"GameStalled":{"bypass":false}}',
  },
  {
    id: 5,
    code: 'MLS',
    name: 'Major League Soccer',
    active: true,
    alert_config: {
      GameStartFailure: { bypass: true },
      GameStalled: { bypass: true },
    },
  },
  {
    id: 6,
    code: 'CWHL',
    name: "Canadian Women's Hockey League",
    active: false,
    alert_config: null,
  },
  {
    id: 7,
    code: 'WNBA',
    name: "Women's National Basketball Association",
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
