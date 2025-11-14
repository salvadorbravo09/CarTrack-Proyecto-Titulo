import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User, UserStats } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { MainHeaderComponent } from '../main-header/main-header.component';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MainHeaderComponent],
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {
  currentUser: any = null;
  users: User[] = [];
  stats: UserStats | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // Verificar que sea admin
      if (user && user.role !== 'ADMIN') {
        this.router.navigate(['/dashboard']);
      }
    });

    // Cargar datos
    this.loadUsers();
    this.loadStats();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.users || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error;
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.userService.getUserStats().subscribe({
      next: (response) => {
        this.stats = response.stats;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  toggleUserStatus(user: User): void {
    if (!confirm(`¿Estás seguro de ${user.isActive ? 'desactivar' : 'activar'} a ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    this.userService.toggleUserStatus(user.id).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Estado actualizado';
        this.loadUsers();
        this.loadStats();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error;
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      default:
        return 'Usuario';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
