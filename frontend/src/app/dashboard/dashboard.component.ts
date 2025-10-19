import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

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

  // Estadísticas (datos de ejemplo - después conectar con backend)
  stats = {
    totalVehiculos: 2,
    mantenimientos: 18,
    gastoTotal: 4972240,
    gastoCombustible: 3576240,
    gastoMantenimiento: 1396000,
    promedioVehiculo: 2486120
  };

  // Vehículos (datos de ejemplo - después conectar con backend)
  vehicles = [
    {
      id: 1,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      licensePlate: 'ABC-123',
      currentKm: 58500
    },
    {
      id: 2,
      brand: 'Honda',
      model: 'Civic',
      year: 2019,
      licensePlate: 'XYZ-789',
      currentKm: 78000
    }
  ];

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
    }

    // Aquí después cargaremos los datos reales del backend
    // this.loadDashboardData();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Aquí después puedes agregar lógica para cambiar de vista según el tab
  }

  logout(): void {
    this.authService.logout();
  }

  // Método para cargar datos del backend (implementar después)
  // private loadDashboardData(): void {
  //   // Cargar vehículos
  //   // Cargar mantenimientos
  //   // Calcular estadísticas
  // }
}