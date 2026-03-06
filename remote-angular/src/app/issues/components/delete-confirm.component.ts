import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PRIORITY_META } from './issue.models';
import { IssueStore } from './issue.store';

@Component({
  selector: 'app-delete-confirm',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.deleting(); as issue) {
      <div class="overlay" (click)="store.cancelDelete()">
        <div class="dialog" (click)="$event.stopPropagation()">

          <div class="dialog-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M8 6V4h6v2M9.5 10v6M12.5 10v6M4.5 6l1 13h11l1-13"
                stroke="#e5393d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="dialog-body">
            <h3 class="dialog-title">Delete Issue #{{ issue.number }}?</h3>
            <p class="dialog-sub">This action cannot be undone.</p>

            <div class="del-preview">
              <span class="del-pri" [style.color]="priorityMeta[issue.priority].color">
                {{ priorityMeta[issue.priority].icon }}
              </span>
              <span class="del-title">{{ issue.title }}</span>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn-cancel" (click)="store.cancelDelete()" [disabled]="store.saving()">Cancel</button>
            <button class="btn-delete" [class.loading]="store.saving()" [disabled]="store.saving()" (click)="store.deleteIssue(issue.id)">
              @if (store.saving()) {
                <span class="del-spin"></span>
              } @else {
                <span>Delete Issue</span>
              }
            </button>
          </div>

        </div>
      </div>
    }
  `,
    styles: [`
    @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes dialogIn  {
      from { opacity: 0; transform: scale(0.94) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .overlay {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(6,8,9,0.75);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px; animation: overlayIn 0.2s ease-out;
    }
    .dialog {
      width: 100%; max-width: 400px;
      background: #0f1420; border: 1px solid #283d56;
      border-top: 2px solid #e5393d;
      border-radius: 12px; overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
      animation: dialogIn 0.28s cubic-bezier(0.16,1,0.3,1);
      display: flex; flex-direction: column; gap: 0;
    }

    .dialog-icon {
      display: flex; justify-content: center;
      padding: 24px 24px 12px;
      background: rgba(229,57,61,0.05);
    }

    .dialog-body {
      padding: 12px 24px 20px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .dialog-title {
      font-family: 'Epilogue', sans-serif; font-size: 17px; font-weight: 800;
      color: #dce8f5; letter-spacing: -0.01em;
    }
    .dialog-sub {
      font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #7e8fa3;
    }

    .issue-preview {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 10px 12px;
      background: #141b28; border: 1px solid #1a2538; border-radius: 6px;
      margin-top: 4px;
    }
    .preview-priority { font-size: 11px; margin-top: 1px; flex-shrink: 0; }
    .preview-title {
      font-family: 'IBM Plex Mono', monospace; font-size: 12px;
      color: #dce8f5; line-height: 1.4;
    }

    .preview-meta {
      display: flex; align-items: center; gap: 6px;
      font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #3d5166;
    }
    .pm-sep { color: #1a2538; }

    .dialog-actions {
      display: flex; gap: 8px; padding: 14px 24px;
      border-top: 1px solid #1a2538; background: #080b0f;
    }
    .btn-cancel {
      flex: 1; padding: 9px 16px;
      background: transparent; border: 1px solid #1a2538; border-radius: 6px;
      color: #7e8fa3; font-family: 'IBM Plex Mono', monospace; font-size: 12px;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-cancel:hover:not(:disabled) { border-color: #1f2e42; color: #dce8f5; }
    .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-delete {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 9px 16px; background: #e5393d; color: #fff;
      border: none; border-radius: 6px;
      font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 500;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-delete:hover:not(:disabled):not(.loading) {
      background: #f04348;
      box-shadow: 0 4px 14px rgba(229,57,61,0.35);
    }
    .btn-delete:disabled, .btn-delete.loading { opacity: 0.7; cursor: wait; }

    .del-spin {
      width: 12px; height: 12px;
      border: 1.5px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.7s linear infinite; display: inline-block;
    }
  `],
})
export class DeleteConfirmComponent {
  readonly store = inject(IssueStore);
  readonly priorityMeta = PRIORITY_META;
}
