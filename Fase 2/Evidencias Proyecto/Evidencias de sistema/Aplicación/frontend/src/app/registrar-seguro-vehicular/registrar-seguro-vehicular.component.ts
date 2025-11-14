import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SegurosService, InsuranceData } from '../services/seguros.service';
import { VehicleService } from '../services/vehicle.service';
import { AuthService } from '../services/auth.service';
import { MainHeaderComponent } from '../main-header/main-header.component';

@Component({
  selector: 'app-registrar-seguro-vehicular',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    MainHeaderComponent
  ],
  templateUrl: './registrar-seguro-vehicular.component.html',
  styleUrls: ['./registrar-seguro-vehicular.component.scss']
})
export class RegistrarSeguroVehicularComponent implements OnInit {
  
  // --- MODIFICACIÓN 1: Añadir esta variable ---
  minDate: string;

  // Modelo para los datos del formulario
  seguroData: any = {
    vehicleId: null,
    compania: '',
    tipoCobertura: '',
    fechaInicio: '',
    fechaFin: '',
    costo: null,
    deducible: null
  };

  currentUser: any = null;
  vehicleInfo: any = null;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private segurosService: SegurosService,
    private vehicleService: VehicleService,
    private authService: AuthService
  ) {
    // --- MODIFICACIÓN 2: Inicializar la variable ---
    // Esto asegura que la fecha mínima sea "hoy" en la zona horaria local.
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    // Obtener usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Captura el ID del vehículo desde la URL
    const vehicleIdParam = this.route.snapshot.paramMap.get('id');
    if (!vehicleIdParam) {
      this.errorMessage = "Error: No se ha proporcionado un ID de vehículo.";
      // console.error(...) ELIMINADO
      return;
    }

    this.seguroData.vehicleId = parseInt(vehicleIdParam);
    
    // Cargar información del vehículo
    this.loadVehicleInfo(this.seguroData.vehicleId);
  }

  private loadVehicleInfo(vehicleId: number): void {
    this.vehicleService.getVehicleById(vehicleId).subscribe({
      next: (response) => {
        if (response.vehicle) {
          this.vehicleInfo = response.vehicle;
        }
      },
      error: (error) => {
        // console.error(...) ELIMINADO
        this.errorMessage = 'No se pudo cargar la información del vehículo';
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = "Por favor, completa todos los campos requeridos.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Llama al servicio para crear el seguro
    this.segurosService.createSeguro(this.seguroData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Seguro registrado con éxito';
        // console.log(...) ELIMINADO
        
        // Redirige después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/vehiculo', this.seguroData.vehicleId]);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err || 'Ocurrió un error al registrar el seguro.';
        // console.error(...) ELIMINADO
        
        // Scroll hacia arriba para mostrar el error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  onCancel(): void {
    if (this.seguroData.vehicleId) {
      this.router.navigate(['/vehiculo', this.seguroData.vehicleId]);
    } else {
      this.router.navigate(['/vehiculos']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}