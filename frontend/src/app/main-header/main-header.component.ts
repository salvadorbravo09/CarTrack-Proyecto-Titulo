import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent {
  /** Texto del brand/logo */
  @Input() brandText = 'CarTrack';
  /** Clases del icono (por ejemplo: 'fas fa-truck me-2 fs-4') */
  @Input() iconClass = 'fas fa-truck me-2 fs-4';
  /** Usuario actual (opcional). Si está presente mostrará saludo */
  @Input() currentUser: any;
  /** Mostrar/ocultar botón de logout */
  @Input() showLogout = true;

  /** Evento emitido cuando el usuario solicita cerrar sesión */
  @Output() logout = new EventEmitter<void>();

  onLogout(): void {
    this.logout.emit();
  }

}
