import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SegurosService, SoapData } from '../services/seguros.service'; // Asegúrate que la ruta sea correcta
import { MainHeaderComponent } from '../main-header/main-header.component';

@Component({
  selector: 'app-registrar-soap',
  standalone: true, // Se habilita el modo Standalone
  imports: [
    CommonModule,   // Necesario para directivas como *ngIf
    FormsModule,    // Necesario para ngForm y [(ngModel)]
    RouterLink,     // Necesario para los botones con routerLink
    MainHeaderComponent
  ],
  templateUrl: './registrar-soap.component.html',
  styleUrls: ['./registrar-soap.component.scss']
})
export class RegistrarSoapComponent implements OnInit {
  
  // --- MODIFICACIÓN 1: Añadir esta variable ---
  minDate: string;

  // Se usa la interfaz SoapData para un tipado fuerte del modelo.
  model: SoapData = {
    vehicleId: 0,
    compania: '',
    lugarCompra: '',
    numeroPoliza: '',
    fechaVigencia: ''
  };

  currentUser: any = { firstName: 'Usuario' };
  isLoading = false;
  message: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private segurosService: SegurosService
  ) {
    // --- MODIFICACIÓN 2: Inicializar la variable de fecha mínima ---
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.model.vehicleId = +vehicleId;
    } else {
      this.message = 'Error: No se encontró el ID del vehículo.';
      // console.error(...) ELIMINADO
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.message = '❌ Por favor, completa todos los campos requeridos.';
      return;
    }

    this.isLoading = true;
    this.message = null;

    this.segurosService.createSoap(this.model).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.message = '✅ SOAP registrado con éxito!';
        // console.log(...) ELIMINADO
        // Espera un momento y luego redirige al dashboard.
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.message = `❌ Error al registrar: ${err.error?.error || 'Error desconocido.'}`;
        // console.error(...) ELIMINADO
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}