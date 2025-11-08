import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MainHeaderComponent } from '../main-header/main-header.component';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, RouterLink, MainNavComponent, MainHeaderComponent],
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.scss']
})
export class VehiculosComponent implements OnInit {

  vehicles: Vehicle[] = [];
  loading = false;
  errorMessage = '';
  currentUser: any = null;
  private userSub?: Subscription;

  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService
    , private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual y verificar autenticación
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    if (!this.authService.isAuthenticated()) {
      // Redirigir al login si no está autenticado
      // (RouterLink es importado para templates; el redirect se hace por location)
      window.location.href = '/login';
      return;
    }

    this.loadVehicles();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  loadVehicles() {
    this.loading = true;
    this.errorMessage = '';
    this.vehicleService.getVehicles().subscribe({
      next: (res) => {
        this.vehicles = res.vehicles || [];
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = String(err || 'Error al cargar vehículos');
        this.loading = false;
      }
    });
  }

  onView(v: Vehicle) {
    if (!v.id) return;
    // navigate to the vehicle detail view
    this.router.navigate(['/vehiculo', v.id]);
  }

  onEdit(v: Vehicle) {
    if (!v.id) return;
    // navigate to the edit form
    this.router.navigate(['/vehicle-form', v.id]);
  }

  onDelete(v: Vehicle) {
    if (!confirm('¿Eliminar vehículo?')) return;
    if (!v.id) return;
    this.vehicleService.deleteVehicle(v.id).subscribe({
      next: () => this.loadVehicles(),
      error: (e) => {
        console.error(e);
        this.errorMessage = 'No se pudo eliminar el vehículo';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
