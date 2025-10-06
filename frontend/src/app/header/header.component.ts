import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(private router: Router) {}

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToLogin(): void {
    // Por ahora solo log, luego se puede crear el componente de login
    console.log('Ir al login');
  }
}
