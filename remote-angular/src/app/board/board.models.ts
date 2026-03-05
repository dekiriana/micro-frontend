export interface KpiMetric {
  id:       string;
  label:    string;
  value:    number;
  unit:     string;
  delta:    number;     // % change from last period
  trend:    'up' | 'down' | 'flat';
  good:     'up' | 'down'; // which direction is "good"
  sparkline: number[];  // last 7 data points (normalized 0–100)
  color:    string;
}

export interface PullRequest {
  id:       number;
  title:    string;
  author:   string;
  initials: string;
  repo:     string;
  status:   'open' | 'merged' | 'draft' | 'review';
  comments: number;
  additions: number;
  deletions: number;
  age:      string;
  labels:   string[];
}

export interface ServiceStatus {
  id:       string;
  name:     string;
  env:      string;
  status:   'operational' | 'degraded' | 'outage' | 'maintenance';
  uptime:   number; // %
  latency:  number; // ms
  lastDeploy: string;
  version:  string;
}

export interface ActivityEvent {
  id:      number;
  type:    'deploy' | 'merge' | 'issue' | 'alert' | 'review' | 'comment';
  actor:   string;
  initials: string;
  message: string;
  repo:    string;
  time:    string;
  meta?:   string;
}

export type SortField = 'title' | 'author' | 'repo' | 'status' | 'age';
export type SortDir   = 'asc' | 'desc';
