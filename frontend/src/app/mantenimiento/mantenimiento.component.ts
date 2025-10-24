import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MainHeaderComponent } from '../main-header/main-header.component';

interface MaintenanceRecord {
  id: string;
  vehicleId: number;
  vehicleName?: string;
  type?: string;
  title?: string;
  description?: string;
  date?: string;
  km?: number;
  cost?: number;
}

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
  maintenances: MaintenanceRecord[] = [];
  activeFilter: 'all' | number = 'all';

  isLoading = false;

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
    private router: Router

  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadVehicles();
      this.loadMaintenancesFromStorage();
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
      error: () => {
        this.vehicles = [];
        this.isLoading = false;
      }
    });
  }

  private loadMaintenancesFromStorage(): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.maintenances = [];
      return;
    }

    try {
      const key = `cartrack_maintenances_${this.currentUser.id}`;
      const raw = localStorage.getItem(key);
      this.maintenances = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Error loading maintenances from storage', err);
      this.maintenances = [];
    }
  }

  filteredMaintenances(): MaintenanceRecord[] {
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

  logout(): void {
    this.authService.logout();
  }
}
