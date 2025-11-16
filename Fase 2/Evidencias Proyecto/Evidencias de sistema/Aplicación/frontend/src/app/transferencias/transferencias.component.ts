import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { TransferService } from '../services/transfer.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-transferencias',
  standalone: true,
  imports: [CommonModule, MainHeaderComponent, MainNavComponent],
  templateUrl: './transferencias.component.html',
  styleUrls: ['./transferencias.component.scss']
})
export class TransferenciasComponent implements OnInit {
  currentUser: any = null;
  activeView: 'recibidas' | 'enviadas' = 'recibidas';
  receivedTransfers: any[] = [];
  sentTransfers: any[] = [];
  loading = false;
  message: string | null = null;

  constructor(
    private transferService: TransferService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
    this.loadReceivedTransfers();
    this.loadSentTransfers();
  }

  loadReceivedTransfers(): void {
    this.loading = true;
    this.transferService.getReceivedTransfers().subscribe({
      next: (res) => {
        console.log('Transferencias recibidas:', res);
        this.receivedTransfers = res.data || [];
        console.log('Cantidad de transferencias recibidas:', this.receivedTransfers.length);
        if (this.receivedTransfers.length > 0) {
          console.log('Primera transferencia:', this.receivedTransfers[0]);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading received transfers:', err);
        this.loading = false;
      }
    });
  }

  loadSentTransfers(): void {
    this.loading = true;
    this.transferService.getSentTransfers().subscribe({
      next: (res) => {
        this.sentTransfers = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sent transfers:', err);
        this.loading = false;
      }
    });
  }

  switchView(view: 'recibidas' | 'enviadas'): void {
    this.activeView = view;
    this.message = null;
  }

  acceptTransfer(transfer: any): void {
    if (!confirm(`¿Estás seguro de aceptar la transferencia del vehículo ${transfer.vehicle?.brand} ${transfer.vehicle?.model}?`)) {
      return;
    }

    this.loading = true;
    this.message = null;

    this.transferService.acceptTransfer(transfer.transferCode).subscribe({
      next: (res) => {
        this.message = res.message || 'Transferencia aceptada con éxito';
        this.loadReceivedTransfers();
        this.loading = false;
        setTimeout(() => this.router.navigate(['/vehiculos']), 1500);
      },
      error: (err) => {
        this.message = typeof err === 'string' ? err : (err?.message || 'Error al aceptar la transferencia');
        this.loading = false;
      }
    });
  }

  rejectTransfer(transfer: any): void {
    if (!confirm(`¿Estás seguro de rechazar esta transferencia?`)) {
      return;
    }

    this.loading = true;
    this.message = null;

    this.transferService.rejectTransfer(transfer.transferCode).subscribe({
      next: (res) => {
        this.message = res.message || 'Transferencia rechazada';
        this.loadReceivedTransfers();
        this.loading = false;
      },
      error: (err) => {
        this.message = typeof err === 'string' ? err : (err?.message || 'Error al rechazar la transferencia');
        this.loading = false;
      }
    });
  }

  cancelTransfer(transfer: any): void {
    if (!confirm(`¿Estás seguro de cancelar esta transferencia?`)) {
      return;
    }

    this.loading = true;
    this.message = null;

    this.transferService.cancelTransfer(transfer.id).subscribe({
      next: (res) => {
        this.message = res.message || 'Transferencia cancelada';
        this.loadSentTransfers();
        this.loading = false;
      },
      error: (err) => {
        this.message = typeof err === 'string' ? err : (err?.message || 'Error al cancelar la transferencia');
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'accepted':
        return 'badge bg-success';
      case 'rejected':
        return 'badge bg-danger';
      case 'cancelled':
        return 'badge bg-secondary';
      case 'expired':
        return 'badge bg-dark';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'cancelled':
        return 'Cancelada';
      case 'expired':
        return 'Expirada';
      default:
        return status;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
