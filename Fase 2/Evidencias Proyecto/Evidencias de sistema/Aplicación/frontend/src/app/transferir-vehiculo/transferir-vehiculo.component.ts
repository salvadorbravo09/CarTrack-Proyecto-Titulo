import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { TransferService } from '../services/transfer.service';

@Component({
  selector: 'app-transferir-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, MainHeaderComponent, MainNavComponent],
  templateUrl: './transferir-vehiculo.component.html',
  styleUrls: ['./transferir-vehiculo.component.scss']
})
export class TransferirVehiculoComponent implements OnInit {
  vehicleId: number | null = null;
  transferEmail = '';
  message = '';
  isLoading = false;
  feedback: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transferService: TransferService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.vehicleId = id ? Number(id) : null;
    if (!this.vehicleId) {
      this.feedback = 'ID de vehículo no encontrado.';
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.vehicleId) {
      this.feedback = 'Por favor completa el formulario correctamente.';
      return;
    }

    this.isLoading = true;
    this.feedback = null;

    this.transferService.initiateTransfer({
      vehicleId: this.vehicleId,
      transferEmail: this.transferEmail,
      message: this.message
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.feedback = res?.message || 'Transferencia iniciada con éxito.';
        setTimeout(() => this.router.navigate(['/vehiculos']), 1400);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.feedback = typeof err === 'string' ? err : (err?.message || 'Error al iniciar la transferencia');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/vehiculo', this.vehicleId]);
  }
}
