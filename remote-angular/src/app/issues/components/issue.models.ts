// ─── Issue domain models ───────────────────────────────────────────────────

export type IssuePriority = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus   = 'open' | 'in_progress' | 'review' | 'resolved' | 'closed';
export type IssueLabel    = 'bug' | 'enhancement' | 'performance' | 'security' | 'docs' | 'refactor' | 'ux' | 'infra';

export interface Issue {
  id:          string;
  number:      number;
  title:       string;
  description: string;
  priority:    IssuePriority;
  status:      IssueStatus;
  labels:      IssueLabel[];
  assignee:    string;       // initials e.g. 'AD'
  assigneeName: string;
  repo:        string;
  createdAt:   string;       // relative e.g. '2h ago'
  updatedAt:   string;
  comments:    number;
  linkedPr?:   number;       // PR number if any
}

// ─── Form model (used for create & edit) ─────────────────────────────────

export interface IssueForm {
  title:       string;
  description: string;
  priority:    IssuePriority;
  status:      IssueStatus;
  labels:      IssueLabel[];
  assignee:    string;
  assigneeName: string;
  repo:        string;
}

// ─── Filter / sort state ─────────────────────────────────────────────────

export type SortField = 'number' | 'title' | 'priority' | 'status' | 'assignee' | 'updatedAt';
export type SortDir   = 'asc' | 'desc';

export interface IssueFilters {
  search:   string;
  status:   IssueStatus | 'all';
  priority: IssuePriority | 'all';
  repo:     string | 'all';
  assignee: string | 'all';
}

// ─── Constants ────────────────────────────────────────────────────────────

export const PRIORITY_ORDER: Record<IssuePriority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

export const PRIORITY_META: Record<IssuePriority, { label: string; color: string; icon: string }> = {
  critical: { label: 'Critical', color: '#e5393d', icon: '▲▲' },
  high:     { label: 'High',     color: '#ff8a4c', icon: '▲'  },
  medium:   { label: 'Medium',   color: '#e8a838', icon: '◆'  },
  low:      { label: 'Low',      color: '#4da6ff', icon: '▼'  },
};

export const STATUS_META: Record<IssueStatus, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: '#37c97d', bg: 'rgba(55,201,125,0.1)'  },
  in_progress: { label: 'In Progress', color: '#e8a838', bg: 'rgba(232,168,56,0.1)' },
  review:      { label: 'In Review',   color: '#b48eff', bg: 'rgba(180,142,255,0.1)' },
  resolved:    { label: 'Resolved',    color: '#4da6ff', bg: 'rgba(77,166,255,0.1)'  },
  closed:      { label: 'Closed',      color: '#3d5166', bg: 'rgba(61,81,102,0.15)' },
};

export const LABEL_META: Record<IssueLabel, { color: string }> = {
  bug:         { color: '#e5393d' },
  enhancement: { color: '#39d0c8' },
  performance: { color: '#e8a838' },
  security:    { color: '#ff8a4c' },
  docs:        { color: '#4da6ff' },
  refactor:    { color: '#b48eff' },
  ux:          { color: '#37c97d' },
  infra:       { color: '#8b98a8' },
};

export const ALL_LABELS: IssueLabel[] = [
  'bug','enhancement','performance','security','docs','refactor','ux','infra'
];

export const ALL_REPOS = [
  'devpulse-host', 'remote-feed', 'remote-board', 'api-gateway', 'auth-service',
];

export const ALL_ASSIGNEES = [
  { initials: 'AD', name: 'Alex Admin' },
  { initials: 'JD', name: 'Jordan Dev' },
  { initials: 'SV', name: 'Sam Viewer' },
  { initials: 'TM', name: 'Taylor M'   },
  { initials: 'SO', name: 'Sam Ops'    },
];

export const EMPTY_FORM: IssueForm = {
  title: '', description: '', priority: 'medium', status: 'open',
  labels: [], assignee: 'AD', assigneeName: 'Alex Admin', repo: 'devpulse-host',
};
