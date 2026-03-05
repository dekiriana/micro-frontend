import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceStatus } from '../board/board.models';


@Component({
  selector: 'app-service-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="svc-section">
      <div class="section-header">
        <span class="section-label">// SERVICE_HEALTH</span>
        <div class="overall-status" [ngClass]="overallClass">
          <span class="overall-dot"></span>
          {{ overallLabel }}
        </div>
      </div>

      <div class="svc-grid">
        <div
          *ngFor="let svc of services; trackBy: trackById"
          class="svc-card"
          [ngClass]="'svc-' + svc.status"
        >
          <div class="svc-top">
            <div class="svc-name-row">
              <div class="pulse-wrap">
                <span class="pulse-dot" [ngClass]="'pulse-' + svc.status"></span>
                <span class="pulse-ring" *ngIf="svc.status === 'operational'" [ngClass]="'pulse-' + svc.status"></span>
              </div>
              <span class="svc-name">{{ svc.name }}</span>
              <span class="svc-env">{{ svc.env }}</span>
            </div>
            <span class="svc-version">{{ svc.version }}</span>
          </div>

          <div class="svc-metrics">
            <div class="svc-metric">
              <span class="metric-label">uptime</span>
              <span class="metric-value" [ngClass]="uptimeClass(svc.uptime)">{{ svc.uptime }}%</span>
            </div>
            <div class="svc-metric">
              <span class="metric-label">latency</span>
              <span class="metric-value" [ngClass]="latencyClass(svc.latency)">{{ svc.latency }}ms</span>
            </div>
          </div>

          <div class="svc-footer">
            <span class="svc-deploy">deployed {{ svc.lastDeploy }}</span>
            <span class="svc-status-chip" [ngClass]="'chip-' + svc.status">{{ svc.status }}</span>
          </div>

          <div class="svc-progress">
            <div
              class="svc-progress-fill"
              [style.width.%]="svc.uptime"
              [ngClass]="'fill-' + svc.status"
            ></div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .svc-section { display: flex; flex-direction: column; gap: 12px; }

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

    .overall-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 4px;
      border: 1px solid;
    }
    .status-ok      { color: #37c97d; border-color: rgba(55,201,125,0.3); background: rgba(55,201,125,0.07); }
    .status-warn    { color: #e8a838; border-color: rgba(232,168,56,0.3); background: rgba(232,168,56,0.07); }
    .status-crit    { color: #e5393d; border-color: rgba(229,57,61,0.3); background: rgba(229,57,61,0.07); }
    .overall-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .svc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 8px;
    }

    .svc-card {
      background: #111720;
      border: 1px solid #1a2538;
      border-radius: 8px;
      padding: 14px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.15s;
    }
    .svc-card:hover { border-color: #1f2e42; }
    .svc-degraded   { border-color: rgba(232,168,56,0.25) !important; background: rgba(232,168,56,0.03); }
    .svc-outage     { border-color: rgba(229,57,61,0.3) !important; background: rgba(229,57,61,0.04); }
    .svc-maintenance { border-color: rgba(77,166,255,0.25) !important; background: rgba(77,166,255,0.03); }

    .svc-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }
    .svc-name-row {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    /* Pulse dot */
    .pulse-wrap { position: relative; width: 10px; height: 10px; flex-shrink: 0; }
    .pulse-dot {
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }
    .pulse-dot.pulse-operational  { background: #37c97d; }
    .pulse-dot.pulse-degraded     { background: #e8a838; }
    .pulse-dot.pulse-outage       { background: #e5393d; animation: blink 1s step-end infinite; }
    .pulse-dot.pulse-maintenance  { background: #4da6ff; }

    .pulse-ring {
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 1px solid currentColor;
      animation: expand 2s ease-out infinite;
      opacity: 0;
    }
    .pulse-ring.pulse-operational { color: #37c97d; }

    @keyframes expand {
      0%   { transform: scale(0.6); opacity: 0.6; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }

    .svc-name {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      color: #dce8f5;
      font-weight: 500;
    }
    .svc-env {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      color: #3d5166;
      background: #0f1420;
      border: 1px solid #1a2538;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .svc-version {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      color: #243040;
    }

    .svc-metrics {
      display: flex;
      gap: 16px;
    }
    .svc-metric { display: flex; flex-direction: column; gap: 2px; }
    .metric-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      color: #243040;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .metric-value {
      font-family: 'Epilogue', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #dce8f5;
      letter-spacing: -0.02em;
    }
    .uptime-good    { color: #37c97d; }
    .uptime-warn    { color: #e8a838; }
    .uptime-bad     { color: #e5393d; }
    .latency-fast   { color: #37c97d; }
    .latency-ok     { color: #e8a838; }
    .latency-slow   { color: #e5393d; }

    .svc-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .svc-deploy {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      color: #243040;
    }
    .svc-status-chip {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 3px;
      letter-spacing: 0.04em;
    }
    .chip-operational { color: #37c97d; background: rgba(55,201,125,0.1); }
    .chip-degraded    { color: #e8a838; background: rgba(232,168,56,0.1); }
    .chip-outage      { color: #e5393d; background: rgba(229,57,61,0.1); }
    .chip-maintenance { color: #4da6ff; background: rgba(77,166,255,0.1); }

    /* Progress bar */
    .svc-progress {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      background: #1a2538;
    }
    .svc-progress-fill {
      height: 100%;
      border-radius: 1px;
      transition: width 0.5s ease-out;
    }
    .fill-operational { background: #37c97d; }
    .fill-degraded    { background: #e8a838; }
    .fill-outage      { background: #e5393d; }
    .fill-maintenance { background: #4da6ff; }
  `],
})
export class ServiceStatusComponent {
  @Input() services: ServiceStatus[] = [];

  get overallLabel(): string {
    if (this.services.some(s => s.status === 'outage'))     return 'Outage Detected';
    if (this.services.some(s => s.status === 'degraded'))   return 'Partially Degraded';
    if (this.services.some(s => s.status === 'maintenance')) return 'Maintenance Active';
    return 'All Systems Operational';
  }

  get overallClass(): string {
    if (this.services.some(s => s.status === 'outage'))   return 'overall-status status-crit';
    if (this.services.some(s => s.status === 'degraded')) return 'overall-status status-warn';
    return 'overall-status status-ok';
  }

  uptimeClass(u: number): string {
    if (u >= 99.9) return 'metric-value uptime-good';
    if (u >= 98)   return 'metric-value uptime-warn';
    return 'metric-value uptime-bad';
  }

  latencyClass(l: number): string {
    if (l < 80)  return 'metric-value latency-fast';
    if (l < 200) return 'metric-value latency-ok';
    return 'metric-value latency-slow';
  }

  trackById(_: number, svc: ServiceStatus): string { return svc.id; }
}
