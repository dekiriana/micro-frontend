import { Directive, input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';

type Capability = 'read' | 'write' | 'delete' | 'admin';

@Directive({
  selector: '[appCan]',
  standalone: true,
})
export class CanDirective {
  // Signal Input modern
  readonly appCan = input.required<Capability>();

  // Dependency injection modern
  private tpl  = inject(TemplateRef<any>);
  private vcr  = inject(ViewContainerRef);
  private auth = inject(AuthService);

  private hasView = false;

  constructor() {
    // Effect bereaksi otomatis jika role atau input appCan berubah
    effect(() => {
      const allowed = this._check(this.auth.role(), this.appCan());

      if (allowed && !this.hasView) {
        this.vcr.createEmbeddedView(this.tpl);
        this.hasView = true;
      } else if (!allowed && this.hasView) {
        this.vcr.clear();
        this.hasView = false;
      }
    });
  }

  private _check(role: string | null, cap: Capability): boolean {
    if (!role) return false;
    switch (cap) {
      case 'read':   return true;
      case 'write':  return ['admin', 'developer'].includes(role);
      case 'delete': return role === 'admin';
      case 'admin':  return role === 'admin';
      default:       return false;
    }
  }
}
