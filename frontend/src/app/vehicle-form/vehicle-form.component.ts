import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { VehicleService, CreateVehicleData, UpdateVehicleData } from '../services/vehicle.service';

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
  isEditMode = false;
  vehicleId: number | null = null;

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute,
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

    // Verificar si estamos en modo edición
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.vehicleId = Number(idParam);
    }

    // Inicializar el formulario
    this.initializeForm();

    // Si es modo edición, cargar los datos del vehículo
    if (this.isEditMode && this.vehicleId) {
      this.loadVehicleData(this.vehicleId);
    }
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

  private loadVehicleData(id: number): void {
    this.vehicleService.getVehicleById(id).subscribe({
      next: (response) => {
        if (response.vehicle) {
          const vehicle = response.vehicle;
          
          // Formatear fecha de compra si existe
          let purchaseDate = '';
          if (vehicle.purchaseDate) {
            const date = new Date(vehicle.purchaseDate);
            purchaseDate = date.toISOString().split('T')[0];
          }

          this.vehicleForm.patchValue({
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            engine: vehicle.engine,
            color: vehicle.color,
            licensePlate: vehicle.licensePlate,
            condition: vehicle.condition?.toLowerCase() || 'usado',
            purchaseDate: purchaseDate,
            currentKm: vehicle.currentKm,
            purchasePrice: vehicle.purchasePrice || 0,
            notes: vehicle.notes || ''
          });
        }
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos del vehículo';
        console.error('Error:', error);
      }
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

    if (this.isEditMode && this.vehicleId) {
      this.updateVehicle();
    } else {
      this.createVehicle();
    }
  }

  private createVehicle(): void {
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
          this.router.navigate(['/vehiculos']);
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

  private updateVehicle(): void {
    if (!this.vehicleId) return;

    // Preparar datos para actualizar
    const updateData: UpdateVehicleData = {
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

    // Enviar actualización al backend
    this.vehicleService.updateVehicle(this.vehicleId, updateData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Vehículo actualizado exitosamente';

        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/vehiculos']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error || 'Error al actualizar el vehículo';
        console.error('Error al actualizar vehículo:', error);

        // Scroll hacia arriba para mostrar el error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/vehiculos']);
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
