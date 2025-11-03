
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { MainNavVehiculoComponent } from '../main-nav-vehiculo/main-nav-vehiculo.component';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { MaintenanceService, Maintenance } from '../services/maintenance.service';
import { FuelService, FuelRefill } from '../services/fuel.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ver-vehiculo',
  standalone: true,
  imports: [CommonModule, RouterLink, MainNavComponent, MainHeaderComponent, MainNavVehiculoComponent],
  templateUrl: './ver-vehiculo.component.html',
  styleUrls: ['./ver-vehiculo.component.scss']
})
export class VerVehiculoComponent implements OnInit {
  currentUser: any = null;
  vehicle: Vehicle | null = null;
  maintenances: Maintenance[] = [];
  refuels: FuelRefill[] = [];
  loading = false;
  activeVehicleTab: string = 'resumen';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private maintenanceService: MaintenanceService,
    private fuelService: FuelService,
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
    // Cargar mantenimientos desde la API
    this.maintenanceService.getMaintenancesByVehicle(vehicleId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.maintenances = response.data.slice(0, 5); // Últimos 5 mantenimientos
        } else {
          this.maintenances = [];
        }
      },
      error: (err) => {
        console.error('Error loading maintenances', err);
        this.maintenances = [];
      }
    });

    // Cargar recargas de combustible desde la API
    this.fuelService.getFuelRefillsByVehicle(vehicleId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.refuels = response.data.slice(0, 5); // Últimas 5 recargas
        } else {
          this.refuels = [];
        }
      },
      error: (err) => {
        console.error('Error loading fuel refills', err);
        this.refuels = [];
      }
    });
  }

  /** Returns total cost of maintenances shown */
  getTotalMaintenance(): number {
    if (!this.maintenances) return 0;
    return this.maintenances.reduce((s, m) => s + (Number(m.cost) || 0), 0);
  }

  /** Returns total cost of refuels shown */
  getTotalRefuels(): number {
    if (!this.refuels) return 0;
    return this.refuels.reduce((s, r) => s + (Number(r.totalCost) || 0), 0);
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

  onVehicleTabChange(tab: string): void {
    this.activeVehicleTab = tab;
    
    // Navegar según el tab seleccionado
    if (!this.vehicle?.id) return;
    
    if (tab === 'combustible') {
      this.router.navigate(['/combustible', this.vehicle.id]);
    } else if (tab === 'calculadoras') {
      // TODO: crear ruta de calculadoras
      console.log('Navigate to calculadoras');
    }
    // Si es 'resumen', no hacemos nada porque ya estamos en ver-vehiculo
  }
}
