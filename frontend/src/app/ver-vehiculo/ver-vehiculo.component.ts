
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { AuthService } from '../services/auth.service';

interface MaintenanceRecord {
  id: string;
  vehicleId: number;
  title?: string;
  description?: string;
  date?: string;
  km?: number;
  cost?: number;
}

@Component({
  selector: 'app-ver-vehiculo',
  standalone: true,
  imports: [CommonModule, RouterLink, MainNavComponent, MainHeaderComponent],
  templateUrl: './ver-vehiculo.component.html',
  styleUrls: ['./ver-vehiculo.component.scss']
})
export class VerVehiculoComponent implements OnInit {
  currentUser: any = null;
  vehicle: Vehicle | null = null;
  maintenances: MaintenanceRecord[] = [];
  refuels: any[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (!id) {
      // invalid id - go back to vehicles
      this.router.navigate(['/vehiculos']);
      return;
    }

    this.loadVehicle(id);
    this.loadMaintenanceAndRefuels(id);
  }

  private loadVehicle(id: number): void {
    this.loading = true;
    this.vehicleService.getVehicleById(id).subscribe({
      next: (res) => {
        this.vehicle = res.vehicle || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading vehicle', err);
        this.loading = false;
      }
    });
  }

  private loadMaintenanceAndRefuels(vehicleId: number): void {
    if (!this.currentUser || !this.currentUser.id) return;
    try {
      const key = `cartrack_maintenances_${this.currentUser.id}`;
      const raw = localStorage.getItem(key);
      const all: MaintenanceRecord[] = raw ? JSON.parse(raw) : [];
      this.maintenances = all.filter(m => m.vehicleId === vehicleId).slice(0,5);
    } catch (err) {
      console.error('Error loading maintenances', err);
      this.maintenances = [];
    }

    // refuels/combustible could be stored similarly; attempt to load
    try {
      const rKey = `cartrack_refuels_${this.currentUser.id}`;
      const rawR = localStorage.getItem(rKey);
      const allR = rawR ? JSON.parse(rawR) : [];
      this.refuels = allR.filter((r: any) => r.vehicleId === vehicleId).slice(0,5);
    } catch (err) {
      this.refuels = [];
    }
  }

  /** Returns total cost of maintenances shown */
  getTotalMaintenance(): number {
    if (!this.maintenances) return 0;
    return this.maintenances.reduce((s, m) => s + (m.cost || 0), 0);
  }

  /** Returns total cost of refuels shown */
  getTotalRefuels(): number {
    if (!this.refuels) return 0;
    return this.refuels.reduce((s, r) => s + (r.cost || 0), 0);
  }

  getTotalCost(): number {
    return this.getTotalMaintenance() + this.getTotalRefuels();
  }

  logout(): void {
    this.authService.logout();
  }

  goBack(): void {
    this.router.navigate(['/vehiculos']);
  }
}
