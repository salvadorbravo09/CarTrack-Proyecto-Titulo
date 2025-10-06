import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterData } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.minLength(3)]], // Si se proporciona, debe tener al menos 3 caracteres
      email: ['', [Validators.required, Validators.email]],
      phone: [''], // Campo opcional
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  // Método para verificar si un campo es inválido
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    if (fieldName === 'username') {
      // Para username, solo mostrar error si tiene contenido y es inválido
      return !!(
        field &&
        field.value &&
        field.invalid &&
        (field.dirty || field.touched)
      );
    }
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Método para verificar si las contraseñas coinciden
  passwordMismatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    const confirmPasswordField = this.registerForm.get('confirmPassword');
    return (
      password !== confirmPassword && (confirmPasswordField?.touched || false)
    );
  }

  // Toggle para mostrar/ocultar contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle para mostrar/ocultar confirmación de contraseña
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Método para enviar el formulario
  async onSubmit(): Promise<void> {
    if (this.registerForm.valid && !this.passwordMismatch()) {
      this.isLoading = true;

      try {
        const formData = this.registerForm.value;
        const { confirmPassword, ...userData } = formData;

        // Limpiar campos vacíos opcionales
        if (!userData.username) delete userData.username;
        if (!userData.phone) delete userData.phone;

        this.authService.register(userData as RegisterData).subscribe({
          next: (result) => {
            if (result.success) {
              // Guardar token y usuario
              if (result.token) this.authService.setToken(result.token);
              if (result.user) this.authService.setUser(result.user);

              alert('¡Cuenta creada exitosamente!');
              this.router.navigate(['/']);
            } else {
              alert(result.message || 'Error al crear la cuenta');
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al registrar:', error);
            let errorMessage = 'Error de conexión. Intenta nuevamente.';

            if (error.status === 0) {
              errorMessage =
                'No se puede conectar al servidor. Verifica que el backend esté corriendo.';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.status === 400) {
              errorMessage =
                'Datos inválidos. Verifica los campos del formulario.';
            } else if (error.status === 500) {
              errorMessage = 'Error interno del servidor. Intenta más tarde.';
            }

            alert(errorMessage);
            this.isLoading = false;
          },
        });
      } catch (error) {
        console.error('Error inesperado:', error);
        alert('Error inesperado. Intenta nuevamente.');
        this.isLoading = false;
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  // Navegar al login
  goToLogin(event: Event): void {
    event.preventDefault();
    // Por ahora solo navegamos al inicio, luego se puede crear un componente de login
    this.router.navigate(['/']);
  }

  // Volver al inicio
  goBack(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/']);
  }
}
