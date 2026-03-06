import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueStore } from './issue.store';

@Component({
  selector: 'app-issue-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-wrap" [class.visible]="store.toast() !== null">
      <span class="toast-check">✓</span>
      <span class="toast-msg">{{ store.toast() }}</span>
    </div>
  `,
    styles: [`
    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .toast-wrap {
      position: fixed; bottom: 28px; left: 50%;
      transform: translateX(-50%);
      display: flex; align-items: center; gap: 9px;
      padding: 10px 22px;
      background: #111720;
      border: 1px solid rgba(55,201,125,0.35);
      border-radius: 28px;
      font-family: 'IBM Plex Mono', monospace; font-size: 12px;
      color: #37c97d; z-index: 200;
      box-shadow: 0 8px 28px rgba(0,0,0,0.5);
      pointer-events: none;
      opacity: 0; transition: opacity 0.25s;
      white-space: nowrap;
    }
    .toast-wrap.visible {
      opacity: 1;
      animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .toast-check { font-weight: 700; }
  `],
})
export class IssueToastComponent {
  readonly store = inject(IssueStore);
}
