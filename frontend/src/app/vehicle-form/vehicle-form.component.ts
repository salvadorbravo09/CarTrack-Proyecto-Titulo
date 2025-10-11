import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
/* import { AuthService } from '../services/auth.service'; */

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss'],
})
export class VehicleFormComponent /* implements OnInit  */{
    /* currentUser: any = null;
  
    constructor(
      private authService: AuthService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      // Obtener el usuario actual del servicio
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      });
  
      // Si no hay usuario autenticado, redirigir al login
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
      }
    }
  
    logout(): void {
      this.authService.logout();
    } */
}
