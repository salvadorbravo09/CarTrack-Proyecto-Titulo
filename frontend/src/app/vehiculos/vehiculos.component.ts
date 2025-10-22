import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehicleService, Vehicle } from '../services/vehicle.service';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.scss']
})
export class VehiculosComponent implements OnInit {
  vehicles: Vehicle[] = [];
  loading = false;
  errorMessage = '';

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading = true;
    this.errorMessage = '';
    this.vehicleService.getVehicles().subscribe({
      next: (res) => {
        this.vehicles = res.vehicles || [];
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = String(err || 'Error al cargar vehículos');
        this.loading = false;
      }
    });
  }

  onView(v: Vehicle) {
    // placeholder: navigate or open modal
    console.log('view', v.id);
  }

  onEdit(v: Vehicle) {
    console.log('edit', v.id);
  }

  onDelete(v: Vehicle) {
    if (!confirm('¿Eliminar vehículo?')) return;
    if (!v.id) return;
    this.vehicleService.deleteVehicle(v.id).subscribe({
      next: () => this.loadVehicles(),
      error: (e) => {
        console.error(e);
        this.errorMessage = 'No se pudo eliminar el vehículo';
      }
    });
  }
}
