import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../shared/auth/auth.service';
import { CanDirective } from '../../shared/auth/can.directive';
import { PRIORITY_META, STATUS_META, LABEL_META, ALL_REPOS, SortField } from './issue.models';
import { IssueStore } from './issue.store';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CanDirective],
  changeDetection: ChangeDetectionStrategy.OnPush, // Sangat cepat berkat zoneless signal!
  template: `
    <section class="issue-list">
      <div class="list-header">
        <div class="header-left">
          <span class="section-label">// ISSUE_TRACKER</span>
          <div class="stats-pills">
            @if (store.stats().open) { <span class="stat-pill open">{{ store.stats().open }} open</span> }
            @if (store.stats().inProgress) { <span class="stat-pill ip">{{ store.stats().inProgress }} in progress</span> }
            @if (store.stats().critical) { <span class="stat-pill crit">{{ store.stats().critical }} critical</span> }
          </div>
        </div>
        <button class="create-btn" *appCan="'admin'" (click)="store.openCreate()">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          New Issue
        </button>
      </div>

      <div class="filters-bar">
        <div class="search-wrap" [class.focused]="searchFocused()">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" class="search-ico">
            <circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" stroke-width="1.2"/>
            <path d="M7.5 7.5L10 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <input class="search-input" type="text" placeholder="Search issues, #number..."
            [ngModel]="searchQuery()"
            (ngModelChange)="updateSearch($event)"
            (focus)="searchFocused.set(true)" (blur)="searchFocused.set(false)"
          />
          @if (searchQuery()) {
            <button class="search-clear" (click)="updateSearch('')">✕</button>
          }
        </div>

        <select class="filter-select" [ngModel]="store.filters().status" (ngModelChange)="store.setFilter({ status: $event })">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="review">In Review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select class="filter-select" [ngModel]="store.filters().priority" (ngModelChange)="store.setFilter({ priority: $event })">
          <option value="all">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select class="filter-select" [ngModel]="store.filters().repo" (ngModelChange)="store.setFilter({ repo: $event })">
          <option value="all">All Repos</option>
          @for (r of repos; track r) {
            <option [value]="r">{{ r }}</option>
          }
        </select>

        @if (hasActiveFilters()) {
          <button class="clear-btn" (click)="clearFilters()">Clear filters</button>
        }

        <span class="result-count">{{ store.filtered().length }} issues</span>
      </div>

      <div class="table-wrap">
        <table class="issue-table">
          <thead>
            <tr>
              <th class="col-priority sortable" (click)="store.setSort('priority')">Pri {{ getSortIcon('priority') }}</th>
              <th class="col-num sortable" (click)="store.setSort('number')"># {{ getSortIcon('number') }}</th>
              <th class="col-title sortable" (click)="store.setSort('title')">Title {{ getSortIcon('title') }}</th>
              <th class="col-status sortable" (click)="store.setSort('status')">Status {{ getSortIcon('status') }}</th>
              <th class="col-repo">Repo</th>
              <th class="col-assignee sortable" (click)="store.setSort('assignee')">Who {{ getSortIcon('assignee') }}</th>
              <th class="col-meta">Meta</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (issue of store.filtered(); track issue.id) {
              <tr class="issue-row"
                  [class.row-closed]="issue.status === 'closed' || issue.status === 'resolved'"
                  [class.row-critical]="issue.priority === 'critical'"
                  (click)="store.openEdit(issue)">

                <td class="col-priority">
                  <span class="priority-icon" [style.color]="priorityMeta[issue.priority].color" [title]="priorityMeta[issue.priority].label">
                    {{ priorityMeta[issue.priority].icon }}
                  </span>
                </td>
                <td class="col-num"><span class="issue-num">#{{ issue.number }}</span></td>
                <td class="col-title">
                  <div class="title-cell">
                    <span class="issue-title">{{ issue.title }}</span>
                    @if (issue.labels.length > 0) {
                      <div class="label-row">
                        @for (lbl of issue.labels; track lbl) {
                          <span class="label-chip"
                            [style.color]="labelMeta[lbl].color"
                            [style.border-color]="labelMeta[lbl].color + '44'"
                            [style.background]="labelMeta[lbl].color + '11'">
                            {{ lbl }}
                          </span>
                        }
                      </div>
                    }
                  </div>
                </td>
                <td class="col-status">
                  <span class="status-badge" [style.color]="statusMeta[issue.status].color" [style.background]="statusMeta[issue.status].bg">
                    {{ statusMeta[issue.status].label }}
                  </span>
                </td>
                <td class="col-repo"><span class="repo-chip">{{ issue.repo }}</span></td>
                <td class="col-assignee">
                  <span class="assignee-av" [style.background]="avatarBg(issue.assignee)" [title]="issue.assigneeName">
                    {{ issue.assignee }}
                  </span>
                </td>
                <td class="col-meta">
                  <div class="meta-cell">
                    @if (issue.comments > 0) { <span class="meta-item">💬 {{ issue.comments }}</span> }
                    @if (issue.linkedPr) { <span class="meta-item pr-link">#{{ issue.linkedPr }}</span> }
                    <span class="meta-item time">{{ issue.updatedAt }}</span>
                  </div>
                </td>
                <td class="col-actions" (click)="$event.stopPropagation()">
                  <div class="action-row">
                    <button class="act-btn edit" title="Edit issue" *appCan="'write'" (click)="store.openEdit(issue)">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 9l1.5-.5 5.5-5.5-1-1-5.5 5.5L1 9z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><path d="M7.5 2.5l1 1" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
                    </button>
                    <button class="act-btn del" title="Delete issue" *appCan="'delete'" (click)="store.confirmDelete(issue)">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 3h8M4 3V2h3v1M4.5 5v3.5M6.5 5v3.5M2.5 3l.5 6h5l.5-6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    @if (auth.isViewer()) { <span class="read-only-tag">view only</span> }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="empty-row">
                  <div class="empty-cell">
                    <span class="empty-icon">◌</span>
                    <span>No issues match the current filters</span>
                    <button class="empty-clear" (click)="clearFilters()">Clear filters</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>{{ store.filtered().length }} of {{ store.stats().total }} issues</span>
        <span>
          {{ store.stats().open }} open · {{ store.stats().inProgress }} in progress ·
          {{ store.stats().resolved }} resolved · {{ store.stats().closed }} closed
        </span>
      </div>
    </section>
  `,
  // (Biarkan CSS milikmu utuh di sini, aku hapus agar respons ini tidak terlalu panjang)
 styles: [`
    /* ── Section ── */
    .issue-list { display: flex; flex-direction: column; gap: 12px; }

    .list-header {
      display: flex; align-items: center;
      justify-content: space-between; gap: 12px;
    }
    .header-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .section-label {
      font-family: 'IBM Plex Mono', monospace; font-size: 10px;
      color: #3d5166; letter-spacing: 0.1em;
    }
    .stats-pills { display: flex; gap: 5px; }
    .stat-pill {
      font-family: 'IBM Plex Mono', monospace; font-size: 10px;
      padding: 2px 7px; border-radius: 3px; border: 1px solid;
    }
    .stat-pill.open { color: #37c97d; border-color: #37c97d44; background: #37c97d11; }
    .stat-pill.ip   { color: #e8a838; border-color: #e8a83844; background: #e8a83811; }
    .stat-pill.crit { color: #e5393d; border-color: #e5393d44; background: #e5393d11; }

    .create-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px;
      background: rgba(229,57,61,0.08);
      border: 1px solid rgba(229,57,61,0.3);
      border-radius: 6px; color: #e5393d;
      font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 500;
      cursor: pointer; transition: all 0.15s;
    }
    .create-btn:hover {
      background: rgba(229,57,61,0.14);
      box-shadow: 0 0 10px rgba(229,57,61,0.12);
      transform: translateY(-1px);
    }

    /* ── Filters ── */
    .filters-bar {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .search-wrap {
      display: flex; align-items: center; gap: 7px;
      background: #0f1420; border: 1px solid #1a2538;
      border-radius: 6px; padding: 0 10px; color: #3d5166;
      transition: all 0.15s; min-width: 200px;
    }
    .search-wrap.focused { border-color: #e5393d44; box-shadow: 0 0 0 2px rgba(229,57,61,0.07); }
    .search-ico { flex-shrink: 0; }
    .search-input {
      background: transparent; border: none; outline: none;
      font-family: 'IBM Plex Mono', monospace; font-size: 11px;
      color: #dce8f5; height: 32px; flex: 1;
    }
    .search-input::placeholder { color: #243040; }
    .search-clear {
      background: none; border: none; color: #3d5166;
      cursor: pointer; font-size: 10px; transition: color 0.15s;
    }
    .search-clear:hover { color: #7e8fa3; }

    .filter-select {
      padding: 5px 10px; background: #0f1420;
      border: 1px solid #1a2538; border-radius: 6px;
      color: #7e8fa3; font-family: 'IBM Plex Mono', monospace;
      font-size: 11px; cursor: pointer; outline: none;
      transition: border-color 0.15s;
    }
    .filter-select:focus { border-color: #283d56; }
    .filter-select option { background: #0f1420; }

    .clear-btn {
      padding: 5px 12px; background: transparent;
      border: 1px solid #1a2538; border-radius: 5px;
      color: #3d5166; font-family: 'IBM Plex Mono', monospace;
      font-size: 10px; cursor: pointer; transition: all 0.15s;
    }
    .clear-btn:hover { border-color: #1f2e42; color: #7e8fa3; }

    .result-count {
      font-family: 'IBM Plex Mono', monospace; font-size: 10px;
      color: #243040; margin-left: auto;
    }

    /* ── Table ── */
    .table-wrap {
      border: 1px solid #1a2538; border-radius: 8px;
      overflow-x: auto; overflow-y: visible;
    }
    .issue-table { width: 100%; border-collapse: collapse; font-family: 'IBM Plex Mono', monospace; font-size: 11px; }

    thead tr { background: #0f1420; border-bottom: 1px solid #1a2538; }
    th {
      padding: 9px 12px; text-align: left; color: #3d5166;
      font-size: 10px; font-weight: 500; letter-spacing: 0.06em;
      text-transform: uppercase; white-space: nowrap; user-select: none;
    }
    th.sortable { cursor: pointer; }
    th.sortable:hover { color: #7e8fa3; }

    .issue-row {
      border-bottom: 1px solid #1a2538;
      transition: background 0.1s;
      cursor: pointer;
    }
    .issue-row:last-child { border-bottom: none; }
    .issue-row:hover { background: #111720; }
    .issue-row.row-closed { opacity: 0.5; }
    .issue-row.row-critical { border-left: 2px solid rgba(229,57,61,0.5); }

    td { padding: 10px 12px; vertical-align: middle; }

    /* Cells */
    .priority-icon { font-size: 11px; font-family: monospace; }
    .issue-num { color: #3d5166; }

    .col-title { max-width: 380px; }
    .title-cell { display: flex; flex-direction: column; gap: 4px; }
    .issue-title { color: #dce8f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; display: block; }
    .label-row { display: flex; gap: 4px; flex-wrap: wrap; }
    .label-chip {
      font-size: 9px; padding: 1px 5px; border-radius: 3px;
      border: 1px solid; white-space: nowrap;
    }

    .status-badge {
      padding: 3px 8px; border-radius: 4px;
      font-size: 10px; white-space: nowrap; font-weight: 500;
    }

    .repo-chip { color: #7e8fa3; }

    .assignee-av {
      width: 24px; height: 24px; border-radius: 5px;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 600; cursor: default;
    }

    .meta-cell { display: flex; align-items: center; gap: 6px; }
    .meta-item { color: #3d5166; font-size: 10px; white-space: nowrap; }
    .meta-item.pr-link { color: #4da6ff; }
    .meta-item.time { color: #243040; }

    .action-row { display: flex; align-items: center; gap: 4px; }
    .act-btn {
      width: 26px; height: 26px; display: flex; align-items: center;
      justify-content: center; background: transparent;
      border: 1px solid #1a2538; border-radius: 5px;
      cursor: pointer; transition: all 0.12s;
    }
    .act-btn.edit { color: #4da6ff; }
    .act-btn.edit:hover { background: rgba(77,166,255,0.1); border-color: rgba(77,166,255,0.3); }
    .act-btn.del  { color: #e5393d; }
    .act-btn.del:hover  { background: rgba(229,57,61,0.1); border-color: rgba(229,57,61,0.3); }

    .read-only-tag {
      font-size: 9px; color: #243040; letter-spacing: 0.04em;
      padding: 2px 5px; border: 1px solid #1a2538; border-radius: 3px;
    }

    /* Empty row */
    .empty-row { text-align: center; padding: 48px !important; }
    .empty-cell {
      display: flex; flex-direction: column;
      align-items: center; gap: 8px;
    }
    .empty-icon { font-size: 24px; color: #243040; }
    .empty-cell span:not(.empty-icon) { font-size: 12px; color: #3d5166; }
    .empty-clear {
      padding: 5px 14px; background: transparent;
      border: 1px solid #1a2538; border-radius: 5px;
      color: #3d5166; font-family: 'IBM Plex Mono', monospace;
      font-size: 11px; cursor: pointer; transition: all 0.15s; margin-top: 4px;
    }
    .empty-clear:hover { border-color: #1f2e42; color: #7e8fa3; }

    /* Footer */
    .table-footer {
      display: flex; justify-content: space-between; flex-wrap: wrap;
      gap: 6px; padding: 4px 2px;
      font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #243040;
    }
  `]
})
export class IssueListComponent {
  // Dependency Injection Modern (Tanpa Constructor)
  readonly store = inject(IssueStore);
  readonly auth  = inject(AuthService);

  // Local Component State
  searchQuery   = signal('');
  searchFocused = signal(false);

  readonly priorityMeta = PRIORITY_META;
  readonly statusMeta   = STATUS_META;
  readonly labelMeta    = LABEL_META;
  readonly repos        = ALL_REPOS;

  // Computed Properties (Otomatis bereaksi jika filter di store berubah)
  readonly hasActiveFilters = computed(() => {
    const f = this.store.filters();
    return f.search !== '' || f.status !== 'all' || f.priority !== 'all' || f.repo !== 'all' || f.assignee !== 'all';
  });

  updateSearch(val: string) {
    this.searchQuery.set(val);
    this.store.setFilter({ search: val });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.store.clearFilters();
  }

  getSortIcon(field: SortField): string {
    const s = this.store.sort();
    if (s.field !== field) return '↕';
    return s.dir === 'desc' ? '↓' : '↑';
  }

  avatarBg(initials: string): string {
    const colors = ['rgba(55,201,125,0.15)', 'rgba(77,166,255,0.15)', 'rgba(180,142,255,0.15)', 'rgba(232,168,56,0.15)', 'rgba(57,208,200,0.15)'];
    return colors[(initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length];
  }
}
