import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { FuelService } from '../services/fuel.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-agregar-combustible',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agregar-combustible.component.html',
  styleUrl: './agregar-combustible.component.scss'
})
export class AgregarCombustibleComponent implements OnInit {
  fuelForm!: FormGroup;
  vehicleId: number | null = null;
  vehicle: Vehicle | null = null;
  currentUser: any = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  maxDate: string = '';

  // Opciones de formulario
  tiposCombustible = [
    { value: 'bencina_93', label: 'Bencina 93' },
    { value: 'bencina_95', label: 'Bencina 95' },
    { value: 'bencina_97', label: 'Bencina 97' },
    { value: 'diesel', label: 'Diesel' }
  ];

  estaciones = [
    { value: 'Copec', label: 'Copec' },
    { value: 'Shell', label: 'Shell' },
    { value: 'Aramco', label: 'Aramco' },
    { value: 'Otro', label: 'Otro' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private vehicleService: VehicleService,
    private fuelService: FuelService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.maxDate = new Date().toISOString().split('T')[0];
    this.authService.currentUser$.subscribe(u => this.currentUser = u);

    const idParam = this.route.snapshot.paramMap.get('id');
    this.vehicleId = idParam ? Number(idParam) : null;

    if (!this.vehicleId) {
      this.router.navigate(['/vehiculos']);
      return;
    }

    this.loadVehicle(this.vehicleId);
    this.initializeForm();
  }

  private loadVehicle(id: number): void {
    this.vehicleService.getVehicleById(id).subscribe({
      next: (res) => {
        this.vehicle = res.vehicle || null;
        if (this.vehicle) {
          // Pre-llenar el kilometraje actual del vehículo
          this.fuelForm.patchValue({
            kilometraje: this.vehicle.currentKm
          });
        }
      },
      error: (err) => {
        console.error('Error loading vehicle', err);
        this.errorMessage = 'No se pudo cargar el vehículo';
      }
    });
  }

  private initializeForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.fuelForm = this.formBuilder.group({
      fecha: [today, [Validators.required]],
      estacion: ['', [Validators.required]],
      tipoCombustible: ['bencina_95', [Validators.required]],
      precioPorLitro: ['', [Validators.required, Validators.min(0.1)]],
      costoTotal: ['', [Validators.required, Validators.min(0)]],
      litros: [{ value: '', disabled: true }],
      kilometraje: ['', [Validators.required, Validators.min(0)]]
    });

    // Calcular litros automáticamente
    this.fuelForm.get('precioPorLitro')?.valueChanges.subscribe(() => this.calculateLiters());
    this.fuelForm.get('costoTotal')?.valueChanges.subscribe(() => this.calculateLiters());
  }

  litrosCalculados: number = 0;

  calculateLiters(): void {
    const precioPorLitro = this.fuelForm.get('precioPorLitro')?.value;
    const costoTotal = this.fuelForm.get('costoTotal')?.value;

    if (precioPorLitro && costoTotal && precioPorLitro > 0) {
      this.litrosCalculados = costoTotal / precioPorLitro;
      this.fuelForm.get('litros')?.setValue(this.litrosCalculados.toFixed(2));
    } else {
      this.litrosCalculados = 0;
      this.fuelForm.get('litros')?.setValue('');
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.fuelForm.invalid) {
      this.markFormGroupTouched(this.fuelForm);
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    if (!this.vehicleId || !this.currentUser) {
      this.errorMessage = 'Usuario o vehículo no válido';
      return;
    }

    const formData = this.fuelForm.value;
    const newKm = parseInt(formData.kilometraje);
    const currentVehicleKm = this.vehicle?.currentKm || 0;

    // Mostrar alerta si el kilometraje será actualizado
    if (newKm > currentVehicleKm) {
      const confirmUpdate = confirm(
        `Al guardar esta recarga, el kilometraje del vehículo se actualizará de ${currentVehicleKm.toLocaleString('es-CL')} km a ${newKm.toLocaleString('es-CL')} km. ¿Deseas continuar?`
      );
      
      if (!confirmUpdate) {
        return;
      }
    }

    this.isSubmitting = true;

    const newRecord = {
      vehicleId: this.vehicleId,
      date: formData.fecha,
      station: formData.estacion,
      liters: this.litrosCalculados,
      totalCost: parseFloat(formData.costoTotal),
      pricePerLiter: parseFloat(formData.precioPorLitro),
      currentKm: newKm,
      notes: formData.tipoCombustible // Guardar tipo de combustible en notas
    };

    // Guardar usando la API
    this.fuelService.createFuelRefill(newRecord).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '¡Recarga guardada exitosamente!';
          this.isSubmitting = false;

          // Redirigir después de 1 segundo
          setTimeout(() => {
            this.router.navigate(['/combustible', this.vehicleId]);
          }, 1000);
        } else {
          this.errorMessage = response.message || 'Error al guardar la recarga';
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        console.error('Error saving fuel record', err);
        this.errorMessage = err || 'Error al guardar la recarga';
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.location.back();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.fuelForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.fuelForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
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
