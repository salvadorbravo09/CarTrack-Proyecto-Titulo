import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VehicleFormComponent } from './vehicle-form/vehicle-form.component';
import { SeguimientoMantenimientoComponent } from './seguimiento-mantenimiento/seguimiento-mantenimiento.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'vehicle-form', component: VehicleFormComponent },
  { path: 'seguimiento-mantenimiento', component: SeguimientoMantenimientoComponent },
  { path: '**', redirectTo: '' },
];