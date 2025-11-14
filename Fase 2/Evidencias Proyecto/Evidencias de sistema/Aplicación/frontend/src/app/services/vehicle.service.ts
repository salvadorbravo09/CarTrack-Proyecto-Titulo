import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Vehicle {
  id?: number;
  userId?: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  engine: string;
  currentKm: number;
  condition: 'NEW' | 'USED' | 'nuevo' | 'usado';
  purchaseDate?: string | Date;
  purchasePrice?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SOLD';
  notes?: string;
  seguros?: any[];
  soaps?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface VehicleResponse {
  success: boolean;
  message?: string;
  vehicle?: Vehicle;
  vehicles?: Vehicle[];
  count?: number;
}

export interface VehicleStatsResponse {
  success: boolean;
  stats: {
    totalVehicles: number;
    totalInvestment: number;
  };
}

export interface CreateVehicleData {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  engine: string;
  currentKm?: number;
  condition?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
}

export interface UpdateVehicleData {
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  color?: string;
  engine?: string;
  currentKm?: number;
  condition?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  status?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo vehículo
   */
  createVehicle(vehicleData: CreateVehicleData): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.apiUrl, vehicleData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener todos los vehículos del usuario autenticado
   */
  getVehicles(): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un vehículo específico por ID
   */
  getVehicleById(id: number): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un vehículo
   */
  updateVehicle(id: number, updateData: UpdateVehicleData): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.apiUrl}/${id}`, updateData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar solo el kilometraje de un vehículo
   */
  updateKilometers(id: number, currentKm: number): Observable<VehicleResponse> {
    return this.http.patch<VehicleResponse>(
      `${this.apiUrl}/${id}/kilometers`,
      { currentKm }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar un vehículo (soft delete)
   */
  deleteVehicle(id: number): Observable<VehicleResponse> {
    return this.http.delete<VehicleResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener estadísticas de vehículos
   */
  getVehicleStats(): Observable<VehicleStatsResponse> {
    return this.http.get<VehicleStatsResponse>(`${this.apiUrl}/stats`)
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
    } else if (error.status === 404) {
      errorMessage = 'Vehículo no encontrado.';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Inténtalo más tarde.';
    }

    console.error('VehicleService Error:', error);
    return throwError(() => errorMessage);
  };
}
