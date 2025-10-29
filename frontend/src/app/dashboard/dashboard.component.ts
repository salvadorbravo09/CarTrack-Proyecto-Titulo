import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { AuthService } from '../services/auth.service';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { MaintenanceService, Maintenance } from '../services/maintenance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MainNavComponent, MainHeaderComponent], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  activeTab: string = 'resumen';
  isLoadingVehicles = false;
  isLoadingStats = false;
  isLoadingMaintenances = false;

  // Estadísticas
  stats = {
    totalVehiculos: 0,
    mantenimientos: 0,
    gastoTotal: 0,
    gastoCombustible: 0,
    gastoMantenimiento: 0,
    promedioVehiculo: 0
  };

  // Vehículos desde backend
  vehicles: Vehicle[] = [];

  // Mantenimientos desde backend
  maintenances: Maintenance[] = [];

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
    private maintenanceService: MaintenanceService,
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
      return;
    }

    // Cargar datos del backend
    this.loadDashboardData();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Aquí después puedes agregar lógica para cambiar de vista según el tab
  }

  logout(): void {
    this.authService.logout();
  }

  /**
   * Cargar datos del backend
   */
  private loadDashboardData(): void {
    this.loadVehicles();
    this.loadVehicleStats();
    this.loadMaintenances();
  }

  /**
   * Cargar vehículos del usuario
   */
  private loadVehicles(): void {
    this.isLoadingVehicles = true;
    
    this.vehicleService.getVehicles().subscribe({
      next: (response) => {
        if (response.success && response.vehicles) {
          this.vehicles = response.vehicles;
          console.log('Vehículos cargados:', this.vehicles);
        }
        this.isLoadingVehicles = false;
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.isLoadingVehicles = false;
      }
    });
  }

  /**
   * Cargar estadísticas de vehículos
   */
  private loadVehicleStats(): void {
    this.isLoadingStats = true;
    
    this.vehicleService.getVehicleStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.totalVehiculos = response.stats.totalVehicles;
          
          console.log('Estadísticas cargadas:', response.stats);
        }
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.isLoadingStats = false;
      }
    });
  }

  /**
   * Cargar mantenimientos recientes del usuario
   */
  private loadMaintenances(): void {
    this.isLoadingMaintenances = true;
    
    this.maintenanceService.getAllMaintenances().subscribe({
      next: (response) => {
        if (response.success) {
          // Obtener solo los 3 más recientes
          this.maintenances = response.data
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
          
          // Actualizar estadísticas de mantenimientos
          this.stats.mantenimientos = response.data.length;
          this.stats.gastoMantenimiento = response.data.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
          
          // Calcular gasto total (mantenimiento + combustible)
          // Por ahora solo tenemos mantenimiento, combustible será 0
          this.stats.gastoCombustible = 0; // TODO: Implementar cuando tengamos registros de combustible
          this.stats.gastoTotal = this.stats.gastoMantenimiento + this.stats.gastoCombustible;
          
          // Calcular promedio por vehículo
          if (this.stats.totalVehiculos > 0) {
            this.stats.promedioVehiculo = this.stats.gastoTotal / this.stats.totalVehiculos;
          }
          
          console.log('Mantenimientos cargados:', this.maintenances);
          console.log('Estadísticas actualizadas:', this.stats);
        }
        this.isLoadingMaintenances = false;
      },
      error: (error) => {
        console.error('Error al cargar mantenimientos:', error);
        this.maintenances = [];
        this.isLoadingMaintenances = false;
      }
    });
  }

  /**
   * Obtener nombre del vehículo por ID
   */
  getVehicleName(vehicleId: number): string {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo';
  }

  /**
   * Formatear fecha
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Recargar datos (útil después de crear/editar vehículos)
   */
  refreshData(): void {
    this.loadDashboardData();
  }
}