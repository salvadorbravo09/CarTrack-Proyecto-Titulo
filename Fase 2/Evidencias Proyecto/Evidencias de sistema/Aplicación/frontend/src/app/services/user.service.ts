import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    vehicles: number;
  };
  vehicles?: any[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    USER?: number;
    ADMIN?: number;
  };
  recentUsers: User[];
}

export interface UserResponse {
  success: boolean;
  message?: string;
  user?: User;
  users?: User[];
  count?: number;
}

export interface UserStatsResponse {
  success: boolean;
  stats: UserStats;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los usuarios (solo admin)
   */
  getAllUsers(): Observable<UserResponse> {
    return this.http.get<UserResponse>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Activar/Desactivar usuario (solo admin)
   */
  toggleUserStatus(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/toggle`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener estadísticas de usuarios (solo admin)
   */
  getUserStats(): Observable<UserStatsResponse> {
    return this.http.get<UserStatsResponse>(`${this.apiUrl}/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejar errores HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 401) {
      errorMessage = 'No estás autenticado. Por favor, inicia sesión.';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 404) {
      errorMessage = 'Usuario no encontrado.';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Inténtalo más tarde.';
    }

    console.error('UserService Error:', error);
    return throwError(() => errorMessage);
  };
}
