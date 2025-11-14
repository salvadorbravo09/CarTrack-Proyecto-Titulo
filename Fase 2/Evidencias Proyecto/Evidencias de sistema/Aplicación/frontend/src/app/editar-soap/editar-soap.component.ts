import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para *ngIf
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Para leer la URL y navegar
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Para el formulario
import { SegurosService, SoapData } from '../services/seguros.service'; // Importamos el servicio y la interfaz

// Importar componentes de layout
import { MainHeaderComponent } from '../main-header/main-header.component';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { FooterComponent } from '../footer/footer.component';

// Necesitamos una interfaz de respuesta para SOAP (la añadiremos al servicio también)
export interface SoapResponse {
  success: boolean;
  message?: string;
  data?: SoapData;
}

@Component({
  selector: 'app-editar-soap',
  standalone: true,
  // --- AÑADIR TODAS ESTAS IMPORTACIONES ---
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule, // Módulo para formularios reactivos
    MainHeaderComponent,
    MainNavComponent,
    FooterComponent
  ],
  templateUrl: './editar-soap.component.html',
  styleUrl: './editar-soap.component.scss'
})
export class EditarSoapComponent implements OnInit {

  // --- MODIFICACIÓN 1: Añadir esta variable ---
  minDate: string;

  soapId: number | null = null;
  soap: SoapData | null = null;
  // Renombramos la variable del formulario para evitar conflictos
  soapForm: FormGroup;
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private segurosService: SegurosService // Usamos el mismo servicio donde está la lógica de SOAP
  ) {
    // --- MODIFICACIÓN 2: Inicializar la variable de fecha mínima ---
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;

    // Inicializar el formulario con los campos del SOAP
    this.soapForm = this.fb.group({
      compania: ['', [Validators.required]],
      lugarCompra: [''], // Opcional
      numeroPoliza: ['', [Validators.required]],
      fechaVigencia: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // 1. Obtener el ID de la URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'No se proporcionó un ID de SOAP.';
      this.isLoading = false;
      return;
    }

    this.soapId = +idParam; // Convertir a número
    this.loadSoapData();
  }

  /**
   * Carga los datos del SOAP desde el servicio
   */
  loadSoapData(): void {
    if (!this.soapId) return;

    this.isLoading = true;
    this.segurosService.getSoapById(this.soapId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.soap = response.data as SoapData;
          // 2. Poblar el formulario con los datos recibidos
          this.soapForm.patchValue({
            compania: this.soap.compania,
            lugarCompra: this.soap.lugarCompra,
            numeroPoliza: this.soap.numeroPoliza,
            fechaVigencia: this.formatDateForInput(this.soap.fechaVigencia)
          });
        } else {
          this.errorMessage = response.message || 'No se pudieron cargar los datos del SOAP.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error;
        this.isLoading = false;
      }
    });
  }

  /**
   * Envía el formulario para actualizar
   */
  onSubmit(): void {
    if (this.soapForm.invalid) {
      this.soapForm.markAllAsTouched(); // Marcar campos inválidos
      return;
    }

    if (!this.soapId) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.soapForm.value;

    this.segurosService.updateSoap(this.soapId, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '¡SOAP actualizado exitosamente!';
          // Opcional: recargar datos o navegar
          // this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message || 'Error al actualizar.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error;
        this.isLoading = false;
      }
    });
  }

  /**
   * Helper para formatear fechas a YYYY-MM-DD para <input type="date">
   */
  private formatDateForInput(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }
}