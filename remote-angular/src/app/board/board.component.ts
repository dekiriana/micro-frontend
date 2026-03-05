import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from './board.service';
import { KpiMetric, PullRequest, ServiceStatus, ActivityEvent } from './board.models';
import { ActivityFeedComponent } from '../components/activity-feed.component';
import { KpiCardsComponent } from '../components/kpi-cards.component';
import { ServiceStatusComponent } from '../components/service-status.component';
import { TeamTableComponent } from '../components/team-table.component';


@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardsComponent,
    TeamTableComponent,
    ServiceStatusComponent,
    ActivityFeedComponent,
  ],
  template: `
    <div class="board-app">

      <!-- Board Header -->
      <header class="board-header">
        <div class="header-left">
          <div class="remote-badge">
            <span class="badge-dot"></span>
            <span>Angular 17</span>
            <span class="badge-sep">·</span>
            <span>remote_board</span>
            <span class="badge-sep">·</span>
            <span class="badge-port">:4201</span>
          </div>
          <h1 class="page-title">The Board</h1>
          <p class="page-sub">Team metrics · sprint analytics · service health</p>
        </div>
        <div class="header-right">
          <div class="refresh-info">
            <span class="refresh-dot"></span>
            <span>Live · updated {{ lastUpdated }}</span>
          </div>
          <div class="period-tabs">
            <button
              *ngFor="let p of periods"
              [class.active]="activePeriod === p"
              class="period-tab"
              (click)="activePeriod = p"
            >{{ p }}</button>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <div class="board-body">

        <!-- KPI row -->
        <app-kpi-cards [metrics]="kpis"></app-kpi-cards>

        <!-- Middle: Service Health + Activity -->
        <div class="mid-grid">
          <div class="mid-left">
            <app-service-status [services]="services"></app-service-status>
          </div>
          <div class="mid-right">
            <app-activity-feed [events]="activity"></app-activity-feed>
          </div>
        </div>

        <!-- PR Table (full width) -->
        <app-team-table [prs]="pullRequests"></app-team-table>

        <!-- Board footer -->
        <footer class="board-footer">
          <span class="footer-item">
            <span class="footer-dot" style="background:#e5393d"></span>
            Angular 17 Standalone Components
          </span>
          <span class="footer-sep">·</span>
          <span class="footer-item">Module Federation via @angular-architects/module-federation</span>
          <span class="footer-sep">·</span>
          <span class="footer-item">RxJS {{ rxjsNote }}</span>
        </footer>

      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .board-app {
      width: 100%;
      height: 100%;
      background: var(--bg-void);
      font-family: 'IBM Plex Mono', monospace;
      display: flex;
      flex-direction: column;
    }


    .board-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      padding: 32px 32px 20px;
      border-bottom: 1px solid var(--border-subtle, #1a2538);
      background: var(--bg-void);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header-left { display: flex; flex-direction: column; gap: 4px; }

    .remote-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      color: #3d5166;
      letter-spacing: 0.04em;
      margin-bottom: 4px;
    }
    .badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #e5393d;
      box-shadow: 0 0 6px rgba(229,57,61,0.6);
    }
    .badge-sep  { color: #243040; }
    .badge-port { color: #e5393d; }

    .page-title {
      font-family: 'Epilogue', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary, #dce8f5);
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .page-sub {
      font-size: 11px;
      color: var(--text-muted, #3d5166);
      margin-top: 2px;
    }

    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }

    .refresh-info {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      color: #3d5166;
    }
    .refresh-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #37c97d;
      box-shadow: 0 0 5px #37c97d;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }

    .period-tabs { display: flex; gap: 3px; }
    .period-tab {
      padding: 4px 10px;
      background: transparent;
      border: 1px solid #1a2538;
      border-radius: 4px;
      color: #3d5166;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .period-tab:hover { background: #141b28; border-color: #1f2e42; color: #7e8fa3; }
    .period-tab.active { background: #141b28; border-color: #283d56; color: #dce8f5; }


    .board-body {
      flex: 1;
      padding: 24px 32px 40px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }


    .mid-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .mid-grid { grid-template-columns: 1fr; }
    }


    .board-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      padding-top: 8px;
      border-top: 1px solid #0f1420;
    }
    .footer-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      color: #243040;
    }
    .footer-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
    }
    .footer-sep { color: #1a2538; font-size: 10px; }
  `]
})
export class BoardComponent implements OnInit {
  kpis: KpiMetric[] = [];
  pullRequests: PullRequest[] = [];
  services: ServiceStatus[] = [];
  activity: ActivityEvent[] = [];

  activePeriod = '7d';
  periods = ['1d', '7d', '30d', '90d'];
  lastUpdated = 'just now';

  constructor(private boardService: BoardService) { }

  ngOnInit(): void {
    this.boardService.getKpis().subscribe(d => this.kpis = d);
    this.boardService.getPullRequests().subscribe(d => this.pullRequests = d);
    this.boardService.getServices().subscribe(d => this.services = d);
    this.boardService.getActivity().subscribe(d => this.activity = d);
  }

  get rxjsNote(): string { return '~7.8 · BehaviorSubject'; }
}
