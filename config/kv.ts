export const kvKeys = {
  totalPageViews: 'total_page_views',
  weeklyVisitors: 'weekly_visitors',
  dailyVisitors: (day: string) => `visitors:day:${day}`,
  dailyVisitorsSince: 'visitors:daily_since',
  trendingDay: (day: string) => `trending:day:${day}`,
  trendingSeen: (day: string, target: string) =>
    `trending:seen:${day}:${target}`,
  lastVisitor: 'last_visitor',
  currentVisitor: 'current_visitor',
  postViews: (id: string) => `post:views:${id}`,
  postReactions: (id: string) => `post:reactions:${id}`,
} as const
