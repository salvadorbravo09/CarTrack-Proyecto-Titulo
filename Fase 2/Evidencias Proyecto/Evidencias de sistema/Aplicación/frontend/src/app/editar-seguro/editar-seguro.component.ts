import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para *ngIf, *ngFor, etc.
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Para leer la URL y navegar
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Para el formulario
import { SegurosService, InsuranceData, InsuranceResponse } from '../services/seguros.service'; // Tu servicio de seguros

// Importar componentes de layout
import { MainHeaderComponent } from '../main-header/main-header.component';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-editar-seguro',
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
  templateUrl: './editar-seguro.component.html',
  styleUrl: './editar-seguro.component.scss'
})
export class EditarSeguroComponent implements OnInit {

  // --- MODIFICACIÓN 1: Añadir esta variable ---
  minDate: string;

  insuranceId: number | null = null;
  insurance: InsuranceData | null = null;
  insuranceForm: FormGroup;
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private segurosService: SegurosService
  ) {
    // --- MODIFICACIÓN 2: Inicializar la variable de fecha mínima ---
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;

    // Inicializar el formulario (vacío al principio)
    this.insuranceForm = this.fb.group({
      compania: ['', [Validators.required]],
      tipoCobertura: ['', [Validators.required]],
      costo: [0, [Validators.required, Validators.min(1)]],
      deducible: [0, [Validators.required, Validators.min(0)]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // 1. Obtener el ID de la URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'No se proporcionó un ID de seguro.';
      this.isLoading = false;
      return;
    }

    this.insuranceId = +idParam; // Convertir a número
    this.loadInsuranceData();
  }

  /**
   * Carga los datos del seguro desde el servicio
   */
  loadInsuranceData(): void {
    if (!this.insuranceId) return;

    this.isLoading = true;
    this.segurosService.getInsuranceById(this.insuranceId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.insurance = response.data as InsuranceData;
          // 2. Poblar el formulario con los datos recibidos
          this.insuranceForm.patchValue({
            compania: this.insurance.compania,
            tipoCobertura: this.insurance.tipoCobertura,
            costo: this.insurance.costo,
            deducible: this.insurance.deducible,
            fechaInicio: this.formatDateForInput(this.insurance.fechaInicio),
            fechaFin: this.formatDateForInput(this.insurance.fechaFin)
          });
        } else {
          this.errorMessage = response.message || 'No se pudieron cargar los datos del seguro.';
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
    if (this.insuranceForm.invalid) {
      this.insuranceForm.markAllAsTouched(); // Marcar campos inválidos
      return;
    }

    if (!this.insuranceId) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.insuranceForm.value;

    this.segurosService.updateInsurance(this.insuranceId, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '¡Seguro actualizado exitosamente!';
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