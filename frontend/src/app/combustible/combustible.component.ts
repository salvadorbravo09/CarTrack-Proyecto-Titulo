import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MainNavVehiculoComponent } from '../main-nav-vehiculo/main-nav-vehiculo.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { AuthService } from '../services/auth.service';
import { VehicleService, Vehicle } from '../services/vehicle.service';

interface FuelRecord {
  id: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  station: string;
  currentKm: number;
}

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
  
  // Datos de combustible (temporalmente desde localStorage)
  fuelRecords: FuelRecord[] = [];
  
  // Métricas calculadas
  gastoTotal: number = 0;
  litrosTotales: number = 0;
  precioPromedio: number = 0;
  totalRecargas: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private vehicleService: VehicleService
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
    this.calculateMetrics();
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
    if (!this.currentUser || !this.vehicleId) return;
    
    try {
      const key = `cartrack_fuel_${this.currentUser.id}`;
      const raw = localStorage.getItem(key);
      const allRecords: FuelRecord[] = raw ? JSON.parse(raw) : [];
      this.fuelRecords = allRecords.filter((r: any) => r.vehicleId === this.vehicleId);
      
      // Si no hay datos, crear algunos de ejemplo (solo para demo)
      if (this.fuelRecords.length === 0 && this.vehicleId) {
        this.initializeDemoData();
      }
    } catch (err) {
      console.error('Error loading fuel data', err);
      this.fuelRecords = [];
    }
  }

  private initializeDemoData(): void {
    // Datos de ejemplo para demostración
    const demoData: FuelRecord[] = [
      {
        id: '1',
        date: '2025-10-25',
        liters: 45.5,
        pricePerLiter: 861,
        totalCost: 39175.5,
        station: 'Copec Centro',
        currentKm: 85000
      },
      {
        id: '2',
        date: '2025-10-15',
        liters: 40.0,
        pricePerLiter: 855,
        totalCost: 34200,
        station: 'Shell Norte',
        currentKm: 84520
      },
      {
        id: '3',
        date: '2025-10-05',
        liters: 42.3,
        pricePerLiter: 850,
        totalCost: 35955,
        station: 'Petrobras Sur',
        currentKm: 84050
      }
    ];
    
    this.fuelRecords = demoData;
    
    // Guardar en localStorage para persistencia
    try {
      const key = `cartrack_fuel_${this.currentUser.id}`;
      const raw = localStorage.getItem(key);
      let allRecords: any[] = raw ? JSON.parse(raw) : [];
      
      // Agregar vehicleId a los registros demo
      const recordsWithVehicleId = demoData.map(r => ({
        ...r,
        vehicleId: this.vehicleId
      }));
      
      // Filtrar registros existentes de este vehículo y agregar los nuevos
      allRecords = allRecords.filter((r: any) => r.vehicleId !== this.vehicleId);
      allRecords.push(...recordsWithVehicleId);
      
      localStorage.setItem(key, JSON.stringify(allRecords));
    } catch (err) {
      console.error('Error saving demo data', err);
    }
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
    this.gastoTotal = this.fuelRecords.reduce((sum, r) => sum + r.totalCost, 0);
    this.litrosTotales = this.fuelRecords.reduce((sum, r) => sum + r.liters, 0);
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
