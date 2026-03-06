import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardService }          from './board.service';
import { AuthService }           from '../shared/auth/auth.service'; // Sesuaikan path jika beda
import { KpiCardsComponent }     from './components/kpi-cards.component';
import { ServiceStatusComponent }from './components/service-status.component';
import { ActivityFeedComponent } from './components/activity-feed.component';
import { IssueListComponent }    from '../issues/components/issue-list.component';
import { IssuePanelComponent }   from '../issues/components/issue-panel.component';
import { DeleteConfirmComponent }from '../issues/components/delete-confirm.component';
import { IssueToastComponent }   from '../issues/components/issue-toast.component';
import { KpiMetric, ServiceStatus, ActivityEvent } from './board.models';
import { IssueStore } from '../issues/components/issue.store';

type BoardTab = 'issues' | 'metrics';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardsComponent, ServiceStatusComponent, ActivityFeedComponent,
    IssueListComponent, IssuePanelComponent, DeleteConfirmComponent, IssueToastComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="board-app">
      <header class="board-header">
        <div class="header-left">
          <div class="remote-badge">
            <span class="badge-dot"></span>
            <span>Angular 21</span><span class="badge-sep">·</span>
            <span>remote_board</span><span class="badge-sep">·</span>
            <span class="badge-port">:4201</span>
          </div>
          <h1 class="page-title">The Board</h1>
          <p class="page-sub">Issue tracker · team metrics · service health</p>
        </div>
        <div class="header-right">

          @if (auth.user(); as user) {
            <div class="user-chip">
              <span class="user-av" [style.background]="avatarBg(user.initials ?? user.avatar)">
                {{ user.initials ?? user.avatar }}
              </span>
              <div class="user-info">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-role" [ngClass]="'role-' + user.role">{{ user.role }}</span>
              </div>
            </div>
          }

          <div class="period-tabs">
            @for (p of periods; track p) {
              <button class="period-tab"
                [class.active]="activePeriod() === p"
                (click)="activePeriod.set(p)">{{ p }}</button>
            }
          </div>
        </div>
      </header>

      <nav class="board-nav">
        <button class="nav-tab" [class.active]="activeTab() === 'issues'" (click)="activeTab.set('issues')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          Issues
          @if (issueStore.stats().open) {
            <span class="nav-badge">{{ issueStore.stats().open }}</span>
          }
        </button>
        <button class="nav-tab" [class.active]="activeTab() === 'metrics'" (click)="activeTab.set('metrics')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 9l2.5-3 2.5 2 2-4 2 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Metrics
        </button>
        <div class="live-chip"><span class="live-dot"></span>Live · updated just now</div>
      </nav>

      <div class="board-body">
        @if (activeTab() === 'issues') {
          <app-issue-list></app-issue-list>
        } @else if (activeTab() === 'metrics') {
          <app-kpi-cards [metrics]="kpis()"></app-kpi-cards>
          <div class="mid-grid">
            <app-service-status [services]="services()"></app-service-status>
            <app-activity-feed  [events]="activity()"></app-activity-feed>
          </div>
        }
      </div>

      <footer class="board-footer">
        <span class="footer-item"><span class="footer-dot" style="background:#dd0031"></span>Angular 21 Zoneless</span><span class="footer-sep">·</span>
        <span class="footer-item">Signals & Computed</span><span class="footer-sep">·</span>
        <span class="footer-item">*appCan role directive</span><span class="footer-sep">·</span>
        <span class="footer-item">Module Federation :4201</span>
      </footer>

      <app-issue-panel></app-issue-panel>
      <app-delete-confirm></app-delete-confirm>
      <app-issue-toast></app-issue-toast>
    </div>
  `,
  // (Biarkan CSS lamamu utuh di sini)
   styles: [`
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    .board-app { min-height:100vh; background:#07090d; font-family:'IBM Plex Mono',monospace; display:flex; flex-direction:column; }
    .board-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; padding:28px 32px 16px; border-bottom:1px solid #1a2538; background:#0b0e14; position:sticky; top:0; z-index:10; }
    .header-left { display:flex; flex-direction:column; gap:4px; }
    .remote-badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; color:#3d5166; letter-spacing:0.04em; margin-bottom:4px; }
    .badge-dot { width:6px; height:6px; border-radius:50%; background:#e5393d; box-shadow:0 0 6px rgba(229,57,61,0.6); }
    .badge-sep { color:#243040; } .badge-port { color:#e5393d; }
    .page-title { font-family:'Epilogue',sans-serif; font-size:26px; font-weight:800; color:#dce8f5; letter-spacing:-0.02em; line-height:1; }
    .page-sub { font-size:11px; color:#3d5166; margin-top:2px; }
    .header-right { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .user-chip { display:flex; align-items:center; gap:8px; padding:6px 12px 6px 6px; background:#0f1420; border:1px solid #1a2538; border-radius:20px; }
    .user-av { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:600; }
    .user-info { display:flex; flex-direction:column; }
    .user-name { font-size:11px; color:#dce8f5; line-height:1.2; }
    .user-role { font-size:9px; text-transform:uppercase; letter-spacing:0.06em; }
    .role-admin { color:#e5393d; } .role-developer { color:#4da6ff; } .role-viewer { color:#3d5166; }
    .period-tabs { display:flex; gap:3px; }
    .period-tab { padding:4px 10px; background:transparent; border:1px solid #1a2538; border-radius:4px; color:#3d5166; font-family:'IBM Plex Mono',monospace; font-size:10px; cursor:pointer; transition:all 0.15s; }
    .period-tab:hover { background:#141b28; border-color:#1f2e42; color:#7e8fa3; }
    .period-tab.active { background:#141b28; border-color:#283d56; color:#dce8f5; }
    .board-nav { display:flex; align-items:center; gap:4px; padding:0 32px; background:#0b0e14; border-bottom:1px solid #1a2538; }
    .nav-tab { display:flex; align-items:center; gap:6px; padding:10px 14px; background:transparent; border:none; border-bottom:2px solid transparent; color:#3d5166; font-family:'IBM Plex Mono',monospace; font-size:12px; cursor:pointer; transition:all 0.15s; margin-bottom:-1px; }
    .nav-tab:hover { color:#7e8fa3; }
    .nav-tab.active { color:#dce8f5; border-bottom-color:#e5393d; }
    .nav-badge { background:#e5393d; color:#fff; font-size:9px; padding:1px 5px; border-radius:8px; font-weight:600; }
    .live-chip { display:flex; align-items:center; gap:6px; margin-left:auto; font-size:10px; color:#3d5166; }
    .live-dot { width:6px; height:6px; border-radius:50%; background:#37c97d; box-shadow:0 0 5px #37c97d; animation:pulse 2s ease-in-out infinite; }
    .board-body { flex:1; padding:24px 32px 40px; display:flex; flex-direction:column; gap:28px; }
    .mid-grid { display:grid; grid-template-columns:1.4fr 1fr; gap:20px; align-items:start; }
    .board-footer { display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:12px 32px; border-top:1px solid #0f1420; }
    .footer-item { display:flex; align-items:center; gap:5px; font-size:10px; color:#243040; }
    .footer-dot  { width:5px; height:5px; border-radius:50%; }
    .footer-sep  { color:#1a2538; font-size:10px; }
  `],
})
export class BoardComponent {
  // Dependency Injection Modern
  private boardService = inject(BoardService);
  readonly auth       = inject(AuthService);
  readonly issueStore = inject(IssueStore);

  // Local State
  activeTab    = signal<BoardTab>('issues');
  activePeriod = signal('7d');
  periods      = ['1d', '7d', '30d', '90d'];

  // API Data State
  kpis     = signal<KpiMetric[]>([]);
  services = signal<ServiceStatus[]>([]);
  activity = signal<ActivityEvent[]>([]);

  constructor() {
    // Karena kita tidak mengubah board.service.ts, kita tetap bisa men-subscribe-nya
    // lalu memasukkan nilainya ke dalam Signal
    this.boardService.getKpis().subscribe(d    => this.kpis.set(d));
    this.boardService.getServices().subscribe(d => this.services.set(d));
    this.boardService.getActivity().subscribe(d => this.activity.set(d));
  }

  avatarBg(i: string): string {
    if (!i) return 'rgba(61,81,102,0.2)';
    const c = ['rgba(55,201,125,0.2)','rgba(77,166,255,0.2)','rgba(180,142,255,0.2)','rgba(232,168,56,0.2)','rgba(57,208,200,0.2)'];
    return c[(i.charCodeAt(0) + (i.charCodeAt(1) || 0)) % c.length];
  }
}
