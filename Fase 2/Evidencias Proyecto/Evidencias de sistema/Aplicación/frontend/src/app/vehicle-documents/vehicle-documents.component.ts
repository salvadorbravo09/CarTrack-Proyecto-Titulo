import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { VehicleDocumentService, VehicleDocument, CreateDocumentData } from '../services/vehicle-document.service';
import { VehicleService, Vehicle } from '../services/vehicle.service';
import { AuthService } from '../services/auth.service';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { FooterComponent } from '../footer/footer.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-vehicle-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, MainNavComponent, MainHeaderComponent, FooterComponent],
  templateUrl: './vehicle-documents.component.html',
  styleUrls: ['./vehicle-documents.component.scss']
})
export class VehicleDocumentsComponent implements OnInit, OnDestroy {
  vehicleId!: number;
  vehicle: Vehicle | null = null;
  documents: VehicleDocument[] = [];
  loading = false;
  uploading = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any = null;
  private userSub?: Subscription;

  // Form data
  documentType: string = 'OTHER';
  documentNumber: string = '';
  issueDate: string = '';
  expiryDate: string = '';
  description: string = '';
  selectedFile: File | null = null;

  documentTypes = [
    { value: 'REGISTRATION', label: 'Permiso de Circulación' },
    { value: 'INSURANCE', label: 'Seguro' },
    { value: 'TECHNICAL_REVIEW', label: 'Revisión Técnica' },
    { value: 'SOAP', label: 'SOAP' },
    { value: 'OTHER', label: 'Otro' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: VehicleDocumentService,
    private vehicleService: VehicleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    if (!this.authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vehicleId = parseInt(id, 10);
      this.loadVehicle();
      this.loadDocuments();
    }
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  loadVehicle(): void {
    this.vehicleService.getVehicleById(this.vehicleId).subscribe({
      next: (response) => {
        if (response.vehicle) {
          this.vehicle = response.vehicle;
        }
      },
      error: (err) => {
        console.error('Error loading vehicle:', err);
        this.errorMessage = 'Error al cargar el vehículo';
      }
    });
  }

  loadDocuments(): void {
    this.loading = true;
    this.errorMessage = '';
    this.documentService.getDocumentsByVehicle(this.vehicleId).subscribe({
      next: (response) => {
        this.documents = (response.data && Array.isArray(response.data)) ? response.data : [];
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = String(err || 'Error al cargar documentos');
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = 'El archivo es demasiado grande. Máximo 10MB.';
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Por favor selecciona un archivo';
      return;
    }

    if (!this.documentType) {
      this.errorMessage = 'Por favor selecciona un tipo de documento';
      return;
    }

    this.uploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const documentData: CreateDocumentData = {
      vehicleId: this.vehicleId,
      documentType: this.documentType,
      file: this.selectedFile
    };

    if (this.documentNumber) {
      documentData.documentNumber = this.documentNumber;
    }

    if (this.issueDate) {
      documentData.issueDate = this.issueDate;
    }

    if (this.expiryDate) {
      documentData.expiryDate = this.expiryDate;
    }

    if (this.description) {
      documentData.description = this.description;
    }

    this.documentService.createDocument(documentData).subscribe({
      next: (response) => {
        this.successMessage = 'Documento subido exitosamente';
        this.uploading = false;
        this.resetForm();
        this.loadDocuments();
      },
      error: (err) => {
        this.errorMessage = String(err || 'Error al subir el documento');
        this.uploading = false;
      }
    });
  }

  deleteDocument(doc: VehicleDocument): void {
    if (!confirm('¿Estás seguro de eliminar este documento?')) {
      return;
    }

    if (!doc.id) return;

    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.successMessage = 'Documento eliminado exitosamente';
        this.loadDocuments();
      },
      error: (err) => {
        this.errorMessage = String(err || 'Error al eliminar el documento');
      }
    });
  }

  resetForm(): void {
    this.documentType = 'OTHER';
    this.documentNumber = '';
    this.issueDate = '';
    this.expiryDate = '';
    this.description = '';
    this.selectedFile = null;
    
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getDocumentTypeLabel(type: string): string {
    const docType = this.documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-CL');
  }

  isExpired(date: string | Date | undefined): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  getFileUrl(fileUrl: string | undefined): string {
    if (!fileUrl) return '';
    // Si la URL ya es absoluta, devolverla tal cual
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    // Construir la URL completa con el backend
    const apiUrl = environment.apiUrl.replace('/api', '');
    return `${apiUrl}${fileUrl}`;
  }

  goBack(): void {
    this.router.navigate(['/vehiculos']);
  }

  logout(): void {
    this.authService.logout();
  }
}
