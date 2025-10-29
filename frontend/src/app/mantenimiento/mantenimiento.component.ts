import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { MaintenanceService, Maintenance } from '../services/maintenance.service';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MainHeaderComponent } from '../main-header/main-header.component';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, RouterLink, MainNavComponent, MainHeaderComponent],
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.scss']
})
export class MantenimientoComponent implements OnInit {
  currentUser: any = null;
  vehicles: Vehicle[] = [];
  maintenances: Maintenance[] = [];
  activeFilter: 'all' | number = 'all';

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
    private maintenanceService: MaintenanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadVehicles();
      this.loadMaintenances();
    });
  }

  private loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService.getVehicles().subscribe({
      next: (res) => {
        if (res && res.vehicles) {
          this.vehicles = res.vehicles;
        } else {
          this.vehicles = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.vehicles = [];
        this.isLoading = false;
      }
    });
  }

  private loadMaintenances(): void {
    this.isLoading = true;
    this.maintenanceService.getAllMaintenances().subscribe({
      next: (response) => {
        if (response.success) {
          this.maintenances = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading maintenances:', error);
        this.errorMessage = 'Error al cargar los mantenimientos';
        this.isLoading = false;
      }
    });
  }

  filteredMaintenances(): Maintenance[] {
    if (this.activeFilter === 'all') return this.maintenances;
    return this.maintenances.filter(m => m.vehicleId === this.activeFilter);
  }

  setFilterAll(): void {
    this.activeFilter = 'all';
  }

  setFilterVehicle(vehicleId: number | undefined): void {
    if (vehicleId === undefined || vehicleId === null) {
      this.activeFilter = 'all';
      return;
    }
    this.activeFilter = vehicleId;
  }

  canAddMaintenance(): boolean {
    return this.vehicles && this.vehicles.length > 0;
  }

  goToAdd(): void {
    if (!this.canAddMaintenance()) return;
    this.router.navigate(['/seguimiento-mantenimiento']);
  }

  deleteMaintenance(id: number | undefined): void {
    if (!id) return;

    if (confirm('¿Estás seguro de que deseas eliminar este mantenimiento?')) {
      this.maintenanceService.deleteMaintenance(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMaintenances(); // Recargar la lista
          }
        },
        error: (error) => {
          console.error('Error deleting maintenance:', error);
          this.errorMessage = 'Error al eliminar el mantenimiento';
        }
      });
    }
  }

  getVehicleName(vehicleId: number): string {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo desconocido';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  }

  logout(): void {
    this.authService.logout();
  }
}
