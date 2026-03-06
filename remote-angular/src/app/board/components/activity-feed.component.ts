import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityEvent } from '../board.models';


@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="activity-section">
      <div class="section-header">
        <span class="section-label">// ACTIVITY_LOG</span>
        <span class="section-meta">last 24h · {{ events.length }} events</span>
      </div>

      <div class="activity-list">
        <div
          *ngFor="let event of events; let i = index; trackBy: trackById"
          class="activity-item"
          [class.item-alert]="event.type === 'alert'"
          [style.animation-delay]="(i * 30) + 'ms'"
        >
          <!-- Timeline line -->
          <div class="timeline">
            <div class="event-icon" [ngClass]="'icon-' + event.type">
              {{ typeIcon(event.type) }}
            </div>
            <div class="timeline-line" *ngIf="i < events.length - 1"></div>
          </div>

          <div class="event-body">
            <div class="event-top">
              <span class="actor-av" [style.background]="avatarBg(event.initials)">{{ event.initials }}</span>
              <span class="actor-name">{{ event.actor }}</span>
              <span class="event-type-chip" [ngClass]="'type-' + event.type">{{ event.type }}</span>
              <span class="event-meta" *ngIf="event.meta">{{ event.meta }}</span>
              <span class="event-time">{{ event.time }}</span>
            </div>
            <p class="event-message">{{ event.message }}</p>
            <span class="event-repo">{{ event.repo }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .activity-section { display: flex; flex-direction: column; gap: 12px; }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .section-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      color: #3d5166;
      letter-spacing: 0.1em;
    }
    .section-meta {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      color: #243040;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .activity-item {
      display: flex;
      gap: 12px;
      animation: slideIn 0.3s ease-out both;
    }
    .activity-item.item-alert .event-body {
      background: rgba(229,57,61,0.04);
      border-color: rgba(229,57,61,0.2);
    }

    /* Timeline */
    .timeline {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: 28px;
    }
    .event-icon {
      width: 24px; height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
      border: 1px solid;
    }
    .icon-deploy   { background: rgba(77,166,255,0.1); border-color: rgba(77,166,255,0.3); color: #4da6ff; }
    .icon-merge    { background: rgba(180,142,255,0.1); border-color: rgba(180,142,255,0.3); color: #b48eff; }
    .icon-issue    { background: rgba(232,168,56,0.1); border-color: rgba(232,168,56,0.3); color: #e8a838; }
    .icon-alert    { background: rgba(229,57,61,0.1); border-color: rgba(229,57,61,0.3); color: #e5393d; }
    .icon-review   { background: rgba(57,208,200,0.1); border-color: rgba(57,208,200,0.3); color: #39d0c8; }
    .icon-comment  { background: rgba(61,81,102,0.2); border-color: rgba(61,81,102,0.3); color: #7e8fa3; }

    .timeline-line {
      width: 1px;
      flex: 1;
      min-height: 16px;
      background: #1a2538;
      margin: 3px 0;
    }

    /* Event body */
    .event-body {
      flex: 1;
      background: #111720;
      border: 1px solid #1a2538;
      border-radius: 7px;
      padding: 10px 12px;
      margin-bottom: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      transition: border-color 0.15s;
    }
    .event-body:hover { border-color: #1f2e42; }

    .event-top {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .actor-av {
      width: 18px; height: 18px;
      border-radius: 4px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 8px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .actor-name {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      color: #7e8fa3;
      font-weight: 500;
    }

    .event-type-chip {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      padding: 1px 5px;
      border-radius: 3px;
      letter-spacing: 0.04em;
    }
    .type-deploy  { color: #4da6ff; background: rgba(77,166,255,0.1); }
    .type-merge   { color: #b48eff; background: rgba(180,142,255,0.1); }
    .type-issue   { color: #e8a838; background: rgba(232,168,56,0.1); }
    .type-alert   { color: #e5393d; background: rgba(229,57,61,0.1); }
    .type-review  { color: #39d0c8; background: rgba(57,208,200,0.1); }
    .type-comment { color: #7e8fa3; background: rgba(61,81,102,0.15); }

    .event-meta {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      color: #3d5166;
      background: #0f1420;
      border: 1px solid #1a2538;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .event-time {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      color: #243040;
      margin-left: auto;
    }

    .event-message {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      color: #dce8f5;
      line-height: 1.5;
    }
    .event-repo {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      color: #243040;
    }
  `],
})
export class ActivityFeedComponent {
  @Input() events: ActivityEvent[] = [];

  typeIcon(t: string): string {
    const map: Record<string,string> = {
      deploy: '⬆', merge: '⬟', issue: '◆', alert: '⚠',
      review: '◐', comment: '◉',
    };
    return map[t] ?? '·';
  }

  avatarBg(initials: string): string {
    const colors = [
      'rgba(55,201,125,0.15)', 'rgba(77,166,255,0.15)', 'rgba(180,142,255,0.15)',
      'rgba(232,168,56,0.15)', 'rgba(57,208,200,0.15)', 'rgba(229,57,61,0.12)',
    ];
    const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length;
    return colors[idx];
  }

  trackById(_: number, e: ActivityEvent): number { return e.id; }
}
