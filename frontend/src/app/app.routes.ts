import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VehicleFormComponent } from './vehicle-form/vehicle-form.component';
import { SeguimientoMantenimientoComponent } from './seguimiento-mantenimiento/seguimiento-mantenimiento.component';
import { RegistrarSoapComponent } from './registrar-soap/registrar-soap.component';
import { RegistrarSeguroVehicularComponent } from './registrar-seguro-vehicular/registrar-seguro-vehicular.component';
import { VehiculosComponent } from './vehiculos/vehiculos.component';
import { VerVehiculoComponent } from './ver-vehiculo/ver-vehiculo.component';
import { MainHeaderComponent } from './main-header/main-header.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';
import { CombustibleComponent } from './combustible/combustible.component';
import { AgregarCombustibleComponent } from './agregar-combustible/agregar-combustible.component';
import { CalculadorasComponent } from './calculadoras/calculadoras.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'vehicle-form', component: VehicleFormComponent },
  { path: 'seguimiento-mantenimiento', component: SeguimientoMantenimientoComponent },
  { path: 'seguimiento-mantenimiento/:id', component: SeguimientoMantenimientoComponent },
  { path: 'registrar-soap/:id', component: RegistrarSoapComponent },
  { path: 'registrar-seguro/:id', component: RegistrarSeguroVehicularComponent },
  { path: 'vehiculos', component: VehiculosComponent },
  { path: 'vehiculo/:id', component: VerVehiculoComponent },
  { path: 'combustible/:id', component: CombustibleComponent },
  { path: 'agregar-combustible/:id', component: AgregarCombustibleComponent },
  { path: 'mantenimiento', component: MantenimientoComponent },
  { path: 'calculadoras', component: CalculadorasComponent },
  { path: '**', redirectTo: '' },
];

