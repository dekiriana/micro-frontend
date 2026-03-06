import { Component, ChangeDetectionStrategy, HostListener, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../shared/auth/auth.service';
import { CanDirective } from '../../shared/auth/can.directive';
import { IssueForm, EMPTY_FORM, IssuePriority, IssueStatus, PRIORITY_META, STATUS_META, LABEL_META, ALL_LABELS, ALL_REPOS, ALL_ASSIGNEES, IssueLabel } from './issue.models';
import { IssueStore } from './issue.store';


@Component({
  selector: 'app-issue-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, CanDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" [class.visible]="store.panelMode() !== null" (click)="close()"></div>

    <aside class="panel" [class.open]="store.panelMode() !== null" [style.--priority-color]="priorityColor()">
      <div class="panel-inner">

        <header class="panel-header">
          <div class="panel-title-row">
            <span class="panel-mode-badge" [class.edit-badge]="store.panelMode() === 'edit'">
              {{ store.panelMode() === 'create' ? '✦ New Issue' : '⟳ Edit Issue' }}
            </span>
            @if (store.panelMode() === 'edit' && store.selected(); as sel) {
              <span class="panel-issue-num">#{{ sel.number }}</span>
            }
          </div>
          <button class="close-btn" (click)="close()" aria-label="Close panel">✕</button>
        </header>

        <div class="panel-body">
          <form class="issue-form">

            <div class="field">
              <label class="field-label">Title <span class="req">*</span></label>
              <input
                class="field-input"
                [class.has-error]="showErrors() && !form().title.trim()"
                type="text"
                [ngModel]="form().title"
                (ngModelChange)="updateForm({ title: $event })"
                name="title"
                placeholder="Brief summary of the issue..."
                maxlength="140"
                [disabled]="!auth.canWrite()"
              />
              @if (showErrors() && !form().title.trim()) {
                <div class="field-error">Title is required</div>
              }
            </div>

            <div class="field">
              <label class="field-label">Description</label>
              <textarea
                class="field-textarea"
                [class.has-error]="showErrors() && !form().description.trim()"
                [ngModel]="form().description"
                (ngModelChange)="updateForm({ description: $event })"
                name="description"
                placeholder="Steps to reproduce, expected behavior, etc..."
                rows="6"
                [disabled]="!auth.canWrite()"
              ></textarea>
            </div>

            <div class="field-row">
              <div class="field field-half">
                <label class="field-label">Priority <span class="req">*</span></label>
                <div class="priority-grid">
                  @for (p of priorities; track p) {
                    <button
                      type="button"
                      class="priority-opt"
                      [class.selected]="form().priority === p"
                      [style.--p-color]="priorityMeta[p].color"
                      (click)="auth.canWrite() && updateForm({ priority: p })"
                      [disabled]="!auth.canWrite()"
                    >
                      <span class="p-icon">{{ priorityMeta[p].icon }}</span>
                      <span class="p-label">{{ priorityMeta[p].label }}</span>
                    </button>
                  }
                </div>
              </div>

              <div class="field field-half">
                <label class="field-label">Status</label>
                <select class="field-select" [ngModel]="form().status" (ngModelChange)="updateForm({ status: $event })" name="status" [disabled]="!auth.canWrite()">
                  @for (s of statuses; track s) {
                    <option [value]="s">{{ statusMeta[s].label }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="field-row">
              <div class="field field-half">
                <label class="field-label">Repository</label>
                <select class="field-select" [ngModel]="form().repo" (ngModelChange)="updateForm({ repo: $event })" [class.has-error]="showErrors() && !form().repo" name="repo" [disabled]="!auth.canWrite()">
                  <option value="" disabled selected>Select repo...</option>
                  @for (r of allRepos; track r) {
                    <option [value]="r">{{ r }}</option>
                  }
                </select>
              </div>

              <div class="field field-half">
                <label class="field-label">Assignee</label>
                <select class="field-select" [ngModel]="form().assignee" (ngModelChange)="onAssigneeChange($event)" name="assignee" [disabled]="!auth.canWrite()">
                  <option value="unassigned">Unassigned</option>
                  @for (a of allAssignees; track a.initials) {
                    <option [value]="a.initials">{{ a.name }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="field">
              <label class="field-label">Labels</label>
              <div class="labels-grid">
                @for (lbl of allLabels; track lbl) {
                  <button
                    type="button"
                    class="label-toggle"
                    [class.selected]="form().labels.includes(lbl)"
                    [style.--l-color]="labelMeta[lbl].color"
                    (click)="auth.canWrite() && toggleLabel(lbl)"
                    [disabled]="!auth.canWrite()"
                  >
                    {{ lbl }}
                  </button>
                }
              </div>
            </div>

          </form>
        </div>

        <footer class="panel-footer" [class.view-only]="!auth.canWrite()">

          <button class="btn-cancel" type="button" (click)="close()">
            {{ auth.canWrite() ? 'Cancel' : 'Close' }}
          </button>

          @if (!auth.canWrite()) {
            <span class="readonly-notice">Viewing as {{ auth.role() }} (Read-only)</span>
          }

          <div class="footer-right">
            <button
              *appCan="'write'"
              class="btn-submit"
              [class.submitting]="store.saving()"
              type="button"
              [disabled]="store.saving()"
              (click)="submit()"
            >
              @if (store.saving()) {
                <span class="saving-indicator">
                  <span class="save-spin"></span> Saving...
                </span>
              } @else {
                {{ store.panelMode() === 'create' ? 'Create Issue' : 'Save Changes' }}
              }
            </button>
          </div>

        </footer>

      </div>
    </aside>
  `,
  styles: [`
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Backdrop ── */
    .backdrop {
      position: fixed; inset: 0; background: transparent;
      z-index: 49; pointer-events: none; transition: background 0.25s;
    }
    .backdrop.visible {
      background: rgba(6,8,9,0.5);
      pointer-events: all;
      backdrop-filter: blur(2px);
    }

    /* ── Panel ── */
    .panel {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 480px; max-width: 92vw;
      background: #0b0e14;
      border-left: 1px solid #1a2538;
      z-index: 50;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex; flex-direction: column;
      box-shadow: -16px 0 48px rgba(0,0,0,0.5);
    }
    .panel.open { transform: translateX(0); }

    .panel::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0;
      height: 2px;
      background: var(--priority-color, #1a2538);
      transition: background 0.2s;
    }

    .panel-inner { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

    /* ── Header ── */
    .panel-header {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 16px 20px; border-bottom: 1px solid #1a2538; background: #080b0f; flex-shrink: 0;
    }
    .panel-title-row { display: flex; align-items: center; gap: 8px; }
    .panel-mode-badge { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #dce8f5; letter-spacing: -0.01em; }
    .panel-mode-badge.edit-badge { color: #4da6ff; }
    .panel-issue-num { font-family: 'DM Mono', monospace; font-size: 11px; color: #3d5166; }
    .close-btn {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: 1px solid #1a2538; border-radius: 5px;
      color: #3d5166; cursor: pointer; transition: all 0.15s; flex-shrink: 0;
    }
    .close-btn:hover { background: #111720; border-color: #1f2e42; color: #7e8fa3; }

    /* ── Body ── */
    .panel-body { flex: 1; overflow-y: auto; padding: 20px; }
    .issue-form { display: flex; flex-direction: column; gap: 16px; }

    .field { display: flex; flex-direction: column; gap: 5px; }
    .field-row { display: flex; gap: 12px; }
    .field-half { flex: 1; min-width: 0; }

    .field-label {
      font-family: 'DM Mono', monospace; font-size: 10px;
      color: #3d5166; text-transform: uppercase; letter-spacing: 0.08em;
    }
    .req { color: #e5393d; }

    .field-input, .field-textarea, .field-select {
      background: #0f1420; border: 1px solid #1a2538;
      border-radius: 6px; color: #dce8f5;
      font-family: 'DM Mono', monospace; font-size: 12px;
      outline: none; transition: border-color 0.15s, box-shadow 0.15s;
      width: 100%;
    }
    .field-input, .field-select { padding: 8px 12px; }
    .field-textarea { padding: 10px 12px; resize: vertical; line-height: 1.65; }
    .field-input:focus, .field-textarea:focus, .field-select:focus {
      border-color: #283d56; box-shadow: 0 0 0 2px rgba(229,57,61,0.07);
    }
    .field-input::placeholder, .field-textarea::placeholder { color: #1f2e42; }
    .field-input.has-error, .field-textarea.has-error, .field-select.has-error { border-color: rgba(229,57,61,0.4); }
    .field-input:disabled, .field-textarea:disabled, .field-select:disabled { opacity: 0.5; cursor: not-allowed; }
    .field-select option { background: #0f1420; }
    .field-error { font-family: 'DM Mono', monospace; font-size: 10px; color: #e5393d; }

    /* Priority Grid */
    .priority-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
    .priority-opt {
      display: flex; align-items: center; gap: 6px; padding: 7px 10px;
      background: transparent; border: 1px solid #1a2538; border-radius: 5px;
      cursor: pointer; transition: all 0.12s;
      font-family: 'DM Mono', monospace; font-size: 11px; color: #3d5166;
    }
    .priority-opt:hover:not(:disabled) { background: #111720; border-color: #1f2e42; color: #7e8fa3; }
    .priority-opt.selected {
      color: var(--p-color); border-color: color-mix(in srgb, var(--p-color) 40%, transparent);
      background: color-mix(in srgb, var(--p-color) 8%, transparent);
    }
    .priority-opt:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Labels */
    .labels-grid { display: flex; flex-wrap: wrap; gap: 5px; }
    .label-toggle {
      padding: 3px 10px; background: transparent; border: 1px solid #1a2538;
      border-radius: 20px; cursor: pointer; transition: all 0.12s;
      font-family: 'DM Mono', monospace; font-size: 10px; color: #3d5166;
    }
    .label-toggle:hover:not(:disabled) { background: #111720; border-color: #1f2e42; color: #7e8fa3; }
    .label-toggle.selected {
      color: var(--l-color); border-color: color-mix(in srgb, var(--l-color) 40%, transparent);
      background: color-mix(in srgb, var(--l-color) 10%, transparent);
    }
    .label-toggle:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Footer ── */
    .panel-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 14px 20px; border-top: 1px solid #1a2538; background: #080b0f; flex-shrink: 0;
    }
    .panel-footer.view-only { justify-content: space-between; }
    .readonly-notice { font-family: 'DM Mono', monospace; font-size: 11px; color: #e8a838; }

    .btn-cancel {
      padding: 8px 16px; background: transparent; border: 1px solid #1a2538; border-radius: 6px;
      color: #3d5166; font-family: 'DM Mono', monospace; font-size: 12px; cursor: pointer; transition: all 0.15s;
    }
    .btn-cancel:hover { border-color: #1f2e42; color: #7e8fa3; }

    .footer-right { display: flex; align-items: center; gap: 10px; }
    .btn-submit {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 8px 18px; background: #e5393d; color: #fff; border: none; border-radius: 6px;
      font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; min-width: 120px;
    }
    .btn-submit:hover:not(:disabled) { background: #f04348; box-shadow: 0 4px 14px rgba(229,57,61,0.3); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .saving-indicator { display: flex; align-items: center; gap: 6px; }
    .save-spin {
      width: 12px; height: 12px; border: 1.5px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
    }
  `],
})
export class IssuePanelComponent {
  readonly store = inject(IssueStore);
  readonly auth  = inject(AuthService);


  form = signal<IssueForm>({ ...EMPTY_FORM, labels: [] });
  showErrors = signal(false);


  readonly priorities: IssuePriority[] = ['critical', 'high', 'medium', 'low'];
  readonly statuses: IssueStatus[] = ['open', 'in_progress', 'review', 'resolved', 'closed'];
  readonly priorityMeta = PRIORITY_META;
  readonly statusMeta   = STATUS_META;
  readonly labelMeta    = LABEL_META;
  readonly allLabels    = ALL_LABELS;
  readonly allRepos     = ALL_REPOS;
  readonly allAssignees = ALL_ASSIGNEES;

  priorityColor = computed(() => PRIORITY_META[this.form().priority]?.color ?? '#1a2538');

  constructor() {

    effect(() => {
      const mode = this.store.panelMode();
      const selected = this.store.selected();

      if (mode === 'edit' && selected) {
        this.form.set({
          title: selected.title,
          description: selected.description,
          priority: selected.priority,
          status: selected.status,
          labels: [...selected.labels],
          assignee: selected.assignee,
          assigneeName: selected.assigneeName,
          repo: selected.repo,
        });
        this.showErrors.set(false);
      } else if (mode === 'create') {
        this.form.set({ ...EMPTY_FORM, labels: [] });
        this.showErrors.set(false);
      }
    }, { allowSignalWrites: true });
  }

  @HostListener('document:keydown.escape')
  close(): void { this.store.closePanel(); }

  updateForm(patch: Partial<IssueForm>) {
    this.form.update(curr => ({ ...curr, ...patch }));
  }

  toggleLabel(lbl: IssueLabel): void {
    this.form.update(curr => {
      const labels = [...curr.labels];
      const idx = labels.indexOf(lbl);
      if (idx >= 0) labels.splice(idx, 1);
      else labels.push(lbl);
      return { ...curr, labels };
    });
  }

  onAssigneeChange(initials: string): void {
    const found = ALL_ASSIGNEES.find(a => a.initials === initials);
    if (found) {
      this.form.update(curr => ({ ...curr, assignee: initials, assigneeName: found.name }));
    } else {
      this.form.update(curr => ({ ...curr, assignee: 'unassigned', assigneeName: 'Unassigned' }));
    }
  }

  async submit(): Promise<void> {
    this.showErrors.set(true);
    const f = this.form();


    if (!f.title.trim() || !f.description.trim() || !f.repo) return;

    const mode = this.store.panelMode();
    if (mode === 'create') {
      await this.store.createIssue(f);
    } else if (mode === 'edit') {
      const selected = this.store.selected();
      if (selected) await this.store.updateIssue(selected.id, f);
    }
  }
}
