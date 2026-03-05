import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { KpiMetric, PullRequest, ServiceStatus, ActivityEvent } from './board.models';

@Injectable({ providedIn: 'root' })
export class BoardService {

  private kpiData: KpiMetric[] = [
    {
      id: 'prs_merged', label: 'PRs Merged', value: 34, unit: '', delta: 12.5,
      trend: 'up', good: 'up', color: '#37c97d',
      sparkline: [40, 55, 48, 62, 58, 71, 34],
    },
    {
      id: 'deploy_freq', label: 'Deploys / Day', value: 8.2, unit: '/day', delta: -4.1,
      trend: 'down', good: 'up', color: '#4da6ff',
      sparkline: [9, 11, 8, 12, 9, 10, 8],
    },
    {
      id: 'lead_time', label: 'Lead Time', value: 2.4, unit: 'hrs', delta: -18.3,
      trend: 'down', good: 'down', color: '#e8a838',
      sparkline: [4.2, 3.8, 3.1, 2.9, 3.4, 2.7, 2.4],
    },
    {
      id: 'open_issues', label: 'Open Issues', value: 17, unit: '', delta: 6.2,
      trend: 'up', good: 'down', color: '#e5393d',
      sparkline: [12, 15, 13, 18, 16, 14, 17],
    },
    {
      id: 'test_coverage', label: 'Test Coverage', value: 84.7, unit: '%', delta: 2.1,
      trend: 'up', good: 'up', color: '#b48eff',
      sparkline: [79, 80, 81, 82, 83, 84, 85],
    },
    {
      id: 'mttr', label: 'MTTR', value: 42, unit: 'min', delta: -22.0,
      trend: 'down', good: 'down', color: '#39d0c8',
      sparkline: [80, 65, 70, 58, 55, 48, 42],
    },
  ];

  private prData: PullRequest[] = [
    {
      id: 1, title: 'feat: micro-frontend shell navigation redesign', author: 'Alex Dev',
      initials: 'AD', repo: 'devpulse-host', status: 'review', comments: 6,
      additions: 312, deletions: 89, age: '2h', labels: ['feature', 'ui'],
    },
    {
      id: 2, title: 'fix: remoteEntry CORS headers on preview server', author: 'Sam Ops',
      initials: 'SO', repo: 'remote-feed', status: 'merged', comments: 3,
      additions: 14, deletions: 4, age: '4h', labels: ['bug', 'urgent'],
    },
    {
      id: 3, title: 'chore: upgrade angular to 17.3 + webpack MF plugin', author: 'Jordan K',
      initials: 'JK', repo: 'remote-board', status: 'open', comments: 1,
      additions: 540, deletions: 421, age: '6h', labels: ['chore', 'deps'],
    },
    {
      id: 4, title: 'feat: BoardApp KPI sparklines with canvas API', author: 'Alex Dev',
      initials: 'AD', repo: 'remote-board', status: 'draft', comments: 0,
      additions: 228, deletions: 15, age: '8h', labels: ['feature', 'wip'],
    },
    {
      id: 5, title: 'refactor: extract useFeed composable from FeedApp', author: 'Taylor M',
      initials: 'TM', repo: 'remote-feed', status: 'merged', comments: 8,
      additions: 180, deletions: 220, age: '1d', labels: ['refactor'],
    },
    {
      id: 6, title: 'test: add E2E tests for module federation loading', author: 'Sam Ops',
      initials: 'SO', repo: 'devpulse-host', status: 'open', comments: 4,
      additions: 390, deletions: 12, age: '1d', labels: ['test'],
    },
    {
      id: 7, title: 'docs: document federation setup and port conventions', author: 'Jordan K',
      initials: 'JK', repo: 'devpulse-host', status: 'open', comments: 2,
      additions: 95, deletions: 8, age: '2d', labels: ['docs'],
    },
  ];

