import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// INTERFAZ AÑADIDA: Define la estructura de los datos del SOAP.
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
  private apiUrl = 'http://localhost:3000/api'; // URL de tu backend

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error("Token de autenticación no encontrado.");
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createSeguro(seguroData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/seguros`, seguroData, { headers });
  }

  // CORRECCIÓN: El nombre del método es 'createSoap'
  createSoap(soapData: SoapData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/soap`, soapData, { headers });
  }
}

