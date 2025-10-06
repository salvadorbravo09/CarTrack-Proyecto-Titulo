import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FeatureCardComponent } from '../feature-card/feature-card.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FeatureCardComponent, HeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  
  constructor(private router: Router) {}

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
