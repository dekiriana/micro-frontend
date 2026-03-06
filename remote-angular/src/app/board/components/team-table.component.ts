import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PullRequest, SortField, SortDir } from '../board.models';


@Component({
  selector: 'app-team-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="table-section">
      <div class="section-header">
        <span class="section-label">// PULL_REQUESTS</span>
        <div class="table-controls">
          <div class="filter-tabs">
            <button
              *ngFor="let f of filters"
              [class.active]="activeFilter === f.id"
              class="filter-tab"
              (click)="setFilter(f.id)"
            >
              {{ f.label }}
              <span class="filter-count">{{ getCount(f.id) }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="table-wrap">
        <table class="pr-table">
          <thead>
            <tr>
              <th class="col-status">Status</th>
              <th class="col-title sortable" (click)="sort('title')">
                Title <span class="sort-icon">{{ getSortIcon('title') }}</span>
              </th>
              <th class="col-repo sortable" (click)="sort('repo')">
                Repo <span class="sort-icon">{{ getSortIcon('repo') }}</span>
              </th>
              <th class="col-author sortable" (click)="sort('author')">
                Author <span class="sort-icon">{{ getSortIcon('author') }}</span>
              </th>
              <th class="col-diff">Diff</th>
              <th class="col-meta">Meta</th>
              <th class="col-age sortable" (click)="sort('age')">
                Age <span class="sort-icon">{{ getSortIcon('age') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let pr of sortedPrs; trackBy: trackById"
              class="pr-row"
              [class.status-merged]="pr.status === 'merged'"
              [class.status-draft]="pr.status === 'draft'"
            >
              <td class="col-status">
                <span class="status-badge" [ngClass]="'badge-' + pr.status">
                  {{ statusIcon(pr.status) }} {{ pr.status }}
                </span>
              </td>
              <td class="col-title">
                <span class="pr-number">#{{ pr.id }}</span>
                <span class="pr-title">{{ pr.title }}</span>
                <span class="pr-labels">
                  <span *ngFor="let l of pr.labels" class="label-chip" [ngClass]="'label-' + l">{{ l }}</span>
                </span>
              </td>
              <td class="col-repo">
                <span class="repo-name">{{ pr.repo }}</span>
              </td>
              <td class="col-author">
                <div class="author-cell">
                  <span class="author-av" [style.background]="avatarColor(pr.initials)">{{ pr.initials }}</span>
                  <span class="author-name">{{ pr.author }}</span>
                </div>
              </td>
              <td class="col-diff">
                <span class="diff-add">+{{ pr.additions }}</span>
                <span class="diff-sep"> / </span>
                <span class="diff-del">-{{ pr.deletions }}</span>
              </td>
              <td class="col-meta">
                <span class="comments-badge" *ngIf="pr.comments > 0">
                  💬 {{ pr.comments }}
                </span>
              </td>
              <td class="col-age">
                <span class="age-text">{{ pr.age }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span class="footer-info">
          Showing {{ sortedPrs.length }} of {{ prs.length }} pull requests
        </span>
        <span class="footer-info">
          {{ mergedCount }} merged · {{ openCount }} open · {{ draftCount }} draft
        </span>
      </div>
    </section>
  `,
  styles: [`
    .table-section { display: flex; flex-direction: column; gap: 12px; }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .section-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      color: #3d5166;
      letter-spacing: 0.1em;
    }

    .table-controls { display: flex; align-items: center; gap: 12px; }

    .filter-tabs { display: flex; gap: 4px; }
    .filter-tab {
      display: flex;
      align-items: center;
      gap: 5px;
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
    .filter-tab:hover { background: #141b28; border-color: #1f2e42; color: #7e8fa3; }
    .filter-tab.active { background: #141b28; border-color: #283d56; color: #dce8f5; }
    .filter-count {
      background: #1a2538;
      color: #3d5166;
      padding: 0 4px;
      border-radius: 3px;
      font-size: 9px;
    }
    .filter-tab.active .filter-count { background: #1f2e42; color: #7e8fa3; }

    .table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #1a2538; }

    .pr-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
    }

    thead tr {
      background: #0f1420;
      border-bottom: 1px solid #1a2538;
    }
    th {
      padding: 10px 12px;
      text-align: left;
      color: #3d5166;
      font-weight: 500;
      font-size: 10px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      white-space: nowrap;
      user-select: none;
    }
    th.sortable { cursor: pointer; }
    th.sortable:hover { color: #7e8fa3; }
    .sort-icon { color: #243040; font-size: 9px; }

    .pr-row {
      border-bottom: 1px solid #1a2538;
      transition: background 0.1s;
    }
    .pr-row:last-child { border-bottom: none; }
    .pr-row:hover { background: #141b28; }
    .pr-row.status-merged { opacity: 0.6; }
    .pr-row.status-draft  { opacity: 0.7; }

    td { padding: 10px 12px; vertical-align: middle; }

    /* Status badge */
    .status-badge {
      padding: 2px 7px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 500;
      white-space: nowrap;
    }
    .badge-open        { color: #37c97d; background: rgba(55,201,125,0.1); border: 1px solid rgba(55,201,125,0.25); }
    .badge-merged      { color: #b48eff; background: rgba(180,142,255,0.1); border: 1px solid rgba(180,142,255,0.25); }
    .badge-draft       { color: #3d5166; background: rgba(61,81,102,0.2); border: 1px solid rgba(61,81,102,0.3); }
    .badge-review      { color: #e8a838; background: rgba(232,168,56,0.1); border: 1px solid rgba(232,168,56,0.25); }

    /* Title col */
    .col-title { max-width: 340px; }
    .pr-number { color: #3d5166; margin-right: 6px; flex-shrink: 0; }
    .pr-title  { color: #dce8f5; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
    .pr-labels { display: flex; gap: 4px; flex-wrap: wrap; }
    .label-chip {
      font-size: 9px;
      padding: 1px 5px;
      border-radius: 3px;
      border: 1px solid;
      white-space: nowrap;
    }
    .label-feature     { color: #4da6ff; border-color: rgba(77,166,255,0.3); background: rgba(77,166,255,0.08); }
    .label-bug         { color: #e5393d; border-color: rgba(229,57,61,0.3); background: rgba(229,57,61,0.08); }
    .label-chore       { color: #3d5166; border-color: rgba(61,81,102,0.3); background: rgba(61,81,102,0.08); }
    .label-refactor    { color: #39d0c8; border-color: rgba(57,208,200,0.3); background: rgba(57,208,200,0.08); }
    .label-test        { color: #37c97d; border-color: rgba(55,201,125,0.3); background: rgba(55,201,125,0.08); }
    .label-docs        { color: #e8a838; border-color: rgba(232,168,56,0.3); background: rgba(232,168,56,0.08); }
    .label-deps        { color: #b48eff; border-color: rgba(180,142,255,0.3); background: rgba(180,142,255,0.08); }
    .label-urgent      { color: #e5393d; border-color: rgba(229,57,61,0.5); background: rgba(229,57,61,0.12); }
    .label-ui          { color: #ff8a4c; border-color: rgba(255,138,76,0.3); background: rgba(255,138,76,0.08); }
    .label-wip         { color: #3d5166; border-color: #1a2538; background: #141b28; }

    .repo-name { color: #7e8fa3; }

    .author-cell { display: flex; align-items: center; gap: 7px; }
    .author-av {
      width: 22px; height: 22px;
      border-radius: 5px;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 600;
      flex-shrink: 0;
    }
    .author-name { color: #7e8fa3; white-space: nowrap; }

    .diff-add  { color: #37c97d; }
    .diff-del  { color: #e5393d; }
    .diff-sep  { color: #243040; }

    .comments-badge { color: #3d5166; font-size: 10px; }

    .age-text { color: #3d5166; white-space: nowrap; }

    .table-footer {
      display: flex;
      justify-content: space-between;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      color: #243040;
      padding: 2px 4px;
    }
  `],
})
export class TeamTableComponent implements OnInit {
  @Input() prs: PullRequest[] = [];

  activeFilter: string = 'all';
  sortField: SortField  = 'age';
  sortDir: SortDir      = 'asc';

  filters = [
    { id: 'all',    label: 'All' },
    { id: 'open',   label: 'Open' },
    { id: 'review', label: 'In Review' },
    { id: 'merged', label: 'Merged' },
    { id: 'draft',  label: 'Draft' },
  ];

  ngOnInit(): void {}

  get filteredPrs(): PullRequest[] {
    if (this.activeFilter === 'all') return this.prs;
    return this.prs.filter(p => p.status === this.activeFilter);
  }

  get sortedPrs(): PullRequest[] {
    return [...this.filteredPrs].sort((a, b) => {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      const va = (a as any)[this.sortField] ?? '';
      const vb = (b as any)[this.sortField] ?? '';
      return va < vb ? -dir : va > vb ? dir : 0;
    });
  }

  get mergedCount(): number { return this.prs.filter(p => p.status === 'merged').length; }
  get openCount():   number { return this.prs.filter(p => p.status === 'open').length; }
  get draftCount():  number { return this.prs.filter(p => p.status === 'draft').length; }

  setFilter(id: string): void { this.activeFilter = id; }

  getCount(filterId: string): number {
    if (filterId === 'all') return this.prs.length;
    return this.prs.filter(p => p.status === filterId).length;
  }

  sort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
  }

  getSortIcon(field: SortField): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  statusIcon(s: string): string {
    const map: Record<string,string> = { open: '●', merged: '⬟', draft: '○', review: '◐' };
    return map[s] ?? '·';
  }

  avatarColor(initials: string): string {
    const colors = ['rgba(55,201,125,0.15)', 'rgba(77,166,255,0.15)', 'rgba(180,142,255,0.15)', 'rgba(232,168,56,0.15)', 'rgba(57,208,200,0.15)'];
    const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length;
    return colors[idx];
  }

  trackById(_: number, item: PullRequest): number { return item.id; }
}
