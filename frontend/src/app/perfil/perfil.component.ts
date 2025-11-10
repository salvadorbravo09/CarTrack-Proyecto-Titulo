import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { AuthService } from '../services/auth.service';
import { VehicleService } from '../services/vehicle.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, MainHeaderComponent, MainNavComponent, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  currentUser: any = null;
  vehicles: any[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadVehicles();
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (response: any) => {
        console.log('Vehicle response:', response);
        if (response.success && response.data) {
          this.vehicles = response.data;
        } else if (Array.isArray(response)) {
          this.vehicles = response;
        } else if (response.vehicles) {
          this.vehicles = response.vehicles;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading vehicles', err);
        this.isLoading = false;
      }
    });
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
