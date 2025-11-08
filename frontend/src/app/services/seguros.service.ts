import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface InsuranceData {
  id?: number;
  vehicleId: number;
  compania: string;
  tipoCobertura: string;
  costo: number;
  deducible: number;
  fechaInicio: string | Date;
  fechaFin: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
  };
}

export interface InsuranceResponse {
  success: boolean;
  message?: string;
  data?: InsuranceData | InsuranceData[];
  count?: number;
}

export interface SoapData {
  vehicleId: string;
  compania: string;
  lugarCompra: string;
  numeroPoliza: string;
  fechaVigencia: string;
  costo: number;
}

@Injectable({
  providedIn: 'root'
})
export class SegurosService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Crear un nuevo seguro vehicular
   */
  createSeguro(seguroData: any): Observable<InsuranceResponse> {
    return this.http.post<InsuranceResponse>(`${this.apiUrl}/insurances`, seguroData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener todos los seguros de un vehículo
   */
  getInsurancesByVehicle(vehicleId: number): Observable<InsuranceResponse> {
    return this.http.get<InsuranceResponse>(`${this.apiUrl}/insurances/vehicle/${vehicleId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener seguro activo de un vehículo
   */
  getActiveInsurance(vehicleId: number): Observable<InsuranceResponse> {
    return this.http.get<InsuranceResponse>(`${this.apiUrl}/insurances/vehicle/${vehicleId}/active`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un seguro específico por ID
   */
  getInsuranceById(insuranceId: number): Observable<InsuranceResponse> {
    return this.http.get<InsuranceResponse>(`${this.apiUrl}/insurances/${insuranceId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un seguro
   */
  updateInsurance(insuranceId: number, updateData: Partial<InsuranceData>): Observable<InsuranceResponse> {
    return this.http.put<InsuranceResponse>(`${this.apiUrl}/insurances/${insuranceId}`, updateData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar un seguro
   */
  deleteInsurance(insuranceId: number): Observable<InsuranceResponse> {
    return this.http.delete<InsuranceResponse>(`${this.apiUrl}/insurances/${insuranceId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crear SOAP (mantener compatibilidad)
   */
  createSoap(soapData: SoapData): Observable<any> {
    return this.http.post(`${this.apiUrl}/soap`, soapData)
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
      errorMessage = 'Recurso no encontrado.';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Inténtalo más tarde.';
    }

    console.error('SegurosService Error:', error);
    return throwError(() => errorMessage);
  };
}

