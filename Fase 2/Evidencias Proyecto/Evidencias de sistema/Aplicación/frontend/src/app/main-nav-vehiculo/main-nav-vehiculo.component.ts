import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-nav-vehiculo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-nav-vehiculo.component.html',
  styleUrl: './main-nav-vehiculo.component.scss'
})
export class MainNavVehiculoComponent {
  @Input() activeTab: string = 'resumen';
  @Output() tabChange = new EventEmitter<string>();

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}