  private serviceData: ServiceStatus[] = [
    {
      id: 'host', name: 'devpulse-host', env: 'production', status: 'operational',
      uptime: 99.97, latency: 42, lastDeploy: '2h ago', version: 'v0.1.4',
    },
    {
      id: 'feed', name: 'remote-feed', env: 'production', status: 'operational',
      uptime: 99.91, latency: 67, lastDeploy: '4h ago', version: 'v0.1.2',
    },
    {
      id: 'board', name: 'remote-board', env: 'production', status: 'degraded',
      uptime: 98.40, latency: 234, lastDeploy: '6h ago', version: 'v0.1.1',
    },
    {
      id: 'api_gw', name: 'api-gateway', env: 'production', status: 'operational',
      uptime: 99.99, latency: 18, lastDeploy: '1d ago', version: 'v2.4.0',
    },
    {
      id: 'auth', name: 'auth-service', env: 'production', status: 'operational',
      uptime: 100, latency: 28, lastDeploy: '3d ago', version: 'v1.8.3',
    },
    {
      id: 'cdn', name: 'cdn-edge', env: 'global', status: 'operational',
      uptime: 99.99, latency: 8, lastDeploy: '7d ago', version: 'v3.1.0',
    },
    {
      id: 'staging_feed', name: 'remote-feed', env: 'staging', status: 'maintenance',
      uptime: 95.20, latency: 110, lastDeploy: '30m ago', version: 'v0.1.3-rc',
    },
  ];

  private activityData: ActivityEvent[] = [
    { id:1, type:'merge',  actor:'Taylor M', initials:'TM', message:'Merged PR #5 — refactor: extract useFeed composable', repo:'remote-feed', time:'12m ago', meta:'main←dev' },
    { id:2, type:'deploy', actor:'CI/CD',    initials:'CI', message:'Deployed remote-feed v0.1.2 to production', repo:'remote-feed', time:'14m ago', meta:'prod' },
    { id:3, type:'alert',  actor:'Monitor',  initials:'MO', message:'Latency spike detected on remote-board (234ms avg)', repo:'remote-board', time:'28m ago', meta:'P2' },
    { id:4, type:'review', actor:'Sam Ops',  initials:'SO', message:'Requested changes on PR #1 — shell navigation', repo:'devpulse-host', time:'45m ago' },
    { id:5, type:'issue',  actor:'Jordan K', initials:'JK', message:'Opened issue: webpack MF shared scope conflict', repo:'remote-board', time:'1h ago', meta:'#42' },
    { id:6, type:'deploy', actor:'CI/CD',    initials:'CI', message:'Deployed devpulse-host v0.1.4 to production', repo:'devpulse-host', time:'2h ago', meta:'prod' },
    { id:7, type:'comment',actor:'Alex Dev', initials:'AD', message:'Left 3 comments on PR #6 — E2E federation tests', repo:'devpulse-host', time:'2h ago' },
    { id:8, type:'merge',  actor:'Alex Dev', initials:'AD', message:'Merged PR #2 — fix: CORS headers on preview server', repo:'remote-feed', time:'4h ago', meta:'main←fix/cors' },
    { id:9, type:'issue',  actor:'Sam Ops',  initials:'SO', message:'Closed issue #38 — CORS error on remote load', repo:'remote-feed', time:'4h ago', meta:'#38' },
    { id:10,type:'deploy', actor:'CI/CD',    initials:'CI', message:'Deployed remote-board v0.1.1 to staging (degraded)', repo:'remote-board', time:'6h ago', meta:'staging' },
  ];

  getKpis(): Observable<KpiMetric[]> {
    return new BehaviorSubject(this.kpiData).asObservable();
  }

  getPullRequests(): Observable<PullRequest[]> {
    return new BehaviorSubject(this.prData).asObservable();
  }

  getServices(): Observable<ServiceStatus[]> {
    return new BehaviorSubject(this.serviceData).asObservable();
  }

  getActivity(): Observable<ActivityEvent[]> {
    return new BehaviorSubject(this.activityData).asObservable();
  }
}
