import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VehicleService, Vehicle } from '../services/vehicle.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  activeTab: string = 'resumen';
  isLoadingVehicles = false;
  isLoadingStats = false;

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

  // Mantenimientos (datos de ejemplo - después conectar con backend)
  maintenances = [
    {
      id: 1,
      vehicleName: 'Toyota Corolla',
      description: 'Cambio de aceite y filtro de aceite',
      cost: 42000,
      date: '2024-04-15'
    },
    {
      id: 2,
      vehicleName: 'Toyota Corolla',
      description: 'Revisión de 50.000 km - cambio de bujías',
      cost: 65000,
      date: '2024-05-08'
    },
    {
      id: 3,
      vehicleName: 'Toyota Corolla',
      description: 'Reparación de sensor de oxígeno',
      cost: 95000,
      date: '2024-06-22'
    }
  ];

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
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
    // Aquí después cargaremos mantenimientos
    // this.loadMaintenances();
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
          
          // Calcular inversión total como gasto total (temporal)
          // Después esto se calculará con datos de mantenimientos
          this.stats.gastoTotal = Number(response.stats.totalInvestment) || 0;
          
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
   * Recargar datos (útil después de crear/editar vehículos)
   */
  refreshData(): void {
    this.loadDashboardData();
  }
}