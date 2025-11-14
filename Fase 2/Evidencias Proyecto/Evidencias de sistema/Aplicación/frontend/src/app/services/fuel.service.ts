import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FuelRefill {
  id?: number;
  vehicleId: number;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  station: string;
  currentKm: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
  };
}

export interface FuelStats {
  totalRefills: number;
  totalLiters: number;
  totalCost: number;
  averagePricePerLiter: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class FuelService {
  private apiUrl = `${environment.apiUrl}/fuel`;

  constructor(private http: HttpClient) { }

  getAllFuelRefills(): Observable<ApiResponse<FuelRefill[]>> {
    return this.http.get<ApiResponse<FuelRefill[]>>(this.apiUrl);
  }

  getFuelRefillsByVehicle(vehicleId: number): Observable<ApiResponse<FuelRefill[]>> {
    return this.http.get<ApiResponse<FuelRefill[]>>(`${this.apiUrl}/vehicle/${vehicleId}`);
  }

  getFuelRefillById(id: number): Observable<ApiResponse<FuelRefill>> {
    return this.http.get<ApiResponse<FuelRefill>>(`${this.apiUrl}/${id}`);
  }

  createFuelRefill(data: FuelRefill): Observable<ApiResponse<FuelRefill>> {
    return this.http.post<ApiResponse<FuelRefill>>(this.apiUrl, data);
  }

  updateFuelRefill(id: number, data: Partial<FuelRefill>): Observable<ApiResponse<FuelRefill>> {
    return this.http.put<ApiResponse<FuelRefill>>(`${this.apiUrl}/${id}`, data);
  }

  deleteFuelRefill(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getFuelStats(vehicleId?: number): Observable<ApiResponse<FuelStats>> {
    const url = vehicleId 
      ? `${this.apiUrl}/stats?vehicleId=${vehicleId}`
      : `${this.apiUrl}/stats`;
    return this.http.get<ApiResponse<FuelStats>>(url);
  }
}
