import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {
  @Input() activeTab: string | null = null;

  constructor(public router: Router) {}

  isActive(tab: string): boolean {
    if (this.activeTab) return this.activeTab === tab;
    // If no explicit activeTab input, derive from current url
    return this.router.url.includes(tab === 'resumen' ? '/dashboard' : `/${tab}`);
  }

  navigateTo(tab: string) {
    const route = tab === 'resumen' ? '/dashboard' : `/${tab}`;
    this.router.navigate([route]);
  }
}
