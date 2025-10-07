import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      console.log('Datos de login:', loginData);

      // Simular llamada a API
      setTimeout(() => {
        this.isLoading = false;
        // Aquí iría la lógica real de autenticación
        // Por ahora, simularemos un login exitoso
        
        // Ejemplo de manejo de error:
        // this.errorMessage = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
        
        // Si el login es exitoso, redirigir al dashboard
        console.log('Login exitoso');
        // this.router.navigate(['/dashboard']);
      }, 2000);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  goToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  goBack(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/']);
  }
}