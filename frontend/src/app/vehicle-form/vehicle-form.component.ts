import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { VehicleService, CreateVehicleData } from '../services/vehicle.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss'],
})
export class VehicleFormComponent implements OnInit {
  currentUser: any = null;
  vehicleForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
    private router: Router,
    private formBuilder: FormBuilder
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

    // Inicializar el formulario
    this.initializeForm();
  }

  private initializeForm(): void {
    const currentYear = new Date().getFullYear();

    this.vehicleForm = this.formBuilder.group({
      brand: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      year: [currentYear, [Validators.required, Validators.min(1900), Validators.max(currentYear + 1)]],
      engine: ['', [Validators.required]],
      color: ['', [Validators.required]],
      licensePlate: ['', [Validators.required, Validators.minLength(3)]],
      condition: ['usado', [Validators.required]],
      purchaseDate: [''],
      currentKm: [0, [Validators.required, Validators.min(0)]],
      purchasePrice: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  onSubmit(): void {
    // Limpiar mensajes anteriores
    this.errorMessage = '';
    this.successMessage = '';

    // Verificar autenticación antes de enviar
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
      this.router.navigate(['/login']);
      return;
    }

    // Validar el formulario
    if (this.vehicleForm.invalid) {
      this.markFormGroupTouched(this.vehicleForm);
      this.errorMessage = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    this.isSubmitting = true;

    // Preparar datos para enviar
    const vehicleData: CreateVehicleData = {
      brand: this.vehicleForm.value.brand,
      model: this.vehicleForm.value.model,
      year: parseInt(this.vehicleForm.value.year),
      licensePlate: this.vehicleForm.value.licensePlate.toUpperCase(),
      color: this.vehicleForm.value.color,
      engine: this.vehicleForm.value.engine,
      currentKm: parseInt(this.vehicleForm.value.currentKm) || 0,
      condition: this.vehicleForm.value.condition,
      purchaseDate: this.vehicleForm.value.purchaseDate || undefined,
      purchasePrice: parseFloat(this.vehicleForm.value.purchasePrice) || undefined,
      notes: this.vehicleForm.value.notes || undefined
    };

    // Enviar al backend
    this.vehicleService.createVehicle(vehicleData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Vehículo registrado exitosamente';
        
        // Limpiar el formulario
        this.vehicleForm.reset({
          year: new Date().getFullYear(),
          condition: 'usado',
          currentKm: 0,
          purchasePrice: 0
        });

        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error || 'Error al registrar el vehículo';
        console.error('Error al crear vehículo:', error);

        // Scroll hacia arriba para mostrar el error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }

  // Métodos auxiliares para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.vehicleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.vehicleForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
      if (field.errors['max']) return `El valor máximo es ${field.errors['max'].max}`;
    }
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
