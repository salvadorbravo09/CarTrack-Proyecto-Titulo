import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface VehicleDocument {
  id?: number;
  vehicleId: number;
  documentType: 'REGISTRATION' | 'INSURANCE' | 'TECHNICAL_REVIEW' | 'SOAP' | 'OTHER';
  documentNumber?: string;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
  issueDate?: string | Date;
  expiryDate?: string | Date;
  description?: string;
  uploadDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface VehicleDocumentResponse {
  success: boolean;
  message?: string;
  data?: VehicleDocument;
  documents?: VehicleDocument[];
  count?: number;
}

export interface CreateDocumentData {
  vehicleId: number;
  documentType: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  description?: string;
  file: File;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleDocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo documento
   */
  createDocument(documentData: CreateDocumentData): Observable<VehicleDocumentResponse> {
    const formData = new FormData();
    formData.append('vehicleId', documentData.vehicleId.toString());
    formData.append('documentType', documentData.documentType);
    if (documentData.documentNumber) {
      formData.append('documentNumber', documentData.documentNumber);
    }
    if (documentData.issueDate) {
      formData.append('issueDate', documentData.issueDate);
    }
    if (documentData.expiryDate) {
      formData.append('expiryDate', documentData.expiryDate);
    }
    if (documentData.description) {
      formData.append('description', documentData.description);
    }
    formData.append('file', documentData.file);

    return this.http.post<VehicleDocumentResponse>(this.apiUrl, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener todos los documentos de un vehículo
   */
  getDocumentsByVehicle(vehicleId: number): Observable<VehicleDocumentResponse> {
    return this.http.get<VehicleDocumentResponse>(`${this.apiUrl}/vehicle/${vehicleId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un documento
   */
  updateDocument(id: number, documentData: Partial<CreateDocumentData>): Observable<VehicleDocumentResponse> {
    const formData = new FormData();
    
    if (documentData.documentType) {
      formData.append('documentType', documentData.documentType);
    }
    if (documentData.documentNumber) {
      formData.append('documentNumber', documentData.documentNumber);
    }
    if (documentData.issueDate) {
      formData.append('issueDate', documentData.issueDate);
    }
    if (documentData.expiryDate) {
      formData.append('expiryDate', documentData.expiryDate);
    }
    if (documentData.description) {
      formData.append('description', documentData.description);
    }
    if (documentData.file) {
      formData.append('file', documentData.file);
    }

    return this.http.put<VehicleDocumentResponse>(`${this.apiUrl}/${id}`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar un documento
   */
  deleteDocument(id: number): Observable<VehicleDocumentResponse> {
    return this.http.delete<VehicleDocumentResponse>(`${this.apiUrl}/${id}`)
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
      errorMessage = 'Documento no encontrado.';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Inténtalo más tarde.';
    }

    console.error('VehicleDocumentService Error:', error);
    return throwError(() => errorMessage);
  };
}
