import { Injectable, signal, computed } from '@angular/core';
import {
  Issue, IssueForm, IssueFilters, SortField, SortDir,
  PRIORITY_ORDER, EMPTY_FORM, IssueStatus,
} from './issue.models';

// (Gunakan data SEED_ISSUES milikmu yang lama di sini, aku singkat agar rapi)
const SEED_ISSUES: Issue[] = [
  { id: 'iss-001', number: 42, title: 'Remote board latency spike exceeds 200ms threshold', description: '...', priority: 'critical', status: 'in_progress', labels: ['bug', 'performance'], assignee: 'JD', assigneeName: 'Jordan Dev', repo: 'remote-board', createdAt: '6h ago', updatedAt: '28m ago', comments: 4, linkedPr: 3 },
  { id: 'iss-002', number: 41, title: 'Auth token not propagated to Angular remote on hard reload', description: '...', priority: 'high', status: 'review', labels: ['bug', 'security'], assignee: 'AD', assigneeName: 'Alex Admin', repo: 'remote-board', createdAt: '1d ago', updatedAt: '2h ago', comments: 7 },
  // ... masukkan sisa mock data-mu ...
];

@Injectable({ providedIn: 'root' })
export class IssueStore {
  // 1. Deklarasi State menggunakan Signal
  private readonly _issues    = signal<Issue[]>(SEED_ISSUES);
  private readonly _filters   = signal<IssueFilters>({ search: '', status: 'all', priority: 'all', repo: 'all', assignee: 'all' });
  private readonly _sort      = signal<{ field: SortField; dir: SortDir }>({ field: 'number', dir: 'desc' });

  readonly selected  = signal<Issue | null>(null);
  readonly panelMode = signal<'create' | 'edit' | null>(null);
  readonly deleting  = signal<Issue | null>(null);
  readonly saving    = signal<boolean>(false);
  readonly toast     = signal<string | null>(null);

  private _nextNumber = 43;

  // 2. Computed Signals menggantikan Observable pipe/map!
  readonly filters = computed(() => this._filters());
  readonly sort    = computed(() => this._sort());

  readonly filtered = computed(() => {
    const issues = this._issues();
    const f = this._filters();
    const s = this._sort();

    let result = issues.filter(i => {
      if (f.status   !== 'all' && i.status   !== f.status)   return false;
      if (f.priority !== 'all' && i.priority !== f.priority) return false;
      if (f.repo     !== 'all' && i.repo     !== f.repo)     return false;
      if (f.assignee !== 'all' && i.assignee !== f.assignee) return false;
      if (f.search) {
        const q = f.search.toLowerCase();
        if (!i.title.toLowerCase().includes(q) &&
            !i.description.toLowerCase().includes(q) &&
            !(`#${i.number}`).includes(q)) return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      const dir = s.dir === 'asc' ? 1 : -1;
      switch (s.field) {
        case 'number':   return (a.number - b.number) * dir;
        case 'priority': return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir;
        case 'title':    return a.title.localeCompare(b.title) * dir;
        case 'status':   return a.status.localeCompare(b.status) * dir;
        case 'assignee': return a.assignee.localeCompare(b.assignee) * dir;
        default:         return 0;
      }
    });
  });

  readonly stats = computed(() => {
    const issues = this._issues();
    return {
      total:      issues.length,
      open:       issues.filter(i => i.status === 'open').length,
      inProgress: issues.filter(i => i.status === 'in_progress').length,
      review:     issues.filter(i => i.status === 'review').length,
      resolved:   issues.filter(i => i.status === 'resolved').length,
      closed:     issues.filter(i => i.status === 'closed').length,
      critical:   issues.filter(i => i.priority === 'critical').length,
    };
  });

  // 3. Actions menggunakan .set() dan .update()
  setFilter(patch: Partial<IssueFilters>): void {
    this._filters.update(curr => ({ ...curr, ...patch }));
  }

  setSort(field: SortField): void {
    this._sort.update(curr => ({
      field,
      dir: curr.field === field && curr.dir === 'desc' ? 'asc' : 'desc',
    }));
  }

  clearFilters(): void {
    this._filters.set({ search: '', status: 'all', priority: 'all', repo: 'all', assignee: 'all' });
  }

  openCreate(): void {
    this.selected.set(null);
    this.panelMode.set('create');
  }

  openEdit(issue: Issue): void {
    this.selected.set(issue);
    this.panelMode.set('edit');
  }

  closePanel(): void {
    this.panelMode.set(null);
    this.selected.set(null);
  }

  async createIssue(form: IssueForm): Promise<void> {
    this.saving.set(true);
    await this._delay(700);

    const newIssue: Issue = {
      id:          `iss-${Date.now()}`,
      number:      this._nextNumber++,
      title:       form.title.trim(),
      description: form.description.trim(),
      priority:    form.priority,
      status:      form.status,
      labels:      [...form.labels],
      assignee:    form.assignee,
      assigneeName: form.assigneeName,
      repo:        form.repo,
      createdAt:   'just now',
      updatedAt:   'just now',
      comments:    0,
    };

    this._issues.update(curr => [newIssue, ...curr]);
    this.saving.set(false);
    this.closePanel();
    this._showToast(`Issue #${newIssue.number} created`);
  }

  async updateIssue(id: string, form: Partial<IssueForm>): Promise<void> {
    this.saving.set(true);
    await this._delay(600);

    this._issues.update(curr => curr.map(i => i.id === id ? { ...i, ...form, updatedAt: 'just now' } : i));
    this.saving.set(false);
    this.closePanel();
    this._showToast('Issue updated');
  }

  confirmDelete(issue: Issue): void { this.deleting.set(issue); }
  cancelDelete(): void { this.deleting.set(null); }

  async deleteIssue(id: string): Promise<void> {
    this.saving.set(true);
    await this._delay(500);
    const issue = this._issues().find(i => i.id === id);
    this._issues.update(curr => curr.filter(i => i.id !== id));
    this.saving.set(false);
    this.deleting.set(null);
    if (this.selected()?.id === id) this.closePanel();
    this._showToast(`Issue #${issue?.number} deleted`);
  }

  private _delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
  private _showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3000);
  }
}
