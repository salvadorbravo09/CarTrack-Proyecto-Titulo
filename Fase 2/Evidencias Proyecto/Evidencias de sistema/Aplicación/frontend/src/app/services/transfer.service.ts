import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface TransferRequest {
  vehicleId: number;
  transferEmail: string;
  message?: string;
}

export interface TransferResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private apiUrl = `${environment.apiUrl}/transfers`;

  constructor(private http: HttpClient) {}

  initiateTransfer(payload: TransferRequest): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(this.apiUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  getSentTransfers(): Observable<TransferResponse> {
    return this.http.get<TransferResponse>(`${this.apiUrl}/sent`).pipe(
      catchError(this.handleError)
    );
  }

  getReceivedTransfers(): Observable<TransferResponse> {
    return this.http.get<TransferResponse>(`${this.apiUrl}/received`).pipe(
      catchError(this.handleError)
    );
  }

  acceptTransfer(transferCode: string): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(`${this.apiUrl}/${transferCode}/accept`, {}).pipe(
      catchError(this.handleError)
    );
  }

  rejectTransfer(transferCode: string): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(`${this.apiUrl}/${transferCode}/reject`, {}).pipe(
      catchError(this.handleError)
    );
  }

  cancelTransfer(transferId: number): Observable<TransferResponse> {
    return this.http.delete<TransferResponse>(`${this.apiUrl}/${transferId}`).pipe(
      catchError(this.handleError)
    );
  }

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

    console.error('TransferService Error:', error);
    return throwError(() => errorMessage);
  };
}
