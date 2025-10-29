import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MaintenanceType {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id?: number;
  vehicleId: number;
  maintenanceTypeId: number;
  date: string;
  description: string;
  workshopName?: string;
  cost?: number;
  mileage: number;
  observations?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  maintenanceType?: MaintenanceType;
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
  };
}

export interface MaintenanceStats {
  type: string;
  count: number;
  totalCost: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apiUrl = `${environment.apiUrl}/maintenance`;

  constructor(private http: HttpClient) { }

  getMaintenanceTypes(): Observable<ApiResponse<MaintenanceType[]>> {
    return this.http.get<ApiResponse<MaintenanceType[]>>(`${this.apiUrl}/types`);
  }

  createMaintenanceType(data: { name: string; description?: string }): Observable<ApiResponse<MaintenanceType>> {
    return this.http.post<ApiResponse<MaintenanceType>>(`${this.apiUrl}/types`, data);
  }

  getAllMaintenances(): Observable<ApiResponse<Maintenance[]>> {
    return this.http.get<ApiResponse<Maintenance[]>>(this.apiUrl);
  }

  getMaintenancesByVehicle(vehicleId: number): Observable<ApiResponse<Maintenance[]>> {
    return this.http.get<ApiResponse<Maintenance[]>>(`${this.apiUrl}/vehicle/${vehicleId}`);
  }

  getMaintenanceById(id: number): Observable<ApiResponse<Maintenance>> {
    return this.http.get<ApiResponse<Maintenance>>(`${this.apiUrl}/${id}`);
  }

  createMaintenance(data: Maintenance): Observable<ApiResponse<Maintenance>> {
    return this.http.post<ApiResponse<Maintenance>>(this.apiUrl, data);
  }

  updateMaintenance(id: number, data: Partial<Maintenance>): Observable<ApiResponse<Maintenance>> {
    return this.http.put<ApiResponse<Maintenance>>(`${this.apiUrl}/${id}`, data);
  }

  deleteMaintenance(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getMaintenanceStats(): Observable<ApiResponse<MaintenanceStats[]>> {
    return this.http.get<ApiResponse<MaintenanceStats[]>>(`${this.apiUrl}/stats`);
  }
}
