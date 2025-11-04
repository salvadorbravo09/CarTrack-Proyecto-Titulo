import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// SOLUCIÓN 1: Se importan los módulos necesarios para los formularios y directivas
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SegurosService } from '../services/seguros.service';
import { MainHeaderComponent } from '../main-header/main-header.component';

@Component({
  selector: 'app-registrar-seguro-vehicular',
  standalone: true,
  // IMPORTANTE: Se añaden los módulos necesarios aquí
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    MainHeaderComponent
  ],
  templateUrl: './registrar-seguro-vehicular.component.html',
  styleUrls: ['./registrar-seguro-vehicular.component.scss'] // Se enlaza el nuevo archivo de estilos
})
export class RegistrarSeguroVehicularComponent implements OnInit {
  
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

  currentUser: any = { firstName: 'Usuario' };
  isLoading = false;
  errorMessage: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private segurosService: SegurosService // Inyecta el servicio
  ) {}

  ngOnInit(): void {
    // Captura el ID del vehículo desde la URL
    this.seguroData.vehicleId = this.route.snapshot.paramMap.get('id');
    if (!this.seguroData.vehicleId) {
      this.errorMessage = "Error: No se ha proporcionado un ID de vehículo.";
      console.error("No vehicle ID found in route parameters.");
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = "Por favor, completa todos los campos requeridos.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Llama al servicio para crear el seguro
    this.segurosService.createSeguro(this.seguroData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Seguro registrado con éxito:', response);
        this.router.navigate(['/dashboard']); // Redirige al dashboard tras el éxito
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Ocurrió un error al registrar el seguro.';
        console.error('Error creating seguro:', err);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
