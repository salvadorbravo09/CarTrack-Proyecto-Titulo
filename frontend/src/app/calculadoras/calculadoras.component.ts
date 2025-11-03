import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { AuthService } from '../services/auth.service';
import { FuelService } from '../services/fuel.service';
import { MaintenanceService } from '../services/maintenance.service';

@Component({
  selector: 'app-calculadoras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainNavComponent, MainHeaderComponent],
  templateUrl: './calculadoras.component.html',
  styleUrl: './calculadoras.component.scss'
})
export class CalculadorasComponent implements OnInit {
  currentUser: any = null;
  activeCalculator: string = 'costo-km';
  useRegisteredData: boolean = false;

  // Forms
  costoKmForm!: FormGroup;
  rendimientoForm!: FormGroup;
  viajeForm!: FormGroup;

  // Results
  costoKmResult: number | null = null;
  rendimientoResult: number | null = null;
  viajeResult: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private fuelService: FuelService,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
    this.initializeForms();
  }

  private initializeForms(): void {
    // Formulario Costo por KM
    this.costoKmForm = this.formBuilder.group({
      costoTotal: ['', [Validators.required, Validators.min(0)]],
      kilometros: ['', [Validators.required, Validators.min(1)]]
    });

    // Formulario Rendimiento
    this.rendimientoForm = this.formBuilder.group({
      litros: ['', [Validators.required, Validators.min(0.1)]],
      kilometrosRecorridos: ['', [Validators.required, Validators.min(1)]]
    });

    // Formulario Viaje
    this.viajeForm = this.formBuilder.group({
      distancia: ['', [Validators.required, Validators.min(1)]],
      consumo: ['', [Validators.required, Validators.min(0.1)]],
      precioCombustible: ['', [Validators.required, Validators.min(1)]],
      peajes: [0, [Validators.min(0)]],
      estacionamientos: [0, [Validators.min(0)]],
      otrosGastos: [0, [Validators.min(0)]]
    });
  }

  setActiveCalculator(calculator: string): void {
    this.activeCalculator = calculator;
    this.resetResults();
  }

  private resetResults(): void {
    this.costoKmResult = null;
    this.rendimientoResult = null;
    this.viajeResult = null;
  }

  // Calculadora Costo por KM
  calcularCostoKm(): void {
    if (this.costoKmForm.invalid) {
      this.markFormGroupTouched(this.costoKmForm);
      return;
    }

    const { costoTotal, kilometros } = this.costoKmForm.value;
    this.costoKmResult = costoTotal / kilometros;
  }

  // Calculadora Rendimiento
  calcularRendimiento(): void {
    if (this.rendimientoForm.invalid) {
      this.markFormGroupTouched(this.rendimientoForm);
      return;
    }

    const { litros, kilometrosRecorridos } = this.rendimientoForm.value;
    this.rendimientoResult = kilometrosRecorridos / litros;
  }

  // Calculadora de Viaje
  calcularViaje(): void {
    if (this.viajeForm.invalid) {
      this.markFormGroupTouched(this.viajeForm);
      return;
    }

    const {
      distancia,
      consumo,
      precioCombustible,
      peajes,
      estacionamientos,
      otrosGastos
    } = this.viajeForm.value;

    // Calcular litros necesarios
    const litrosNecesarios = (distancia * consumo) / 100;
    
    // Calcular costo de combustible
    const costoCombustible = litrosNecesarios * precioCombustible;
    
    // Calcular costo total
    const costoTotal = costoCombustible + peajes + estacionamientos + otrosGastos;

    this.viajeResult = {
      litrosNecesarios,
      costoCombustible,
      costoTotal,
      costoPorKm: costoTotal / distancia
    };
  }

  // Usar datos registrados
  async usarDatosRegistrados(): Promise<void> {
    this.useRegisteredData = !this.useRegisteredData;
    
    if (this.useRegisteredData) {
      // Cargar datos reales del usuario
      await this.loadUserData();
    } else {
      // Limpiar formularios
      this.initializeForms();
      this.resetResults();
    }
  }

  private async loadUserData(): Promise<void> {
    // Cargar estadísticas de combustible
    this.fuelService.getFuelStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const stats = response.data;
          
          // Pre-llenar formulario de rendimiento
          if (stats.totalLiters > 0) {
            this.rendimientoForm.patchValue({
              litros: stats.totalLiters,
              // Nota: necesitaríamos los km recorridos totales
            });
          }

          // Pre-llenar datos de viaje
          if (stats.averagePricePerLiter > 0) {
            this.viajeForm.patchValue({
              precioCombustible: stats.averagePricePerLiter
            });
          }
        }
      },
      error: (err) => {
        console.error('Error loading fuel stats', err);
      }
    });

    // Cargar estadísticas de mantenimiento para costos
    this.maintenanceService.getMaintenanceStats().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const totalCost = response.data.reduce((sum, item) => sum + item.totalCost, 0);
          
          // Pre-llenar costo total en calculadora de costo por km
          this.costoKmForm.patchValue({
            costoTotal: totalCost
          });
        }
      },
      error: (err) => {
        console.error('Error loading maintenance stats', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
