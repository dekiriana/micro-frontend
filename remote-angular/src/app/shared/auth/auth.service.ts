import { Injectable, OnDestroy, signal, computed } from '@angular/core';

interface AuthState {
  user:    any | null;
  token:   string | null;
  isAuth:  boolean;
  loading: boolean;
  error:   string | null;
  role?:   string;
}

const INITIAL_STATE: AuthState = {
  user: null, token: null, isAuth: false, loading: false, error: null,
};

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  // 1. State internal menggunakan Signal
  private state = signal<AuthState>(INITIAL_STATE);

  private unsubscribe: (() => void) | null = null;
  private store: any = null;

  // 2. Computed Signals untuk diakses oleh komponen
  readonly isAuth = computed(() => this.state().isAuth);
  readonly user   = computed(() => this.state().user);
  readonly role   = computed(() => this.state().user?.role ?? null);

  readonly isAdmin     = computed(() => this.role() === 'admin');
  readonly isDeveloper = computed(() => this.role() === 'developer');
  readonly isViewer    = computed(() => this.role() === 'viewer');
  readonly canWrite    = computed(() => ['admin', 'developer'].includes(this.role() ?? ''));

  constructor() {
    this.connectToAuthStore();
  }

  private async connectToAuthStore(): Promise<void> {
    try {
      // Dynamic import ke React Host
      const mod = await (Function('return import("host_devpulse/AuthCore")')());
      this.store = mod.authStore;

      this.unsubscribe = this.store.subscribe((newState: AuthState) => {
        // Update signal secara reaktif
        this.state.set({ ...newState });
      });
    } catch (err) {
      console.warn('[Angular AuthService] Gagal connect ke Host, menggunakan Fallback', err);
      this.tryLocalStorageFallback();
    }
  }

  private tryLocalStorageFallback(): void {
    try {
      const token = localStorage.getItem('devpulse_token');
      if (!token) return;
      const parts = token.split('.');
      if (parts.length !== 3) return;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) return;

      this.state.set({ user: payload, token, isAuth: true, loading: false, error: null });
    } catch { /* ignore */ }
  }

  async logout(reason = 'user_action'): Promise<void> {
    if (this.store) {
      this.store.logout(reason);
    } else {
      localStorage.removeItem('devpulse_token');
      this.state.set(INITIAL_STATE);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }
}
