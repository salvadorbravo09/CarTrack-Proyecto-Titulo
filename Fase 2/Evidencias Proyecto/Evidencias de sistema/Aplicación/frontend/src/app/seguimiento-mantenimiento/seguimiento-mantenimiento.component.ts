import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { MaintenanceService, MaintenanceType, Maintenance } from '../services/maintenance.service';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { NumberFormatDirective } from '../directives/number-format.directive';

@Component({
  selector: 'app-seguimiento-mantenimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MainNavComponent, MainHeaderComponent, NumberFormatDirective],
  templateUrl: './seguimiento-mantenimiento.component.html',
  styleUrl: './seguimiento-mantenimiento.component.scss'
})
export class SeguimientoMantenimientoComponent implements OnInit {
  maintenanceForm: FormGroup;
  vehicles: Vehicle[] = [];
  maintenanceTypes: MaintenanceType[] = [];
  isLoading = false;
  isEditMode = false;
  maintenanceId?: number;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private maintenanceService: MaintenanceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.maintenanceForm = this.fb.group({
      vehicleId: ['', Validators.required],
      maintenanceTypeId: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      workshopName: [''],
      cost: [''],
      mileage: ['', [Validators.required, Validators.min(0)]],
      observations: [''],
      status: ['completado']
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
    this.loadMaintenanceTypes();

    // Verificar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.maintenanceId = +params['id'];
        this.loadMaintenance(this.maintenanceId);
      }
    });
  }

  private loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (res) => {
        if (res && res.vehicles) {
          this.vehicles = res.vehicles;
        }
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.errorMessage = 'Error al cargar los vehículos';
      }
    });
  }

  private loadMaintenanceTypes(): void {
    this.maintenanceService.getMaintenanceTypes().subscribe({
      next: (response) => {
        if (response.success) {
          this.maintenanceTypes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading maintenance types:', error);
        this.errorMessage = 'Error al cargar los tipos de mantenimiento';
      }
    });
  }

  private loadMaintenance(id: number): void {
    this.isLoading = true;
    this.maintenanceService.getMaintenanceById(id).subscribe({
      next: (response) => {
        if (response.success) {
          const maintenance = response.data;
          this.maintenanceForm.patchValue({
            vehicleId: maintenance.vehicleId,
            maintenanceTypeId: maintenance.maintenanceTypeId,
            date: this.formatDateForInput(maintenance.date),
            description: maintenance.description,
            workshopName: maintenance.workshopName,
            cost: maintenance.cost,
            mileage: maintenance.mileage,
            observations: maintenance.observations,
            status: maintenance.status || 'completado'
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading maintenance:', error);
        this.errorMessage = 'Error al cargar el mantenimiento';
        this.isLoading = false;
      }
    });
  }

  private formatDateForInput(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.maintenanceForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.maintenanceForm.value;
    
    // Convertir valores numéricos (vienen como strings del formulario)
    const maintenanceData = {
      ...formData,
      vehicleId: parseInt(formData.vehicleId, 10),
      maintenanceTypeId: parseInt(formData.maintenanceTypeId, 10),
      mileage: parseInt(formData.mileage, 10),
      cost: formData.cost ? parseFloat(formData.cost) : undefined
    };

    if (this.isEditMode && this.maintenanceId) {
      // Actualizar mantenimiento existente
      this.maintenanceService.updateMaintenance(this.maintenanceId, maintenanceData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Mantenimiento actualizado exitosamente';
            setTimeout(() => {
              this.router.navigate(['/mantenimiento']);
            }, 1500);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating maintenance:', error);
          this.errorMessage = error.error?.message || 'Error al actualizar el mantenimiento';
          this.isLoading = false;
        }
      });
    } else {
      // Crear nuevo mantenimiento
      this.maintenanceService.createMaintenance(maintenanceData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Mantenimiento registrado exitosamente';
            setTimeout(() => {
              this.router.navigate(['/mantenimiento']);
            }, 1500);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating maintenance:', error);
          this.errorMessage = error.error?.message || 'Error al crear el mantenimiento';
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/mantenimiento']);
  }

  getCurrentKm(): number | null {
    const vehicleId = this.maintenanceForm.get('vehicleId')?.value;
    if (!vehicleId) return null;
    
    const vehicle = this.vehicles.find(v => v.id === parseInt(vehicleId));
    return vehicle ? vehicle.currentKm : null;
  }
}

