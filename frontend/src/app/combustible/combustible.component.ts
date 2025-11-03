import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MainNavVehiculoComponent } from '../main-nav-vehiculo/main-nav-vehiculo.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { AuthService } from '../services/auth.service';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { FuelService, FuelRefill } from '../services/fuel.service';

@Component({
  selector: 'app-combustible',
  standalone: true,
  imports: [CommonModule, RouterLink, MainNavVehiculoComponent, MainHeaderComponent, MainNavComponent],
  templateUrl: './combustible.component.html',
  styleUrl: './combustible.component.scss'
})
export class CombustibleComponent implements OnInit {
  currentUser: any = null;
  vehicleId: number | null = null;
  vehicle: Vehicle | null = null;
  activeVehicleTab: string = 'combustible';
  loading = false;
  
  // Datos de combustible desde la API
  fuelRecords: FuelRefill[] = [];
  
  // Métricas calculadas
  gastoTotal: number = 0;
  litrosTotales: number = 0;
  precioPromedio: number = 0;
  totalRecargas: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private vehicleService: VehicleService,
    private fuelService: FuelService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
    
    const idParam = this.route.snapshot.paramMap.get('id');
    this.vehicleId = idParam ? Number(idParam) : null;
    
    if (!this.vehicleId) {
      this.router.navigate(['/vehiculos']);
      return;
    }
    
    this.loadVehicle(this.vehicleId);
    this.loadFuelData();
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
        this.router.navigate(['/vehiculos']);
      }
    });
  }

  private loadFuelData(): void {
    if (!this.vehicleId) return;
    
    this.loading = true;
    this.fuelService.getFuelRefillsByVehicle(this.vehicleId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.fuelRecords = response.data;
          this.calculateMetrics();
        } else {
          this.fuelRecords = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading fuel data', err);
        this.fuelRecords = [];
        this.loading = false;
      }
    });
  }

  private calculateMetrics(): void {
    if (this.fuelRecords.length === 0) {
      this.gastoTotal = 0;
      this.litrosTotales = 0;
      this.precioPromedio = 0;
      this.totalRecargas = 0;
      return;
    }
    
    this.totalRecargas = this.fuelRecords.length;
    this.gastoTotal = this.fuelRecords.reduce((sum, r) => sum + Number(r.totalCost), 0);
    this.litrosTotales = this.fuelRecords.reduce((sum, r) => sum + Number(r.liters), 0);
    this.precioPromedio = this.litrosTotales > 0 ? this.gastoTotal / this.litrosTotales : 0;
  }

  onVehicleTabChange(tab: string): void {
    this.activeVehicleTab = tab;
    
    // Navegar según el tab seleccionado
    if (!this.vehicleId) return;
    
    if (tab === 'resumen') {
      this.router.navigate(['/vehiculo', this.vehicleId]);
    } else if (tab === 'calculadoras') {
      // TODO: crear ruta de calculadoras
      console.log('Navigate to calculadoras');
    }
    // Si es 'combustible', no hacemos nada porque ya estamos aquí
  }

  onAgregarRecarga(): void {
    if (this.vehicleId) {
      this.router.navigate(['/agregar-combustible', this.vehicleId]);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  goBack(): void {
    if (this.vehicleId) {
      this.router.navigate(['/vehiculo', this.vehicleId]);
    } else {
      this.router.navigate(['/vehiculos']);
    }
  }
}
