export const kvKeys = {
  totalPageViews: 'total_page_views',
  weeklyVisitors: 'weekly_visitors',
  onlineVisitors: 'online_visitors',
  postOnlineVisitors: (id: string) => `online_visitors:post:${id}`,
  dailyVisitors: (day: string) => `visitors:day:${day}`,
  dailyVisitorsSince: 'visitors:daily_since',
  trendingDay: (day: string) => `trending:day:${day}`,
  trendingSeen: (day: string, target: string) =>
    `trending:seen:${day}:${target}`,
  lastVisitor: 'last_visitor',
  currentVisitor: 'current_visitor',
  visitorGeoCounts: 'visitors:geo:counts',
  visitorGeoMeta: 'visitors:geo:meta',
  visitorGeoSeen: (day: string) => `visitors:geo:seen:${day}`,
  visitorGeoIpCache: (ipHash: string) => `geo:ip:${ipHash}`,
  postViews: (id: string) => `post:views:${id}`,
  postReactions: (id: string) => `post:reactions:${id}`,
} as const
