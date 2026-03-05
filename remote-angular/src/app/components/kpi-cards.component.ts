import { Component, Input, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiMetric } from '../board/board.models';


@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="kpi-section">
      <div class="section-header">
        <span class="section-label">// KPI_METRICS</span>
        <span class="section-meta">week of {{ weekLabel }} · vs prior week</span>
      </div>
      <div class="kpi-grid">
        <div
          *ngFor="let kpi of metrics; trackBy: trackById"
          class="kpi-card"
          [style.--accent-color]="kpi.color"
        >
          <div class="kpi-top">
            <span class="kpi-label">{{ kpi.label }}</span>
            <span
              class="kpi-delta"
              [class.delta-good]="isDeltaGood(kpi)"
              [class.delta-bad]="!isDeltaGood(kpi)"
            >
              {{ kpi.delta > 0 ? '▲' : '▼' }}
              {{ absVal(kpi.delta) }}%
            </span>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ formatValue(kpi) }}</span>
            <span class="kpi-unit" *ngIf="kpi.unit">{{ kpi.unit }}</span>
          </div>
          <div class="kpi-sparkline-wrap">
            <canvas
              #sparkCanvas
              class="kpi-sparkline"
              width="120"
              height="32"
              [attr.data-id]="kpi.id"
            ></canvas>
          </div>
          <div class="kpi-footer">
            <span class="kpi-trend" [class.trend-up]="kpi.trend === 'up'" [class.trend-down]="kpi.trend === 'down'">
              {{ kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→' }}
              {{ kpi.trend }}
            </span>
          </div>
          <div class="kpi-accent-line" [style.background]="kpi.color"></div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .kpi-section { padding: 0 0 4px; }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
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

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
    }

    .kpi-card {
      position: relative;
      background: #111720;
      border: 1px solid #1a2538;
      border-radius: 8px;
      padding: 16px 16px 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: border-color 0.15s, transform 0.15s;
    }
    .kpi-card:hover {
      border-color: var(--accent-color, #1f2e42);
      transform: translateY(-1px);
    }

    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .kpi-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      color: #3d5166;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .kpi-delta {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 3px;
    }
    .delta-good { color: #37c97d; background: rgba(55, 201, 125, 0.1); }
    .delta-bad  { color: #e5393d; background: rgba(229, 57, 61, 0.1); }

    .kpi-value-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .kpi-value {
      font-family: 'Epilogue', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: #dce8f5;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .kpi-unit {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      color: #3d5166;
    }

    .kpi-sparkline-wrap { height: 32px; margin: 2px 0; }
    .kpi-sparkline { width: 100%; height: 32px; display: block; }

    .kpi-footer { display: flex; align-items: center; gap: 8px; }
    .kpi-trend {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      color: #3d5166;
    }
    .trend-up   { color: #37c97d; }
    .trend-down { color: #e5393d; }

    .kpi-accent-line {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      opacity: 0.5;
    }
    .kpi-card:hover .kpi-accent-line { opacity: 1; }
  `],
})
export class KpiCardsComponent implements AfterViewInit {
  @Input() metrics: KpiMetric[] = [];
  @ViewChildren('sparkCanvas') canvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  weekLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  ngAfterViewInit(): void {
    this.drawSparklines();
  }

  ngOnChanges(): void {
    setTimeout(() => this.drawSparklines(), 0);
  }

  private drawSparklines(): void {
    if (!this.canvases) return;
    this.canvases.forEach((ref, i) => {
      const metric = this.metrics[i];
      if (!metric) return;
      const canvas = ref.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const pts = metric.sparkline;
      const min = Math.min(...pts);
      const max = Math.max(...pts);
      const range = max - min || 1;
      const pad = 3;

      ctx.clearRect(0, 0, w, h);

      // Draw line
      ctx.beginPath();
      pts.forEach((v, idx) => {
        const x = (idx / (pts.length - 1)) * w;
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });

      ctx.strokeStyle = metric.color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Fill under line
      const lastX = w;
      const lastY = h - pad - ((pts[pts.length - 1] - min) / range) * (h - pad * 2);
      ctx.lineTo(lastX, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, metric.color + '33');
      grad.addColorStop(1, metric.color + '00');
      ctx.fillStyle = grad;
      ctx.fill();

      // Last point dot
      const lastVal = pts[pts.length - 1];
      const dotX = w;
      const dotY = h - pad - ((lastVal - min) / range) * (h - pad * 2);
      ctx.beginPath();
      ctx.arc(dotX - 2, dotY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = metric.color;
      ctx.fill();
    });
  }

  trackById(_: number, item: KpiMetric): string { return item.id; }

  isDeltaGood(kpi: KpiMetric): boolean {
    return kpi.good === 'up' ? kpi.delta > 0 : kpi.delta < 0;
  }

  absVal(n: number): string { return Math.abs(n).toFixed(1); }

  formatValue(kpi: KpiMetric): string {
    if (Number.isInteger(kpi.value)) return String(kpi.value);
    return kpi.value.toFixed(1);
  }
}
